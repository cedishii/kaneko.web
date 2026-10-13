// Curated project showcase.
//
// Order in this array = order on the site. Set `featured: true` to show a
// project in the main grid, `hidden: true` to remove it without deleting it.
//
// Every claim here was taken from a verifiable source, listed in `sources`:
// the repository README, the code/file tree, the commit history, or your own
// published profile. When a contribution can't be checked against commit
// history, mark it `evidence: "self-reported"` so the site says so.
//
// `repo` links a public GitHub repository ("owner/name"). The sync script's
// snapshot then adds ownership numbers, languages and timestamps. Leave it out
// for private or unpublished work: the site will not show a source link.
//
// `demoUrl` must be a URL you have checked works. `screenshots` take paths
// under /public (e.g. "/projects/consulta/booking.png").

export type Evidence = "commit-history" | "sole-author" | "self-reported";

export type Contribution = {
  text: string;
  evidence: Evidence;
};

export type CuratedProject = {
  slug: string;
  title: string;
  tagline: string;
  kind: "Thesis" | "Internship" | "Personal" | "Team" | "Course";
  status: "Shipped" | "Deployed" | "In progress" | "Completed";
  period?: string;
  role: string;
  repo?: string;
  demoUrl?: string;
  demoLabel?: string;
  summary: string;
  features: string[];
  architecture?: string[];
  contributions: Contribution[];
  contributionNote?: string;
  stack: string[];
  screenshots?: { src: string; alt: string }[];
  sources: string[];
  featured: boolean;
  hidden?: boolean;
};

