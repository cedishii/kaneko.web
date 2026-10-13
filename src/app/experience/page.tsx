import type { Metadata } from "next";
import { Reveal } from "@/components/motion";
import { SectionHeading } from "@/components/section-heading";
import { certifications, timeline, type TimelineEntry } from "@/content/experience";

export const metadata: Metadata = {
  title: "Experience",
  description: "Internship, capstone and education timeline, plus certifications.",
  alternates: { canonical: "/experience" },
};

const KIND_LABEL: Record<TimelineEntry["kind"], string> = { work: "Work", education: "Education", project: "Project" };

export default function ExperiencePage() {
  return (
    <div className="pt-12 lg:pt-20">
      <SectionHeading id="experience-title" cmd="cat ~/.history" as="h1" title="Experiences" subtitle="Where I've worked, studied and shipped." />

      <ol className="relative ml-2 border-l border-line pl-8">
        {timeline.map((t, i) => (
          <Reveal as="li" key={`${t.title}-${t.period}`} delay={i * 0.05} className="relative pb-12 last:pb-0">
            <span
              aria-hidden
              className="absolute -left-[38.5px] top-1 h-3.5 w-3.5 rounded-full border-2 border-accent bg-bg shadow-[0_0_12px_rgb(139_92_246/0.7)]"
            />
            <p className="flex flex-wrap items-center gap-2 font-mono text-xs text-dim">
              <span className="text-accent">[{t.period}]</span>
              <span className="rounded-md border border-line-strong px-1.5">{KIND_LABEL[t.kind]}</span>
            </p>
            <h2 className="mt-2 text-xl font-extrabold text-ink">{t.title}</h2>
            <p className="text-sm font-semibold text-accent-soft/85">
              {t.org}
              {t.location ? <span className="text-dim"> · {t.location}</span> : null}
            </p>
            {t.summary ? <p className="mt-3 leading-relaxed text-muted">{t.summary}</p> : null}
            {t.points.length > 0 ? (
              <ul className="mt-3 space-y-2 text-[0.95rem] leading-relaxed text-muted">
                {t.points.map((p) => (
                  <li key={p} className="flex gap-3">
                    <span aria-hidden className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-accent/70" />
                    {p}
                  </li>
                ))}
              </ul>
            ) : null}
          </Reveal>
        ))}
      </ol>

      {certifications.length > 0 ? (
        <section aria-labelledby="certs-title" className="pt-20">
          <SectionHeading id="certs-title" cmd="ls ./certs" title="Certifications" pill={`${certifications.length} completed`} />
          <Reveal>
            <ul className="panel divide-y divide-line overflow-hidden">
              {certifications.map((c) => (
                <li key={c.name} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-5 py-4">
                  <span>
                    <span className="font-bold text-ink">
                      {c.url ? (
                        <a href={c.url} target="_blank" rel="noreferrer" className="hover:text-accent-soft">
                          {c.name}
                        </a>
                      ) : (
                        c.name
                      )}
                    </span>
                    <span className="block text-sm text-muted">{c.issuer}</span>
                  </span>
                  <span className="font-mono text-xs text-accent">{c.date}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </section>
      ) : null}
    </div>
  );
}
