"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  ActivityIcon,
  BriefcaseIcon,
  CloseIcon,
  FileIcon,
  FolderIcon,
  GitHubIcon,
  HomeIcon,
  LayersIcon,
  LinkedInIcon,
  MailIcon,
  MenuIcon,
  SparklesIcon,
  UserIcon,
} from "./icons";

type Props = {
  name: string;
  role: string;
  avatarUrl: string | null;
  email: string;
  githubUrl: string;
  linkedinUrl: string;
  resume: string | null;
};

const HOME_SECTIONS = [
  { id: "activity", label: "Activity", icon: <ActivityIcon /> },
  { id: "about", label: "About", icon: <UserIcon /> },
  { id: "skills", label: "Skills", icon: <SparklesIcon /> },
  { id: "latest", label: "Latest", icon: <LayersIcon /> },
];

const PAGES = [
  { href: "/projects", label: "Projects", icon: <FolderIcon /> },
  { href: "/experience", label: "Experience", icon: <BriefcaseIcon /> },
  { href: "/contact", label: "Contact", icon: <MailIcon /> },
];

// Highlights the home sub-section currently in view.
function useActiveSection(enabled: boolean) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    if (!enabled) return;
    const els = HOME_SECTIONS.map((s) => document.getElementById(s.id)).filter((e): e is HTMLElement => e !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    els.forEach((el) => observer.observe(el));
    const onTop = () => window.scrollY < 200 && setActive(null);
    window.addEventListener("scroll", onTop, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onTop);
    };
  }, [enabled]);
  return enabled ? active : null;
}

function NavItem({ href, icon, label, active, onNavigate }: { href: string; icon: ReactNode; label: string; active: boolean; onNavigate: () => void }) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.95rem] font-semibold transition-colors ${
        active
          ? "border border-accent/40 bg-accent-strong/15 text-accent-soft"
          : "border border-transparent text-muted hover:bg-bg-elev hover:text-ink"
      }`}
    >
      <span className="text-lg">{icon}</span>
      {label}
    </Link>
  );
}

function SidebarBody({ props, onNavigate }: { props: Props; onNavigate: () => void }) {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const section = useActiveSection(onHome);

  return (
    <div className="flex h-full flex-col px-4 py-6">
      <Link href="/" onClick={onNavigate} className="flex items-center gap-3 px-1">
        {props.avatarUrl ? (
          <Image src={props.avatarUrl} alt="" width={40} height={40} className="rounded-full border border-line-strong" />
        ) : (
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-strong/20 font-bold text-accent-soft">
            {props.name[0]}
          </span>
        )}
        <span className="min-w-0">
          <span className="block truncate font-extrabold text-ink">{props.name}</span>
          <span className="block text-xs font-bold leading-tight text-accent">{props.role}</span>
        </span>
      </Link>

      <nav aria-label="Main" className="mt-8">
        <ul className="space-y-1">
          <li>
            <NavItem href="/" icon={<HomeIcon />} label="Home" active={onHome} onNavigate={onNavigate} />
            <ul className="mb-2 ml-5 mt-1 space-y-0.5 border-l border-line pl-3">
              {HOME_SECTIONS.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/#${s.id}`}
                    onClick={onNavigate}
                    className={`flex items-center gap-2.5 rounded-lg px-2 py-1.5 font-mono text-[0.8rem] transition-colors ${
                      section === s.id ? "text-accent-soft" : "text-dim hover:text-ink"
                    }`}
                  >
                    <span className="text-[0.95rem]">{s.icon}</span>
                    ./{s.label.toLowerCase()}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
          {PAGES.map((p) => (
            <li key={p.href}>
              <NavItem
                href={p.href}
                icon={p.icon}
                label={p.label}
                active={pathname === p.href || pathname.startsWith(`${p.href}/`)}
                onNavigate={onNavigate}
              />
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto space-y-4 border-t border-line pt-5">
        <p className="flex items-center gap-2 px-1 font-mono text-[0.7rem] text-dim">
          <span aria-hidden className="pulse-dot h-1.5 w-1.5 rounded-full bg-term" />
          session: secure · tty1
        </p>
        {props.resume ? (
          <a
            href={props.resume}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl border border-line-strong bg-bg-elev px-3 py-2 text-sm font-bold text-ink hover:border-accent/50"
          >
            <FileIcon /> Résumé
          </a>
        ) : null}
        <a href={`mailto:${props.email}`} className="flex items-center gap-2.5 px-1 font-mono text-xs text-muted hover:text-accent-soft">
          <MailIcon className="shrink-0 text-accent" />
          <span className="truncate">{props.email}</span>
        </a>
        <div className="flex gap-2 px-1">
          <a href={props.githubUrl} target="_blank" rel="noreferrer" className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-muted hover:border-accent/50 hover:text-accent-soft">
            <GitHubIcon title="GitHub" />
          </a>
          <a href={props.linkedinUrl} target="_blank" rel="noreferrer" className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-muted hover:border-accent/50 hover:text-accent-soft">
            <LinkedInIcon title="LinkedIn" />
          </a>
        </div>
      </div>
    </div>
  );
}

export function Sidebar(props: Props) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Desktop: fixed column */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-56 border-r border-line bg-side lg:block">
        <SidebarBody props={props} onNavigate={() => {}} />
      </aside>

      {/* Mobile: top bar + drawer */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-line bg-side/90 px-4 backdrop-blur-md lg:hidden">
        <Link href="/" className="flex items-center gap-2.5">
          {props.avatarUrl ? <Image src={props.avatarUrl} alt="" width={32} height={32} className="rounded-full" /> : null}
          <span className="font-extrabold text-ink">{props.name}</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls="mobile-sidebar"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-line text-ink"
        >
          <MenuIcon title="Open menu" />
        </button>
      </header>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden" id="mobile-sidebar" role="dialog" aria-modal="true" aria-label="Menu">
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-black/60" onClick={close} />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] border-r border-line bg-side">
            <button
              type="button"
              onClick={close}
              className="absolute right-3 top-5 flex h-9 w-9 items-center justify-center rounded-lg border border-line text-ink"
            >
              <CloseIcon title="Close menu" />
            </button>
            <SidebarBody props={props} onNavigate={close} />
          </div>
        </div>
      ) : null}
    </>
  );
}
