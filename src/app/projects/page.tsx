import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { RepositoriesSection, RepositoriesSkeleton } from "@/components/github/github-section";
import { ArrowRightIcon } from "@/components/icons";
import { Reveal } from "@/components/motion";
import { ProjectCard, StatusChip } from "@/components/project-cards";
import { Chip, SectionHeading } from "@/components/section-heading";
import { getProjects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Projects",
  description: "Thesis, internship, team and personal projects, plus every public GitHub repository.",
  alternates: { canonical: "/projects" },
};

export default function ProjectsPage() {
  const all = getProjects();
  const featured = all.filter((p) => p.featured);
  const others = all.filter((p) => !p.featured);

  return (
    <div className="pt-12 lg:pt-20">
      <SectionHeading
        id="projects-title"
        cmd="ls -la ~/projects"
        as="h1"
        title="Projects"
        subtitle="Each case study covers what the project does, how it's built and which parts were mine, labelled by whether that comes from commit history or from my own notes."
      />

      <ul className="grid gap-5 sm:grid-cols-2">
        {featured.map((p, i) => (
          <Reveal as="li" key={p.slug} delay={(i % 2) * 0.05}>
            <ProjectCard p={p} />
          </Reveal>
        ))}
      </ul>

      {others.length > 0 ? (
        <Reveal className="mt-10">
          <h2 className="text-lg font-extrabold text-ink">More projects</h2>
          <ul className="panel mt-4 divide-y divide-line overflow-hidden">
            {others.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/projects/${p.slug}`}
                  className="group flex flex-col gap-1 px-5 py-4 transition-colors hover:bg-bg-elev/60 sm:flex-row sm:items-center sm:gap-4"
                >
                  <span className="font-extrabold text-ink group-hover:text-accent-soft">{p.title}</span>
                  <span className="text-sm text-muted">{p.tagline}</span>
                  <span className="flex items-center gap-2 sm:ml-auto">
                    <Chip>{p.kind}</Chip>
                    <StatusChip status={p.status} />
                    <ArrowRightIcon className="text-dim group-hover:text-accent" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      ) : null}

      <Suspense fallback={<RepositoriesSkeleton />}>
        <RepositoriesSection />
      </Suspense>
    </div>
  );
}
