import Image from "next/image";
import Link from "next/link";
import { getProjects, ownershipLabel, type ProjectView } from "@/lib/projects";
import { ArrowRightIcon, ExternalIcon, GitHubIcon, LockIcon, UsersIcon } from "./icons";
import { Reveal } from "./motion";
import { Chip, SectionHeading } from "./section-heading";

export function StatusChip({ status }: { status: ProjectView["status"] }) {
  return (
    <Chip tone={status === "In progress" ? "warn" : status === "Deployed" || status === "Shipped" ? "ok" : "default"}>
      {status}
    </Chip>
  );
}

// Card cover: the first screenshot if there is one, otherwise a small
// generated "terminal" panel built from the project's own data.
function Cover({ p }: { p: ProjectView }) {
  const img = p.images[0];
  return (
    <div className="relative h-40 overflow-hidden border-b border-line bg-[#16151d]">
      {img ? (
        <Image src={img.src} alt={img.alt} fill sizes="320px" className="object-cover object-top" />
      ) : (
        <div className="absolute inset-0 p-4 font-mono text-[0.7rem] leading-5">
          <div
            aria-hidden
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgb(61 58 77 / .35) 1px, transparent 1px), linear-gradient(to bottom, rgb(61 58 77 / .35) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          />
          <div aria-hidden className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent-strong/25 blur-2xl" />
          <div className="relative">
            <p className="text-accent">❯ cd ~/{p.slug}</p>
            <p className="mt-1 text-muted">{p.kind.toLowerCase()} · {p.status.toLowerCase()}</p>
            <p className="mt-1 text-dim">stack: {p.stack.slice(0, 4).join(", ").toLowerCase()}</p>
            <p className="mt-1 text-dim">{p.repo ? `repo: ${p.repo}` : "repo: private"}</p>
          </div>
        </div>
      )}
      {p.period ? (
        <span className="absolute right-3 top-3 rounded-md bg-black/80 px-2 py-0.5 font-mono text-[0.7rem] font-bold text-white">
          {p.period}
        </span>
      ) : null}
    </div>
  );
}

function FanCard({ p, position }: { p: ProjectView; position: "left" | "center" | "right" }) {
  const placement = {
    left: "md:absolute md:left-1/2 md:top-10 md:-translate-x-[118%] md:-rotate-[7deg] md:z-10",
    center: "md:absolute md:left-1/2 md:top-0 md:-translate-x-1/2 md:z-20",
    right: "md:absolute md:left-1/2 md:top-10 md:translate-x-[18%] md:rotate-[7deg] md:z-10",
  }[position];
  return (
    <Link
      href={`/projects/${p.slug}`}
      className={`panel group block w-full overflow-hidden !bg-panel shadow-[0_30px_60px_-30px_rgb(0_0_0/0.9)] transition-[transform,box-shadow,border-color] duration-300 hover:z-30 hover:border-accent/50 md:w-[19rem] md:hover:-translate-y-3 ${placement}`}
    >
      <Cover p={p} />
      <div className="p-5">
        <h3 className="text-lg font-extrabold leading-snug text-ink">{p.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{p.tagline}</p>
        <div className="mt-5 flex items-center justify-between gap-2 border-t border-line pt-4">
          <span className="flex flex-wrap gap-1.5">
            {p.stack.slice(0, 2).map((s) => (
              <Chip key={s}>{s}</Chip>
            ))}
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-bold text-accent group-hover:text-accent-soft">
            View <ArrowRightIcon />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function LatestProjects() {
  const featured = getProjects().filter((p) => p.featured);
  const [center, left, right] = featured;
  if (!center) return null;

  return (
    <section id="latest" aria-labelledby="latest-title" className="py-16">
      <SectionHeading
        id="latest-title"
        cmd="ls ~/projects --latest"
        title="Latest Projects"
        subtitle="Thesis, internship and personal work"
        more={{ href: "/projects", label: "View All Projects" }}
      />
      <Reveal>
        <div className="flex flex-col gap-5 md:relative md:block md:h-[27rem]">
          {/* Center card first in the DOM so it is read first. */}
          <FanCard p={center} position="center" />
          {left ? <FanCard p={left} position="left" /> : null}
          {right ? <FanCard p={right} position="right" /> : null}
        </div>
      </Reveal>
    </section>
  );
}

export function ProjectCard({ p }: { p: ProjectView }) {
  return (
    <article className="panel lift group relative flex h-full flex-col overflow-hidden">
      <Cover p={p} />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Chip tone="accent">{p.kind}</Chip>
          <StatusChip status={p.status} />
        </div>
        <h3 className="mt-3 text-xl font-extrabold text-ink">
          <Link href={`/projects/${p.slug}`} className="after:absolute after:inset-0 after:content-['']">
            {p.title}
          </Link>
        </h3>
        <p className="mt-1 text-sm font-semibold text-accent-soft/80">{p.tagline}</p>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">{p.summary}</p>
        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Tech stack">
          {p.stack.slice(0, 5).map((s) => (
            <li key={s}>
              <Chip>{s}</Chip>
            </li>
          ))}
          {p.stack.length > 5 ? (
            <li>
              <Chip>+{p.stack.length - 5}</Chip>
            </li>
          ) : null}
        </ul>
        <div className="mt-auto pt-5">
          <p className="flex items-center gap-2 font-mono text-xs text-dim">
            {p.repo ? <UsersIcon /> : <LockIcon />}
            {ownershipLabel(p)}
          </p>
          {/* Above the card-wide overlay link so they stay clickable. */}
          <div className="relative z-10 mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-4 text-sm font-semibold">
            <Link href={`/projects/${p.slug}`} className="inline-flex items-center gap-1.5 text-accent hover:text-accent-soft" aria-label={`${p.title} case study`}>
              Case study <ArrowRightIcon />
            </Link>
            {p.sourceUrl ? (
              <a href={p.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-muted hover:text-ink">
                <GitHubIcon /> Source
              </a>
            ) : null}
            {p.demoUrl ? (
              <a href={p.demoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-muted hover:text-ink">
                <ExternalIcon /> {p.demoLabel ?? "Live demo"}
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
