// Shapes of the build-time snapshot written by scripts/sync-github.mts and of
// the normalized data the site renders.

export type RepoCategory = "project" | "in-progress" | "coursework" | "empty" | "profile" | "fork";

export type RepoAnalysis = {
  category: RepoCategory;
  categoryReasons: string[];
  commits: number;
  releases: number;
  fileCount: number;
  treeTruncated: boolean;
  topDirs: string[];
  tech: string[];
  readme: {
    title: string | null;
    summary: string | null;
    headings: string[];
    features: string[];
  } | null;
  ownership: {
    yourCommits: number;
    totalCommits: number;
    contributors: { login: string; commits: number }[];
    soleAuthor: boolean;
  };
  screenshots: { src: string; path: string }[];
};

export type SnapshotRepo = {
  name: string;
  fullName: string;
  owner: string;
  description: string | null;
  htmlUrl: string;
  homepage: string | null;
  language: string | null;
  languages: Record<string, number>;
  stars: number;
  forks: number;
  fork: boolean;
  archived: boolean;
  topics: string[];
  license: string | null;
  createdAt: string;
  pushedAt: string;
  analysis: RepoAnalysis;
};

export type ContributionDay = { date: string; count: number; level: number };

export type Contributions = {
  source: "github-graphql" | "jogruber";
  // All-time total: the sum of every year's total.
  total: number;
  // Newest year first.
  years: { year: number; total: number }[];
  // Every day since the first contribution year, oldest first.
  days: ContributionDay[];
};

export type Profile = {
  login: string;
  name: string | null;
  avatarUrl: string;
  bio: string | null;
  publicRepos: number;
  followers: number;
  following: number;
  htmlUrl: string;
  createdAt: string;
};

export type Snapshot = {
  generatedAt: string;
  username: string;
  profile: Profile;
  stars: number;
  contributions: Contributions | null;
  repos: SnapshotRepo[];
  externalRepos: SnapshotRepo[];
};

// Where a value shown on the page came from.
export type Provenance =
  | { kind: "live"; fetchedAt: string; via: string }
  | { kind: "snapshot"; generatedAt: string; reason: string };

export type LiveRepo = Omit<SnapshotRepo, "languages" | "analysis" | "owner" | "fullName" | "topics" | "license">;
