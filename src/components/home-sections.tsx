import { about } from "@/content/experience";
import { skillGroups, type SkillGroup } from "@/content/skills";
import { CodeIcon, DatabaseIcon, LayersIcon, ShieldIcon, TerminalIcon, WrenchIcon } from "./icons";
import { Reveal } from "./motion";
import { SectionHeading } from "./section-heading";

export function AboutSection() {
  return (
    <section id="about" aria-labelledby="about-title" className="py-16">
      <SectionHeading id="about-title" cmd="cat about.txt" title="About" />
      <Reveal>
        {about.paragraphs.map((p) => (
          <p key={p.slice(0, 24)} className="mb-5 text-[1.05rem] leading-[1.85] text-muted">
            {p}
          </p>
        ))}
        <ul className="mt-6 flex flex-wrap gap-2" aria-label="Interests">
          {about.interests.map((i) => (
            <li key={i} className="rounded-full border border-line-strong bg-bg-elev/70 px-3.5 py-1.5 text-sm font-semibold text-ink/90">
              {i}
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}

const GROUP_ICON: Record<SkillGroup["icon"], React.ReactNode> = {
  code: <CodeIcon />,
  server: <TerminalIcon />,
  database: <DatabaseIcon />,
  shield: <ShieldIcon />,
  layers: <LayersIcon />,
  wrench: <WrenchIcon />,
};

export function SkillsSection() {
  const odd = skillGroups.length % 2 === 1;
  return (
    <section id="skills" aria-labelledby="skills-title" className="py-16">
      <SectionHeading
        id="skills-title"
        cmd="ls ./skills --all"
        title="Skills & Technologies"
        aside={<span className="text-xs text-dim">Dots mark skills used in my projects or internship (hover for where)</span>}
      />
      <ul className="grid gap-4 sm:grid-cols-2">
        {skillGroups.map((g, i) => (
          <Reveal
            as="li"
            key={g.title}
            delay={(i % 2) * 0.05}
            className={`panel lift p-5 ${odd && i === skillGroups.length - 1 ? "sm:col-span-2" : ""}`}
          >
            <div className="flex items-center gap-3 border-b border-line pb-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-bg-elev text-lg text-accent">{GROUP_ICON[g.icon]}</span>
              <h3 className="font-extrabold text-ink">{g.title}</h3>
              <span className="ml-auto rounded-full border border-line-strong px-2 py-0.5 text-[0.7rem] font-bold text-muted">
                {g.skills.length} skills
              </span>
            </div>
            <ul className="mt-4 flex flex-wrap gap-2">
              {g.skills.map((s) => (
                <li
                  key={s.name}
                  title={s.usedIn ? `Used in: ${s.usedIn}` : undefined}
                  className="inline-flex items-center gap-2 rounded-lg border border-line-strong bg-bg-elev/60 px-3 py-1.5 text-sm font-semibold text-ink/90"
                >
                  {s.name}
                  {s.usedIn ? (
                    <>
                      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />
                      <span className="sr-only">, used in {s.usedIn}</span>
                    </>
                  ) : null}
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
