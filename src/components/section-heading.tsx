import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRightIcon } from "./icons";
import { Reveal } from "./motion";
import { Prompt } from "./prompt";

type Props = {
  id: string;
  // Shell command shown as a prompt above the title, for the terminal feel.
  cmd?: string;
  title: string;
  as?: "h1" | "h2";
  pill?: ReactNode;
  subtitle?: ReactNode;
  // Right-aligned link, e.g. "View all projects".
  more?: { href: string; label: string; external?: boolean };
  aside?: ReactNode;
};

export function SectionHeading({ id, cmd, title, as: Tag = "h2", pill, subtitle, more, aside }: Props) {
  return (
    <Reveal className="mb-8">
      {cmd ? <Prompt cmd={cmd} className="mb-2" /> : null}
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <Tag id={id} className="text-3xl font-extrabold tracking-tight text-ink sm:text-[2.1rem]">
            <span aria-hidden className="mr-2 font-mono text-accent">&gt;</span>
            {title}
          </Tag>
          {pill ? (
            <span className="pill font-mono">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />
              {pill}
            </span>
          ) : null}
        </div>
        {more ? (
          more.external ? (
            <a href={more.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-bold text-accent hover:text-accent-soft">
              {more.label} <ArrowRightIcon />
            </a>
          ) : (
            <Link href={more.href} className="inline-flex items-center gap-1.5 text-sm font-bold text-accent hover:text-accent-soft">
              {more.label} <ArrowRightIcon />
            </Link>
          )
        ) : null}
        {aside}
      </div>
      {subtitle ? <div className="mt-2 text-[0.95rem] text-muted">{subtitle}</div> : null}
    </Reveal>
  );
}

export function Chip({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "accent" | "warn" | "ok";
}) {
  const tones = {
    default: "border-line-strong bg-bg-elev/80 text-muted",
    accent: "border-accent/35 bg-accent-strong/12 text-accent-soft",
    warn: "border-warn/30 bg-warn/10 text-warn",
    ok: "border-ok/30 bg-ok/10 text-ok",
  } as const;
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[0.7rem] leading-5 ${tones[tone]}`}>
      {children}
    </span>
  );
}
