import type { MetadataRoute } from "next";
import { getProjects } from "@/lib/projects";
import { siteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return [
    { url: new URL("/", base).toString(), changeFrequency: "weekly", priority: 1 },
    ...["/projects", "/experience", "/contact"].map((path) => ({
      url: new URL(path, base).toString(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...getProjects().map((p) => ({
      url: new URL(`/projects/${p.slug}`, base).toString(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
