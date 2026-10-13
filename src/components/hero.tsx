import Link from "next/link";
import { site } from "@/content/site";
import { DownloadIcon, FileIcon, MapPinIcon } from "./icons";
import { Reveal } from "./motion";
import { PixelLock } from "./pixel-lock";
import { Prompt } from "./prompt";

// Small glassy cubes that drift around the headline.
const CUBES = [
  { top: "12%", left: "48%", delay: "0s" },
  { top: "17%", left: "74%", delay: "-1.2s" },
  { top: "52%", left: "56%", delay: "-0.6s" },
  { top: "68%", left: "36%", delay: "-1.8s" },
];

function Cube() {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-accent/40 bg-accent-strong/15 shadow-[0_0_14px_rgb(139_92_246/0.4)]">
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
        <path d="M8 1.5 14 5v6L8 14.5 2 11V5l6-3.5Z" fill="#a78bfa" />
        <path d="M8 8v6.5M8 8l6-3M8 8 2 5" stroke="#121118" strokeWidth="1" fill="none" />
      </svg>
    </span>
  );
}

export function Hero() {
  const [first, ...rest] = site.sidebarRole.split(" ");

  return (
    <section aria-labelledby="hero-title" className="relative flex min-h-[min(calc(100svh-4rem),48rem)] items-center py-16 lg:min-h-[min(100svh,54rem)]">
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden sm:block">
        {CUBES.map((c, i) => (
          <span key={i} className="bob absolute" style={{ top: c.top, left: c.left, animationDelay: c.delay, animationDuration: "3.4s" }}>
            <Cube />
          </span>
        ))}
      </div>

      <div className="relative grid w-full items-center gap-12 md:grid-cols-[1.4fr_1fr]">
        <div>
          <Reveal>
            <Prompt cmd="./whoami --verbose" className="mb-5" />
            <h1 id="hero-title" className="text-[2.5rem] font-extrabold leading-[1.12] tracking-tight text-ink sm:text-5xl xl:text-[3.5rem]">
              Hi, I am <span className="text-accent">{site.greetingName}</span>,
              <br />
              <span className="text-accent">{first}</span> {rest.join(" ")}
              <span aria-hidden className="caret" />
            </h1>
          </Reveal>

          <Reveal delay={0.08}>
            <p className="mt-6 flex items-center gap-2.5 text-sm font-bold uppercase tracking-[0.25em] text-ink">
              <MapPinIcon className="text-lg text-accent" />
              {site.location}
            </p>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="mt-6 text-sm font-semibold text-muted">
              {site.name}
              <span className="text-dim"> · </span>
              {site.role}
            </p>
            <p className="mt-3 max-w-lg text-lg leading-relaxed text-ink/90">{site.tagline}</p>
          </Reveal>

          {site.motto ? (
            <Reveal delay={0.15}>
              <figure className="mt-6 max-w-lg rounded-xl border border-line bg-black/30 px-4 py-3 font-mono text-sm">
                <Prompt cmd='echo "$MOTTO"' />
                <blockquote className="mt-1.5 text-accent-soft">
                  <span aria-hidden className="text-term">&gt; </span>
                  {site.motto}
                </blockquote>
                <figcaption className="sr-only">My motto</figcaption>
              </figure>
            </Reveal>
          ) : null}

          <Reveal delay={0.18}>
            <div className="mt-8 flex flex-wrap gap-3">
              {site.resume ? (
                <a
                  href={site.resume}
                  download
                  className="inline-flex items-center gap-2 rounded-full border-2 border-accent/70 px-6 py-2.5 font-bold text-accent-soft transition hover:bg-accent-strong/15 hover:shadow-[0_0_24px_-6px_rgb(139_92_246/0.8)]"
                >
                  <DownloadIcon /> Download CV / Résumé
                </a>
              ) : (
                <a
                  href={`mailto:${site.links.email}?subject=${encodeURIComponent("Résumé request")}`}
                  className="inline-flex items-center gap-2 rounded-full border-2 border-accent/70 px-6 py-2.5 font-bold text-accent-soft transition hover:bg-accent-strong/15 hover:shadow-[0_0_24px_-6px_rgb(139_92_246/0.8)]"
                >
                  <FileIcon /> Request my résumé
                </a>
              )}
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 rounded-full border-2 border-line-strong px-6 py-2.5 font-bold text-ink transition hover:border-accent/50"
              >
                View projects
              </Link>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.2} className="relative flex justify-center">
          <div aria-hidden className="spotlight pointer-events-none absolute hidden md:block -top-[28rem] bottom-6 left-1/2 w-56 -translate-x-1/2" />
          <div className="relative pt-10">
            <PixelLock />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
