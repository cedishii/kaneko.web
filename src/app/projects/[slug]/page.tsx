import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, ArrowRightIcon, ExternalIcon, GitHubIcon, LockIcon, ShieldIcon } from "@/components/icons";
import { Reveal } from "@/components/motion";
import { StatusChip } from "@/components/project-cards";
import { Chip } from "@/components/section-heading";
import type { Evidence } from "@/content/projects";
import { formatDate, formatNumber, languageColor } from "@/lib/format";
import { getProject, getProjects, ownershipLabel } from "@/lib/projects";

export function generateStaticParams() {
  return getProjects().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  return {
    title: p.title,
    description: `${p.tagline}. ${p.summary}`.slice(0, 300),
    alternates: { canonical: `/projects/${p.slug}` },
    openGraph: { title: p.title, description: p.tagline, url: `/projects/${p.slug}` },
  };
}

const EVIDENCE: Record<Evidence, { label: string; tone: "ok" | "accent" | "warn" }> = {
  "sole-author": { label: "sole author", tone: "ok" },
  "commit-history": { label: "in commit history", tone: "accent" },
  "self-reported": { label: "self-reported", tone: "warn" },
};

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Reveal as="section" className="mt-12 first:mt-0">
      <h2 className="font-mono text-xs text-accent">{`// ${title}`}</h2>
      <div className="mt-4">{children}</div>
    </Reveal>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5 text-[0.95rem] leading-relaxed text-muted">
      {items.map((i) => (
        <li key={i} className="flex gap-3">
          <span aria-hidden className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-accent-strong/70" />
          {i}
        </li>
      ))}
    </ul>
  );
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();

  const all = getProjects();
  const idx = all.findIndex((x) => x.slug === p.slug);
  const prev = all[(idx - 1 + all.length) % all.length];
  const next = all[(idx + 1) % all.length];

  const repo = p.repoData;
  const langTotal = repo ? Object.values(repo.languages).reduce((a, b) => a + b, 0) : 0;
  const langs = repo
    ? Object.entries(repo.languages)
        .map(([name, bytes]) => ({ name, pct: (bytes / langTotal) * 100 }))
        .filter((l) => l.pct >= 0.5)
    : [];

  return (
    <article className="pb-8 pt-12 lg:pt-20">
      <Link href="/projects" className="inline-flex items-center gap-2 font-mono text-xs text-muted hover:text-accent">
        <ArrowLeftIcon /> all projects
      </Link>

      <Reveal as="div" className="mt-8">
        <div className="flex flex-wrap items-center gap-2">
          <Chip tone="accent">{p.kind}</Chip>
          <StatusChip status={p.status} />
          {p.period ? <span className="font-mono text-xs text-dim">{p.period}</span> : null}
        </div>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">{p.title}</h1>
        <p className="mt-3 max-w-3xl text-lg text-accent-soft/85">{p.tagline}</p>
        <p className="mt-2 font-mono text-sm text-dim">{p.role}</p>

        <div className="mt-8 flex flex-wrap gap-3">
          {p.sourceUrl ? (
            <a
              href={p.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-accent/50 bg-accent-strong/10 px-4 py-2.5 font-mono text-sm text-accent-soft transition hover:bg-accent-strong/20"
            >
              <GitHubIcon /> View source
            </a>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-lg border border-line px-4 py-2.5 font-mono text-sm text-dim">
              <LockIcon /> Source not public
            </span>
          )}
          {p.demoUrl ? (
            <a
              href={p.demoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-line-strong px-4 py-2.5 font-mono text-sm text-ink transition hover:border-accent/60 hover:text-accent"
            >
              <ExternalIcon /> {p.demoLabel ?? "Live demo"}
            </a>
          ) : null}
        </div>
      </Reveal>

      <div className="mt-14 grid gap-12 xl:grid-cols-[1fr_17rem]">
        <div>
          <Block title="overview">
            <p className="text-[1.05rem] leading-relaxed text-ink/90">{p.summary}</p>
          </Block>

          {p.features.length > 0 ? (
            <Block title="key features">
              <Bullets items={p.features} />
            </Block>
          ) : null}

          {p.architecture && p.architecture.length > 0 ? (
            <Block title="architecture">
              <Bullets items={p.architecture} />
            </Block>
          ) : null}

          {p.images.length > 0 ? (
            <Block title="screenshots">
              <div className="grid gap-4 sm:grid-cols-2">
                {p.images.map((img) => (
                  <figure key={img.src} className="panel overflow-hidden">
                    <Image src={img.src} alt={img.alt} width={1200} height={750} className="h-auto w-full" />
                  </figure>
                ))}
              </div>
            </Block>
          ) : null}

          <Block title="my contribution">
            <ul className="space-y-3">
              {p.contributions.map((c) => (
                <li key={c.text} className="panel flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:justify-between">
                  <span className="text-[0.95rem] leading-relaxed text-ink/90">{c.text}</span>
                  <span className="shrink-0">
                    <Chip tone={EVIDENCE[c.evidence].tone}>{EVIDENCE[c.evidence].label}</Chip>
                  </span>
                </li>
              ))}
            </ul>
            {p.contributionNote ? (
              <p className="mt-4 flex gap-2 text-sm leading-relaxed text-muted">
                <ShieldIcon className="mt-0.5 shrink-0 text-accent" />
                {p.contributionNote}
              </p>
            ) : null}
          </Block>
        </div>

        <aside className="space-y-5 xl:sticky xl:top-8 xl:self-start">
          <Reveal className="panel p-5">
            <h2 className="font-mono text-xs text-dim">{"// stack"}</h2>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {p.stack.map((s) => (
                <li key={s}>
                  <Chip tone="accent">{s}</Chip>
                </li>
              ))}
            </ul>
          </Reveal>

          {repo ? (
            <Reveal className="panel p-5">
              <h2 className="font-mono text-xs text-dim">{"// repository"}</h2>
              <p className="mt-3 break-all font-mono text-sm text-ink">{repo.fullName}</p>
              {langs.length > 0 ? (
                <div className="mt-4">
                  <div className="flex h-2 overflow-hidden rounded-full bg-line" aria-hidden>
                    {langs.map((l) => (
                      <span key={l.name} style={{ width: `${l.pct}%`, background: languageColor(l.name) }} />
                    ))}
                  </div>
                  <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-muted">
                    {langs.map((l) => (
                      <li key={l.name} className="flex items-center gap-1.5">
                        <span aria-hidden className="h-2 w-2 rounded-full" style={{ background: languageColor(l.name) }} />
                        {l.name} <span className="text-dim">{l.pct.toFixed(1)}%</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <dl className="mt-4 space-y-2 text-sm">
                {[
                  ["ownership", ownershipLabel(p)],
                  ["contributors", String(repo.analysis.ownership.contributors.length)],
                  ["commits", formatNumber(repo.analysis.commits)],
                  ["releases", formatNumber(repo.analysis.releases)],
                  ["created", formatDate(repo.createdAt)],
                  ["last push", formatDate(repo.pushedAt)],
                  ["license", repo.license ?? "none"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4">
                    <dt className="font-mono text-xs text-dim">{k}</dt>
                    <dd className="text-right text-ink/90">{v}</dd>
                  </div>
                ))}
              </dl>
              {repo.analysis.tech.length > 0 ? (
                <p className="mt-4 border-t border-line pt-3 text-xs leading-relaxed text-dim">
                  Detected from manifests and file tree: {repo.analysis.tech.join(", ")}
                </p>
              ) : null}
            </Reveal>
          ) : null}

          <Reveal className="panel p-5">
            <h2 className="font-mono text-xs text-dim">{"// sources"}</h2>
            <p className="mt-3 text-xs leading-relaxed text-muted">This page is based on:</p>
            <ul className="mt-2 space-y-1 text-xs text-muted">
              {p.sources.map((s) => (
                <li key={s}>· {s}</li>
              ))}
            </ul>
          </Reveal>
        </aside>
      </div>

      {all.length > 1 ? (
        <nav aria-label="More projects" className="mt-20 grid gap-4 border-t border-line pt-8 sm:grid-cols-2">
          <Link href={`/projects/${prev.slug}`} className="panel lift group p-5">
            <span className="flex items-center gap-2 font-mono text-xs text-dim">
              <ArrowLeftIcon /> previous
            </span>
            <span className="mt-2 block font-semibold text-ink group-hover:text-accent-soft">{prev.title}</span>
          </Link>
          <Link href={`/projects/${next.slug}`} className="panel lift group p-5 text-right">
            <span className="flex items-center justify-end gap-2 font-mono text-xs text-dim">
              next <ArrowRightIcon />
            </span>
            <span className="mt-2 block font-semibold text-ink group-hover:text-accent-soft">{next.title}</span>
          </Link>
        </nav>
      ) : null}
    </article>
  );
}
