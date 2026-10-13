import type { Metadata } from "next";
import { ArrowRightIcon, DownloadIcon, FileIcon, GitHubIcon, LinkedInIcon, MailIcon, OrcidIcon } from "@/components/icons";
import { Reveal } from "@/components/motion";
import { SectionHeading } from "@/components/section-heading";
import { site } from "@/content/site";
import { githubUsername } from "@/lib/github";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${site.name}.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const githubUrl = `https://github.com/${githubUsername()}`;
  const channels = [
    { href: `mailto:${site.links.email}`, label: "Email", value: site.links.email, icon: <MailIcon /> },
    { href: githubUrl, label: "GitHub", value: githubUrl.replace("https://", ""), icon: <GitHubIcon /> },
    {
      href: site.links.linkedin,
      label: "LinkedIn",
      value: site.links.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\//, "").replace(/\/$/, ""),
      icon: <LinkedInIcon />,
    },
    { href: site.links.orcid, label: "ORCID", value: site.links.orcid.replace("https://", ""), icon: <OrcidIcon /> },
  ];

  return (
    <div className="pt-12 lg:pt-20">
      <SectionHeading
        id="contact-title"
        cmd="./contact.sh --secure"
        as="h1"
        title="Contacts"
        subtitle="I'm looking for backend, networking and security work. If you're hiring or want to talk about a project, email is the fastest way to reach me."
      />

      <Reveal>
        <ul className="grid gap-3 sm:grid-cols-2">
          {channels.map((c) => (
            <li key={c.label}>
              <a
                href={c.href}
                {...(c.href.startsWith("mailto:") ? {} : { target: "_blank", rel: "noreferrer" })}
                className="panel lift group flex items-center gap-4 p-5"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-bg-elev text-lg text-accent">{c.icon}</span>
                <span className="min-w-0">
                  <span className="block text-xs font-bold text-dim">{c.label}</span>
                  <span className="block truncate font-semibold text-ink group-hover:text-accent-soft">{c.value}</span>
                </span>
                <ArrowRightIcon className="ml-auto shrink-0 text-dim group-hover:text-accent" />
              </a>
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal className="mt-10">
        <div id="resume" className="panel relative overflow-hidden p-6 sm:p-8">
          <div aria-hidden className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-accent-strong/20 blur-3xl" />
          <h2 className="text-2xl font-extrabold text-ink">Résumé</h2>
          {site.resume ? (
            <>
              <p className="mt-2 max-w-lg text-muted">My experience, education and certifications in one PDF.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={site.resume}
                  download
                  className="inline-flex items-center gap-2 rounded-full border-2 border-accent/70 px-6 py-2.5 font-bold text-accent-soft hover:bg-accent-strong/15"
                >
                  <DownloadIcon /> Download CV / Résumé
                </a>
                <a
                  href={site.resume}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-line-strong px-6 py-2.5 font-bold text-ink hover:border-accent/50"
                >
                  <FileIcon /> View PDF
                </a>
              </div>
            </>
          ) : (
            <>
              <p className="mt-2 max-w-lg text-muted">
                I share my résumé on request so the copy you get is current. Send a short note and I&apos;ll reply with the PDF.
              </p>
              <a
                href={`mailto:${site.links.email}?subject=${encodeURIComponent("Résumé request")}`}
                className="mt-6 inline-flex items-center gap-2 rounded-full border-2 border-accent/70 px-6 py-2.5 font-bold text-accent-soft hover:bg-accent-strong/15"
              >
                <MailIcon /> Request by email
              </a>
            </>
          )}
        </div>
      </Reveal>
    </div>
  );
}
