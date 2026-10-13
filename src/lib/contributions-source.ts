// Fetches the complete contribution history (every year since the account
// was created). Shared by the site (src/lib/github.ts) and the sync script,
// so it must stay framework-free: no Next.js imports, no path aliases.
//
// With a token: GitHub's GraphQL API (official). Without: the public
// github-contributions-api.jogruber.de mirror of the profile calendar.

import type { ContributionDay, Contributions } from "./github-types";

const TIMEOUT_MS = 10000;

const LEVELS: Record<string, number> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

type Calendar = {
  totalContributions: number;
  weeks: { contributionDays: { date: string; contributionCount: number; contributionLevel: string }[] }[];
};

async function graphql<T>(token: string, query: string, variables: Record<string, unknown>): Promise<T> {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`GitHub GraphQL responded ${res.status}`);
  const body = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (!body.data) throw new Error(body.errors?.[0]?.message ?? "GitHub GraphQL returned no data");
  return body.data;
}

function finish(source: Contributions["source"], yearTotals: Map<number, number>, days: ContributionDay[]): Contributions {
  // Calendars include the rest of the current year; drop future dates.
  const today = new Date().toISOString().slice(0, 10);
  const unique = new Map<string, ContributionDay>();
  for (const d of days) if (d.date <= today) unique.set(d.date, d);
  const sorted = [...unique.values()].sort((a, b) => a.date.localeCompare(b.date));
  const years = [...yearTotals.entries()]
    .map(([year, total]) => ({ year, total }))
    .sort((a, b) => b.year - a.year);
  return { source, total: years.reduce((n, y) => n + y.total, 0), years, days: sorted };
}

async function fromGraphql(username: string, token: string): Promise<Contributions> {
  const first = await graphql<{ user: { contributionsCollection: { contributionYears: number[] } } | null }>(
    token,
    "query($login:String!){user(login:$login){contributionsCollection{contributionYears}}}",
    { login: username },
  );
  if (!first.user) throw new Error(`GitHub user ${username} not found`);
  const years = first.user.contributionsCollection.contributionYears;

  // One request for every year, using aliases (y2026, y2025, ...).
  const fields = years
    .map(
      (y) =>
        `y${y}: contributionsCollection(from:"${y}-01-01T00:00:00Z", to:"${y}-12-31T23:59:59Z"){contributionCalendar{totalContributions weeks{contributionDays{date contributionCount contributionLevel}}}}`,
    )
    .join(" ");
  const data = await graphql<{ user: Record<string, { contributionCalendar: Calendar }> }>(
    token,
    `query($login:String!){user(login:$login){${fields}}}`,
    { login: username },
  );

  const totals = new Map<number, number>();
  const days: ContributionDay[] = [];
  for (const y of years) {
    const cal = data.user[`y${y}`].contributionCalendar;
    totals.set(y, cal.totalContributions);
    for (const w of cal.weeks) {
      for (const d of w.contributionDays) {
        // Calendars are padded to whole weeks; keep only this year's days.
        if (d.date.startsWith(`${y}-`)) {
          days.push({ date: d.date, count: d.contributionCount, level: LEVELS[d.contributionLevel] ?? 0 });
        }
      }
    }
  }
  return finish("github-graphql", totals, days);
}

async function fromMirror(username: string): Promise<Contributions> {
  const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}?y=all`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Contributions mirror responded ${res.status}`);
  const body = (await res.json()) as { total: Record<string, number>; contributions: ContributionDay[] };
  const totals = new Map(Object.entries(body.total).map(([y, n]) => [Number(y), n] as [number, number]));
  return finish("jogruber", totals, body.contributions);
}

export async function fetchAllContributions(
  username: string,
  token: string | undefined,
): Promise<{ data: Contributions; via: string }> {
  if (token) return { data: await fromGraphql(username, token), via: "GitHub GraphQL API" };
  return { data: await fromMirror(username), via: "github-contributions-api.jogruber.de" };
}