export const projects: CuratedProject[] = [
  {
    slug: "consulta",
    title: "Consulta",
    tagline: "Web-based academic consultation and advising management system",
    kind: "Thesis",
    status: "Deployed",
    period: "Apr – Jul 2026",
    role: "Full-stack developer, team of three",
    repo: "cedishii/ConsultSiya",
    demoUrl: "https://consult-siya.vercel.app",
    summary:
      "A web application that digitizes academic consultation and advising for Mapúa University's School of Information Technology. Students book consultation slots with professors, professors manage their availability and log outcomes, and admins oversee approvals, calendars and reporting.",
    features: [
      "Role-based dashboards for students, professors and admins, with account approval before first use",
      "Professors publish slots with multiple time ranges per date, then confirm, complete or reschedule bookings",
      "Advising slip flow: pre-filled PDF slip, proof upload and resubmission tracking",
      "Consultation history grouped by academic term, with PDF and Excel exports",
      "Admin tools for user management, announcements and calendar overrides (exam weeks, blocked dates)",
      "Password reset by e-mail and an FAQ chatbot that answers booking questions",
    ],
    architecture: [
      "Next.js (App Router, TypeScript) frontend deployed on Vercel",
      "Express 5 REST API deployed on Railway, PostgreSQL on Neon",
      "SQL schema plus re-runnable additive migrations",
      "JWT bearer auth with server-side role checks on every protected route",
      "bcrypt (12 rounds), account lockout after 5 failed logins, Helmet, rate limiting, express-validator and parameterized queries",
      "Cloudinary for uploaded files, Brevo for e-mail, PDFKit / pdf-lib / ExcelJS for documents, Groq (Llama 3.1) for the chatbot",
    ],
    contributions: [
      {
        text: "Started the codebase: Express and Docker backend setup, the first PostgreSQL schema, JWT register/login, and the schedules and consultations routes",
        evidence: "commit-history",
      },
      {
        text: "Built the login page, the professor dashboard and the PDF/Excel report export",
        evidence: "commit-history",
      },
      {
        text: "Added account approval, admin management, the rescheduled status, schedule editing and report filters",
        evidence: "commit-history",
      },
      {
        text: "Built the advising slip flow, file upload/download and the term-grouped history view",
        evidence: "commit-history",
      },
      {
        text: "Handled deployment: multi-service Vercel config, CORS and Helmet fixes for Vercel + Railway, login-lockout migrations",
        evidence: "commit-history",
      },
      {
        text: "Later redesigned the advising slip flow and added multi-date scheduling, slot previews and fixes to notification attribution",
        evidence: "commit-history",
      },
    ],
    contributionNote:
      "Team capstone with three contributors. The items above come from my own commits in the repository.",
    stack: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Express",
      "Node.js",
      "PostgreSQL",
      "JWT",
      "Docker",
      "Cloudinary",
    ],
    sources: ["Repository README", "Commit history", "Backend source (chatbot provider)"],
    featured: true,
  },
  {
    slug: "distributor-management-system",
    title: "Distributor Management System",
    tagline: "Backend development during my internship at Zhiyuan Enterprise Group Inc.",
    kind: "Internship",
    status: "Completed",
    period: "2026",
    role: "Backend developer intern → assistant backend lead",
    summary:
      "The backend of a company system for managing a tiered network of distributors. I worked on the server side: API endpoints, business logic and the database layer, and supported the people integrating against it.",
    features: [
      "REST API endpoints for the system's frontend",
      "Product pricing and multi-level commission computation across a tiered distributor hierarchy",
      "Data imports into the system's database",
    ],
    contributions: [
      { text: "Built REST API endpoints and server-side business logic", evidence: "self-reported" },
      { text: "Implemented product pricing and multi-level commission computation", evidence: "self-reported" },
      { text: "Wrote data imports and database integration", evidence: "self-reported" },
      { text: "Debugged issues, tested changes and supported frontend integration", evidence: "self-reported" },
      { text: "Took on backend co-team-lead responsibilities", evidence: "self-reported" },
    ],
    contributionNote:
      "Company code in a private repository, so there is no public source link and these points can't be checked publicly.",
    stack: ["Node.js", "Express", "SQLite", "REST APIs", "Git"],
    sources: ["My notes", "GitHub profile README"],
    featured: true,
  },
  {
    slug: "sk-community-portal",
    title: "SK Community Web Portal",
    tagline: "Community portal for the Sangguniang Kabataan of Barangay Esperanza Ilaya",
    kind: "Team",
    status: "Completed",
    period: "Mar 2026",
    role: "Contributor, team of three",
    repo: "RedzerRiley/CRUD-Web-Page-for-SK-Brgy-Esperanza-Ilaya",
    summary:
      "A web portal for a Sangguniang Kabataan (youth council) to publish announcements, share community information and manage records, with an admin area for content.",
    features: [
      "Public pages for announcements, projects, reports, about and contact",
      "Admin dashboard to create, edit, list and delete posts",
      "Category management and media cleanup in the admin area",
      "MySQL database schema and a Docker setup for local runs",
    ],
    contributions: [
      { text: "Built the Projects page UI and its content pane (projects.php)", evidence: "commit-history" },
      { text: "Added the post detail page (post-detail.php)", evidence: "commit-history" },
      { text: "Designed the announcements section's layout", evidence: "self-reported" },
    ],
    contributionNote: "Team repository owned by a teammate. I have 2 of its commits.",
    stack: ["PHP", "MySQL", "HTML", "CSS", "Docker"],
    sources: ["Repository file tree", "Commit history", "GitHub profile README"],
    featured: true,
  },
  {
    slug: "project-1000",
    title: "Project: 1000",
    tagline: "Offline-first bucket list and memory journal with optional cloud sync",
    kind: "Personal",
    status: "Shipped",
    period: "Oct 2026",
    role: "Solo developer",
    repo: "cedishii/project-1000",
    demoUrl: "https://1000-things.vercel.app",
    demoLabel: "Web app",
    summary:
      "A private, offline bucket list and memory journal for Android and iOS: up to 1,000 numbered things, memories with photos, and a Life Album you can export as a PDF. Accounts, a website and friends are optional and built on a locked-down Supabase backend.",
    features: [
      "Up to 1,000 items with permanent numbers; the app never reorders your list",
      "Memories per item with text, dates, locations, hashtags and private photos",
      "Search across numbers, titles, memories, locations and hashtags",
      "Profile levels and journeys computed from the list, never stored separately",
      "Life Album per journey, exported as a PDF",
      "Backup and restore to a single .zip, checksum-verified before anything is replaced",
      "Optional account: the same list on phone and web, friends and opt-in memory sharing",
    ],
    architecture: [
      "Flutter app with SQLite (sqflite) as the offline source of truth",
      "Supabase backend: Postgres migrations, Row Level Security, invite-only roles and business logic in database RPCs",
      "Offline editing while signed in: local SQLite copy plus an outbox, synced with delta pulls",
      "Private storage bucket for photos; Flutter web build deployed on Vercel",
      "Unit tests on the real database code, on-device integration tests and SQL tests for the backend",
    ],
    contributions: [
      { text: "Designed and built the app, backend, web build and release process", evidence: "sole-author" },
    ],
    stack: ["Flutter", "Dart", "SQLite", "Supabase", "PostgreSQL", "Row Level Security", "Vercel"],
    sources: ["Repository README", "File tree", "Commit history", "Releases"],
    featured: true,
  },
  {
    slug: "action-cloner",
    title: "Action Cloner",
    tagline: "Lightweight macro recorder and auto clicker for Windows",
    kind: "Personal",
    status: "Shipped",
    period: "Jul 2026",
    role: "Solo developer",
    repo: "cedishii/ActionCloner",
    summary:
      "A small, fast Windows macro recorder in the spirit of TinyTask. It records global mouse and keyboard activity and replays it with millisecond-accurate, drift-free timing, without third-party packages and at 0% CPU when idle.",
    features: [
      "Global mouse and keyboard recording with playback speed (0.25×–4×) and looping",
      "Auto clicker with a configurable interval",
      "Macro library to save, load and manage recordings",
      "Global hotkeys that work while minimized, with taskbar progress and audio cues",
      "Discord webhook notifications for recording and playback events",
    ],
    architecture: [
      "C# on .NET 8 WinForms, no NuGet dependencies",
      "Win32 interop (user32 / winmm) for low-level input hooks and input playback",
      "Single always-on-top window whose content area swaps between modes",
    ],
    contributions: [{ text: "Built the whole application", evidence: "sole-author" }],
    stack: ["C#", ".NET 8", "WinForms", "Win32 API"],
    sources: ["Repository README", "Releases"],
    featured: true,
  },
  {
    slug: "ustet-reviewer",
    title: "USTET Reviewer",
    tagline: "Offline study app for the UST college entrance test",
    kind: "Personal",
    status: "Deployed",
    period: "Oct 2026",
    role: "Solo developer",
    repo: "cedishii/ustet-reviewer",
    demoUrl: "https://cedishii.github.io/ustet-reviewer/",
    summary:
      "A free, offline-capable study app for the University of Santo Tomas entrance test. It runs on a phone or laptop with no account, no internet connection and no payment.",
    features: [
      "Lessons, flashcards and topic quizzes with explanations and retry of missed questions",
      "Timed mock exams (standard, even practice and custom) with a time-pressure meter",
      "Per-subject progress, topics to review and quiz/mock history",
      "Installable PWA that works offline through a service worker",
      "All content lives in JSON files, so it can be edited without code changes",
    ],
    contributions: [{ text: "Built the app and wrote its content pipeline", evidence: "sole-author" }],
    stack: ["JavaScript", "HTML", "CSS", "PWA", "GitHub Pages"],
    sources: ["Repository README"],
    featured: true,
  },
  {
    slug: "omnitool",
    title: "OmniTool",
    tagline: "Modular Android utility toolkit",
    kind: "Personal",
    status: "In progress",
    period: "Jul 2026",
    role: "Solo developer",
    repo: "cedishii/Android-Toolkit",
    summary:
      "An Android utility app that bundles everyday tools behind a small module registry, so new tools can be added without touching the core app.",
    features: [
      "Calculator",
      "PDF merger: pick, reorder and merge multiple PDFs",
      "PDF signing: draw and save signatures, then place and resize them on a page",
    ],
    contributions: [{ text: "Built the app and its module architecture", evidence: "sole-author" }],
    stack: ["Flutter", "Dart", "Android", "Syncfusion PDF"],
    sources: ["File tree", "pubspec.yaml", "GitHub profile README"],
    featured: false,
  },
  {
    slug: "newscheck",
    title: "NewsCheck",
    tagline: "AI-assisted fake news detection and verification platform",
    kind: "Course",
    status: "Completed",
    role: "Developer, verification history",
    repo: "neoboi76/ITS120LProj_Grp6",
    summary:
      "A team course project that checks news claims with the Google Gemini API and gathers supporting evidence from credible sources.",
    features: [
      "Claim verification for text, URLs and images (OCR)",
      "Evidence gathering from news sources",
      "Verification history and an admin dashboard with audit logs",
      "JWT authentication with role-based access",
    ],
    contributions: [
      { text: "Built user-scoped backend endpoints for verification history", evidence: "self-reported" },
      { text: "Implemented server-side filtering and search, wired to the Angular history UI", evidence: "self-reported" },
      { text: "Added authorization checks so users can only read their own history", evidence: "self-reported" },
    ],
    contributionNote:
      "The repository has no commits under my GitHub account, so my part can't be confirmed from its history.",
    stack: ["Java", "Spring Boot", "Angular", "PostgreSQL", "Docker"],
    sources: ["Repository README", "GitHub profile README"],
    featured: false,
  },
];
