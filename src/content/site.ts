// Central personal/site configuration.
// Everything here is published on the public website — only add what you
// intentionally want visitors to see.
//
// This file is also read by `scripts/sync-github.mts` (Node type stripping),
// so keep it self-contained: no imports, no path aliases, no TS-only syntax
// such as enums.

export const site = {
  name: "Cedrick Miguel Peji Kaneko",
  shortName: "Cedrick Kaneko",
  handle: "cedishii",
  role: "Cybersecurity | Networking | Secure Backend Development | BSIT Graduate",
  // Short role under your name in the sidebar, and the hero headline (the
  // first word is highlighted).
  sidebarRole: "Cybersecurity Graduate",
  greetingName: "Cedrick",
  tagline: "Building secure systems and useful software, one project at a time.",
  // Personal motto, shown in the hero and the footer. Set to null to hide.
  motto: "You won't know, unless you try." as string | null,
  intro:
    "I'm an IT graduate from Mapúa University who specialized in cybersecurity and networking. I look at systems the way an attacker would, then build the backend so that view finds nothing: auth, access control, input handling and the data underneath.",
  location: "Philippines",
  // Shown in the hero terminal. Set to null to hide.
  status: "open to cybersecurity, networking and backend roles" as string | null,

  // Production URL for SEO metadata, the sitemap and Open Graph tags, e.g.
  // "https://kaneko.dev". While null, NEXT_PUBLIC_SITE_URL or Vercel's
  // production URL is used, then http://localhost:3000.
  url: null as string | null,

  github: {
    // The single source of truth for the GitHub account. The GITHUB_USERNAME
    // environment variable overrides it (see .env.example).
    username: "cedishii",
    // Repositories owned by someone else that you contributed to. The sync
    // script checks your commit history in them so the site can say what is
    // verified and what is self-reported.
    extraRepos: [
      "RedzerRiley/CRUD-Web-Page-for-SK-Brgy-Esperanza-Ilaya",
      "neoboi76/ITS120LProj_Grp6",
    ],
    // Pinned to the top of the live repository showcase, in this order.
    featuredRepos: ["project-1000", "ActionCloner", "ustet-reviewer", "ConsultSiya"],
    // Never shown in the live repository showcase.
    hiddenRepos: ["cedishii"],
  },

  links: {
    email: "cedrickkaneko@gmail.com",
    linkedin: "https://www.linkedin.com/in/cedrick-kaneko/",
    orcid: "https://orcid.org/0009-0008-4609-8353",
  },

  // Put your résumé PDF at public/resume.pdf and set this to "/resume.pdf".
  // While it is null, the résumé buttons are replaced by "available on request".
  resume: null as string | null,
};

export type Site = typeof site;
