import { site } from "@/content/site";
import type { LiveRepo, RepoCategory } from "./github-types";
import { projectSlugForRepo } from "./projects";
import { snapshotRepo } from "./snapshot";

export type ShowcaseRepo = {
  name: string;
  description: string | null;
  htmlUrl: string;
  homepage: string | null;
  language: string | null;
  stars: number;
  forks: number;
  pushedAt: string;
  archived: boolean;
  category: RepoCategory;
  // False for repositories created after the last sync: shown, but unclassified.
  analysed: boolean;
  tech: string[];
  featuredRank: number | null;
  projectSlug?: string;
};

const lower = (s: string) => s.toLowerCase();

// Homepages that just point back at GitHub are not demos.
function demoUrl(homepage: string | null): string | null {
  if (!homepage) return null;
  try {
    const host = new URL(homepage).hostname;
    return host === "github.com" || host === "www.github.com" ? null : homepage;
  } catch {
    return null;
  }
}

export function buildShowcase(repos: LiveRepo[], username: string) {
  const hidden = new Set(site.github.hiddenRepos.map(lower));
  const featured = site.github.featuredRepos.map(lower);

  const all: ShowcaseRepo[] = repos
    .filter((r) => !hidden.has(lower(r.name)))
    .map((r) => {
      const full = `${username}/${r.name}`;
      const snap = snapshotRepo(full);
      const category: RepoCategory = snap?.analysis.category ?? (r.fork ? "fork" : "project");
      const rank = featured.indexOf(lower(r.name));
      return {
        name: r.name,
        // The README's opening paragraph is usually a better pitch than the
        // one-line GitHub description, so prefer it when the sync found one.
        description: snap?.analysis.readme?.summary ?? r.description ?? null,
        htmlUrl: r.htmlUrl,
        homepage: demoUrl(r.homepage),
        language: r.language,
        stars: r.stars,
        forks: r.forks,
        pushedAt: r.pushedAt,
        archived: r.archived,
        category,
        analysed: Boolean(snap),
        tech: (snap?.analysis.tech ?? []).filter((t) => t !== r.language),
        featuredRank: rank === -1 ? null : rank,
        projectSlug: projectSlugForRepo(full),
      };
    });

  const empty = all.filter((r) => r.category === "empty" || r.category === "profile");
  return { repos: all.filter((r) => !empty.includes(r)), emptyCount: empty.length };
}
