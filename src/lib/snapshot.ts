import data from "@/data/github-snapshot.json";
import type { Snapshot, SnapshotRepo } from "./github-types";

// JSON imports infer overly narrow literal types; the sync script guarantees the shape.
export const snapshot = data as unknown as Snapshot;

const byFullName = new Map<string, SnapshotRepo>(
  [...snapshot.repos, ...snapshot.externalRepos].map((r) => [r.fullName.toLowerCase(), r]),
);

export function snapshotRepo(fullName: string | undefined): SnapshotRepo | undefined {
  return fullName ? byFullName.get(fullName.toLowerCase()) : undefined;
}
