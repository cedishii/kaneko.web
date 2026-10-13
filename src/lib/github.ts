// Live GitHub data for the GitHub section, fetched on the server only.
//
// The whole overview is cached with `use cache` for an hour, so visitors never
// trigger GitHub requests directly and the 60 requests/hour unauthenticated
// limit is never a problem for normal traffic. If any request fails (rate
// limit, outage, timeout), that piece falls back to the build-time snapshot
// and is labelled as such on the page; the failed result is only cached for
// 15 minutes before it is retried.
//
// GITHUB_TOKEN is optional and read server-side only. Without it the
// contribution history comes from github-contributions-api.jogruber.de, a
// public mirror of the profile calendar (see contributions-source.ts).

import { cacheLife, cacheTag } from "next/cache";
import { site } from "@/content/site";
import { fetchAllContributions } from "./contributions-source";
import type { Contributions, LiveRepo, Profile, Provenance } from "./github-types";
import { snapshot } from "./snapshot";

const API = "https://api.github.com";
const TIMEOUT_MS = 8000;

export function githubUsername(): string {
  return process.env.GITHUB_USERNAME || site.github.username;
}

export function isUsernameConfigured(): boolean {
  const u = githubUsername();
  return Boolean(u) && u !== "YOUR_GITHUB_USERNAME";
}

function headers(): HeadersInit {
  const token = process.env.GITHUB_TOKEN;
  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function getJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { ...headers(), ...init?.headers },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) {
    const limited =
      (res.status === 403 || res.status === 429) && res.headers.get("x-ratelimit-remaining") === "0";
    throw new Error(limited ? "GitHub API rate limit reached" : `GitHub API responded ${res.status}`);
  }
  return (await res.json()) as T;
}

async function fetchProfile(username: string): Promise<Profile> {
  const u = await getJson<{
    login: string;
    name: string | null;
    avatar_url: string;
    bio: string | null;
    public_repos: number;
    followers: number;
    following: number;
    html_url: string;
    created_at: string;
  }>(`${API}/users/${encodeURIComponent(username)}`);
  return {
    login: u.login,
    name: u.name,
    avatarUrl: u.avatar_url,
    bio: u.bio,
    publicRepos: u.public_repos,
    followers: u.followers,
    following: u.following,
    htmlUrl: u.html_url,
    createdAt: u.created_at,
  };
}

async function fetchRepos(username: string): Promise<LiveRepo[]> {
  // Lists public repositories only, even when a token is configured.
  const repos = await getJson<
    {
      name: string;
      private: boolean;
      description: string | null;
      html_url: string;
      homepage: string | null;
      language: string | null;
      stargazers_count: number;
      forks_count: number;
      fork: boolean;
      archived: boolean;
      created_at: string;
      pushed_at: string;
    }[]
  >(`${API}/users/${encodeURIComponent(username)}/repos?per_page=100&type=owner&sort=pushed`);
  return repos
    .filter((r) => !r.private)
    .map((r) => ({
      name: r.name,
      description: r.description,
      htmlUrl: r.html_url,
      homepage: r.homepage || null,
      language: r.language,
      stars: r.stargazers_count,
      forks: r.forks_count,
      fork: r.fork,
      archived: r.archived,
      createdAt: r.created_at,
      pushedAt: r.pushed_at,
    }));
}

type Sourced<T> = { data: T; provenance: Provenance };

export type GithubOverview = {
  username: string;
  profile: Sourced<Profile> | null;
  repos: Sourced<LiveRepo[]> | null;
  contributions: Sourced<Contributions> | null;
  errors: string[];
};

function reason(result: PromiseRejectedResult): string {
  return result.reason instanceof Error ? result.reason.message : "Request failed";
}

export async function getGithubOverview(): Promise<GithubOverview> {
  "use cache";
  cacheTag("github");

  const username = githubUsername();
  if (!isUsernameConfigured()) {
    cacheLife("hours");
    return { username, profile: null, repos: null, contributions: null, errors: ["GitHub username is not configured"] };
  }

  const [profile, repos, contributions] = await Promise.allSettled([
    fetchProfile(username),
    fetchRepos(username),
    fetchAllContributions(username, process.env.GITHUB_TOKEN),
  ]);
  const fetchedAt = new Date().toISOString();
  const errors: string[] = [];

  // The snapshot is only a valid fallback if it was taken for this account.
  const snap = snapshot.username.toLowerCase() === username.toLowerCase() ? snapshot : null;
  const fromSnapshot = (why: string): Provenance => ({
    kind: "snapshot",
    generatedAt: snapshot.generatedAt,
    reason: why,
  });

  const out: GithubOverview = { username, profile: null, repos: null, contributions: null, errors };

  if (profile.status === "fulfilled") {
    out.profile = { data: profile.value, provenance: { kind: "live", fetchedAt, via: "GitHub REST API" } };
  } else {
    errors.push(`Profile: ${reason(profile)}`);
    if (snap) out.profile = { data: snap.profile, provenance: fromSnapshot(reason(profile)) };
  }

  if (repos.status === "fulfilled") {
    out.repos = { data: repos.value, provenance: { kind: "live", fetchedAt, via: "GitHub REST API" } };
  } else {
    errors.push(`Repositories: ${reason(repos)}`);
    if (snap) out.repos = { data: snap.repos, provenance: fromSnapshot(reason(repos)) };
  }

  if (contributions.status === "fulfilled") {
    out.contributions = {
      data: contributions.value.data,
      provenance: { kind: "live", fetchedAt, via: contributions.value.via },
    };
  } else {
    errors.push(`Contributions: ${reason(contributions)}`);
    if (snap?.contributions) {
      out.contributions = { data: snap.contributions, provenance: fromSnapshot(reason(contributions)) };
    }
  }

  // Retry failures sooner than healthy data, but not so often that an
  // unauthenticated deployment burns through the hourly rate limit.
  if (errors.length > 0) {
    cacheLife({ stale: 300, revalidate: 900, expire: 86400 });
  } else {
    cacheLife("hours");
  }
  return out;
}
