"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatDate, languageColor } from "@/lib/format";
import type { RepoCategory } from "@/lib/github-types";
import type { ShowcaseRepo } from "@/lib/repos";
import { ArrowRightIcon, ExternalIcon, ForkIcon, PinIcon, StarIcon } from "../icons";

type Sort = "featured" | "updated" | "stars" | "name";

const PRIMARY: RepoCategory[] = ["project", "in-progress"];

const CATEGORY_LABEL: Record<RepoCategory, { text: string; className: string }> = {
  project: { text: "project", className: "border-ok/30 text-ok" },
  "in-progress": { text: "in progress", className: "border-warn/30 text-warn" },
  coursework: { text: "coursework", className: "border-accent/30 text-accent" },
  fork: { text: "fork", className: "border-line-strong text-muted" },
  empty: { text: "empty", className: "border-line-strong text-muted" },
  profile: { text: "profile", className: "border-line-strong text-muted" },
};

function compare(sort: Sort) {
  return (a: ShowcaseRepo, b: ShowcaseRepo) => {
    switch (sort) {
      case "featured": {
        const ra = a.featuredRank ?? Infinity;
        const rb = b.featuredRank ?? Infinity;
        if (ra !== rb) return ra - rb;
        return b.pushedAt.localeCompare(a.pushedAt);
      }
      case "updated":
        return b.pushedAt.localeCompare(a.pushedAt);
      case "stars":
        return b.stars - a.stars || b.pushedAt.localeCompare(a.pushedAt);
      case "name":
        return a.name.localeCompare(b.name);
    }
  };
}

export function RepoShowcase({ repos, emptyCount }: { repos: ShowcaseRepo[]; emptyCount: number }) {
  const [language, setLanguage] = useState<string>("All");
  const [sort, setSort] = useState<Sort>("featured");
  const [showAll, setShowAll] = useState(false);

  const pool = useMemo(
    () => (showAll ? repos : repos.filter((r) => PRIMARY.includes(r.category) && !r.archived)),
    [repos, showAll],
  );
  const secondaryCount = repos.length - repos.filter((r) => PRIMARY.includes(r.category) && !r.archived).length;

  const languages = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of pool) if (r.language) counts.set(r.language, (counts.get(r.language) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [pool]);

  const activeLanguage = language !== "All" && !languages.some(([l]) => l === language) ? "All" : language;
  const visible = pool.filter((r) => activeLanguage === "All" || r.language === activeLanguage).sort(compare(sort));

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <fieldset>
          <legend className="sr-only">Filter by language</legend>
          <div className="flex flex-wrap gap-2">
            {[["All", pool.length] as const, ...languages].map(([lang, count]) => {
              const selected = activeLanguage === lang;
              return (
                <button
                  key={lang}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setLanguage(lang)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-xs transition-colors ${
                    selected
                      ? "border-accent/60 bg-accent-strong/10 text-accent-soft"
                      : "border-line text-muted hover:border-line-strong hover:text-ink"
                  }`}
                >
                  {lang !== "All" ? (
                    <span aria-hidden className="h-2 w-2 rounded-full" style={{ background: languageColor(lang) }} />
                  ) : null}
                  {lang}
                  <span className="text-dim">{count}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 font-mono text-xs text-muted">
            sort
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="rounded-md border border-line bg-bg-elev px-2 py-1.5 text-ink"
            >
              <option value="featured">Pinned first</option>
              <option value="updated">Recently updated</option>
              <option value="stars">Stars</option>
              <option value="name">Name</option>
            </select>
          </label>
          {secondaryCount > 0 ? (
            <label className="flex cursor-pointer items-center gap-2 font-mono text-xs text-muted">
              <input
                type="checkbox"
                checked={showAll}
                onChange={(e) => setShowAll(e.target.checked)}
                className="h-4 w-4 accent-accent-400"
              />
              include coursework &amp; forks ({secondaryCount})
            </label>
          ) : null}
        </div>
      </div>

      <p className="mt-4 font-mono text-xs text-dim" aria-live="polite">
        showing {visible.length} of {repos.length} public repositories
        {emptyCount > 0 ? ` · ${emptyCount} empty or profile repo${emptyCount === 1 ? "" : "s"} not listed` : ""}
      </p>

      {visible.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-line p-8 text-center text-sm text-muted">
          No repositories match this filter.
        </p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((r) => {
            const cat = CATEGORY_LABEL[r.category];
            return (
              <li key={r.name} className="panel lift flex flex-col p-5">
                <div className="flex items-start gap-2">
                  <h4 className="min-w-0 flex-1 font-mono text-sm font-semibold">
                    <a href={r.htmlUrl} target="_blank" rel="noreferrer" className="break-words text-ink hover:text-accent-soft">
                      {r.name}
                    </a>
                  </h4>
                  {r.featuredRank !== null ? (
                    <span className="text-accent" title="Pinned">
                      <PinIcon title="Pinned repository" />
                    </span>
                  ) : null}
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className={`rounded border px-1.5 font-mono text-[0.65rem] leading-5 ${cat.className}`}>
                    {r.analysed ? cat.text : "not analysed yet"}
                  </span>
                  {r.archived ? (
                    <span className="rounded border border-line-strong px-1.5 font-mono text-[0.65rem] leading-5 text-muted">
                      archived
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">
                  {r.description ?? <span className="italic text-dim">No description.</span>}
                </p>
                {r.tech.length > 0 ? (
                  <p className="mt-3 line-clamp-1 font-mono text-[0.7rem] text-dim">{r.tech.slice(0, 5).join(" · ")}</p>
                ) : null}

                <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-4 font-mono text-xs text-muted">
                  {r.language ? (
                    <span className="inline-flex items-center gap-1.5">
                      <span aria-hidden className="h-2.5 w-2.5 rounded-full" style={{ background: languageColor(r.language) }} />
                      {r.language}
                    </span>
                  ) : null}
                  <span className="inline-flex items-center gap-1" aria-label={`${r.stars} stars`}>
                    <StarIcon /> {r.stars}
                  </span>
                  <span className="inline-flex items-center gap-1" aria-label={`${r.forks} forks`}>
                    <ForkIcon /> {r.forks}
                  </span>
                  <span className="text-dim">updated {formatDate(r.pushedAt)}</span>
                </div>

                {r.projectSlug || r.homepage ? (
                  <div className="mt-4 flex flex-wrap gap-4 border-t border-line pt-3 text-sm">
                    {r.projectSlug ? (
                      <Link href={`/projects/${r.projectSlug}`} className="inline-flex items-center gap-1.5 text-accent-soft hover:text-accent">
                        Case study <ArrowRightIcon />
                      </Link>
                    ) : null}
                    {r.homepage ? (
                      <a href={r.homepage} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-muted hover:text-ink">
                        <ExternalIcon /> Website
                      </a>
                    ) : null}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
