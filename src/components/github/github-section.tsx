import type { ReactNode } from "react";
import { formatDateTime, formatNumber } from "@/lib/format";
import { getGithubOverview, githubUsername } from "@/lib/github";
import type { Provenance } from "@/lib/github-types";
import { buildShowcase } from "@/lib/repos";
import { AlertIcon, ArrowRightIcon, ExternalIcon } from "../icons";
import { Reveal } from "../motion";
import { SectionHeading } from "../section-heading";
import { ContributionCalendar } from "./contribution-calendar";
import { RepoShowcase } from "./repo-showcase";

export function SourceBadge({ provenance }: { provenance: Provenance }) {
  if (provenance.kind === "live") {
    return (
      <span className="inline-flex items-center gap-1.5 font-mono text-[0.7rem] text-dim">
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-ok" />
        live from {provenance.via} · {formatDateTime(provenance.fetchedAt)}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[0.7rem] text-warn">
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-warn" />
      saved snapshot from {formatDateTime(provenance.generatedAt)} · live request failed: {provenance.reason}
    </span>
  );
}

function Notice({ children }: { children: ReactNode }) {
  return (
    <p role="status" className="flex items-start gap-2 rounded-xl border border-dashed border-line p-6 text-sm text-muted">
      <AlertIcon className="mt-0.5 shrink-0 text-warn" />
      <span>{children}</span>
    </p>
  );
}

function HandleLink({ username }: { username: string }) {
  return (
    <a
      href={`https://github.com/${username}`}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-accent-soft"
    >
      @{username} <ExternalIcon />
    </a>
  );
}

// ---------------------------------------------------------------- Activity

export async function ActivitySection() {
  const { profile, repos, contributions, username, errors } = await getGithubOverview();
  const stars = repos ? repos.data.reduce((n, r) => n + r.stars, 0) : null;
  const since = contributions?.data.years.at(-1)?.year;

  return (
    <section id="activity" aria-labelledby="activity-title" className="py-16">
      <SectionHeading
        id="activity-title"
        cmd="git log --all --oneline | wc -l"
        title="Activity"
        pill={contributions ? `${formatNumber(contributions.data.total)} contributions overall` : undefined}
        aside={<HandleLink username={username} />}
      />

      <Reveal>
        {contributions && contributions.data.days.length > 0 ? (
          <ContributionCalendar days={contributions.data.days} years={contributions.data.years} />
        ) : contributions ? (
          <Notice>No public contributions yet.</Notice>
        ) : (
          <Notice>
            {errors.some((e) => e.includes("not configured"))
              ? "The GitHub username isn't configured yet. Set GITHUB_USERNAME or site.github.username."
              : "The contribution graph couldn't be loaded right now. It retries automatically."}
          </Notice>
        )}
      </Reveal>

      <Reveal className="mt-8">
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["public repos", profile ? formatNumber(profile.data.publicRepos) : null],
            ["followers", profile ? formatNumber(profile.data.followers) : null],
            ["stars received", stars !== null ? formatNumber(stars) : null],
            ["active since", since ? String(since) : null],
          ].map(([label, value]) => (
            <div key={label} className="panel px-4 py-3">
              <dt className="font-mono text-[0.7rem] text-dim">{label}</dt>
              <dd className="mt-1 text-2xl font-extrabold text-ink">{value ?? "—"}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 flex flex-col gap-1">
          {contributions ? <SourceBadge provenance={contributions.provenance} /> : null}
          {profile && profile.provenance.kind !== "live" ? <SourceBadge provenance={profile.provenance} /> : null}
        </p>
      </Reveal>
    </section>
  );
}

export function ActivitySkeleton() {
  return (
    <section id="activity" aria-labelledby="activity-title" className="py-16" aria-busy="true">
      <h2 id="activity-title" className="mb-8 text-3xl font-extrabold text-ink sm:text-[2.1rem]">
        Activity
      </h2>
      <div role="status" aria-label="Loading GitHub activity">
        <div className="skeleton h-36 w-full" />
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="skeleton h-16" />
          ))}
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------ Recently updated

export async function RecentRepos() {
  const { repos, username } = await getGithubOverview();
  if (!repos) return null;
  const recent = buildShowcase(repos.data, username)
    .repos.filter((r) => r.category === "project" || r.category === "in-progress")
    .sort((a, b) => b.pushedAt.localeCompare(a.pushedAt))
    .slice(0, 4);
  if (recent.length === 0) return null;

  return (
    <section aria-labelledby="recent-title" className="pt-16">
      <SectionHeading
        id="recent-title"
        cmd={`gh repo list ${username} --limit 4`}
        title="Recently Updated"
        subtitle="Latest pushes to my public repositories, straight from GitHub"
        more={{ href: `https://github.com/${username}?tab=repositories`, label: "View on GitHub", external: true }}
      />
      <Reveal>
        <ul className="panel divide-y divide-line overflow-hidden">
          {recent.map((r) => (
            <li key={r.name}>
              <a
                href={r.projectSlug ? `/projects/${r.projectSlug}` : r.htmlUrl}
                {...(r.projectSlug ? {} : { target: "_blank", rel: "noreferrer" })}
                className="group flex items-start gap-4 px-5 py-5 transition-colors hover:bg-bg-elev/60"
              >
                <span aria-hidden className="mt-0.5 text-dim group-hover:text-accent">
                  ›
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline gap-x-2.5">
                    <span className="font-mono text-sm text-accent">[{r.pushedAt.slice(0, 10)}]</span>
                    <span className="font-extrabold text-ink">{r.name}</span>
                  </span>
                  {r.description ? <span className="mt-1.5 line-clamp-1 text-sm text-muted">{r.description}</span> : null}
                  <span className="mt-3 flex flex-wrap gap-1.5">
                    {[r.language, ...r.tech]
                      .filter((t): t is string => Boolean(t))
                      .slice(0, 4)
                      .map((t) => (
                        <span key={t} className="rounded-md border border-line-strong bg-bg-elev px-2 py-0.5 font-mono text-[0.7rem] text-muted">
                          #{t}
                        </span>
                      ))}
                  </span>
                </span>
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line text-muted group-hover:border-accent/50 group-hover:text-accent-soft">
                  <ArrowRightIcon />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}

// ------------------------------------------------- Repository showcase

export async function RepositoriesSection() {
  const { repos, username } = await getGithubOverview();
  const showcase = repos ? buildShowcase(repos.data, username) : null;

  return (
    <section aria-labelledby="repos-title" className="pt-20">
      <SectionHeading
        id="repos-title"
        cmd={`gh repo list ${username} --public`}
        title="All Repositories"
        subtitle="Every public repository, labelled by a build-time analysis of its README, file tree and commit history."
      />
      {repos ? (
        <p className="-mt-4 mb-6">
          <SourceBadge provenance={repos.provenance} />
        </p>
      ) : null}
      {showcase ? (
        <RepoShowcase repos={showcase.repos} emptyCount={showcase.emptyCount} />
      ) : (
        <Notice>
          Repositories couldn&apos;t be loaded right now.{" "}
          <a className="text-accent-soft underline" href={`https://github.com/${githubUsername()}?tab=repositories`}>
            View them on GitHub
          </a>
          .
        </Notice>
      )}
    </section>
  );
}

export function RepositoriesSkeleton() {
  return (
    <section aria-label="Loading repositories" className="pt-20" aria-busy="true">
      <div className="skeleton h-9 w-64" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="skeleton h-44" />
        ))}
      </div>
    </section>
  );
}
