import { projects, type CuratedProject } from "@/content/projects";
import type { SnapshotRepo } from "./github-types";
import { snapshotRepo } from "./snapshot";

export type ProjectView = CuratedProject & {
  // Present only when the sync script confirmed the repository is public.
  repoData?: SnapshotRepo;
  sourceUrl?: string;
  images: { src: string; alt: string }[];
};

function toView(p: CuratedProject): ProjectView {
  const repoData = snapshotRepo(p.repo);
  const images =
    p.screenshots ??
    (repoData?.analysis.screenshots ?? []).map((s) => ({
      src: s.src,
      alt: `Screenshot from the ${p.title} repository (${s.path})`,
    }));
  return { ...p, repoData, sourceUrl: repoData?.htmlUrl, images };
}

export function getProjects(): ProjectView[] {
  return projects.filter((p) => !p.hidden).map(toView);
}

export function getProject(slug: string): ProjectView | undefined {
  const p = projects.find((x) => x.slug === slug && !x.hidden);
  return p && toView(p);
}

// Slug of the curated project that showcases a given repository, if any.
export function projectSlugForRepo(fullName: string): string | undefined {
  return projects.find((p) => !p.hidden && p.repo?.toLowerCase() === fullName.toLowerCase())?.slug;
}

export function ownershipLabel(p: ProjectView): string {
  const o = p.repoData?.analysis.ownership;
  if (!p.repo) return "Private code";
  if (!o) return "Public repository";
  if (o.soleAuthor) return `Solo · ${o.yourCommits} commit${o.yourCommits === 1 ? "" : "s"}`;
  if (o.yourCommits === 0) return `Team · ${o.contributors.length} contributors`;
  return `Team · ${o.yourCommits} of ${o.totalCommits} commits`;
}
