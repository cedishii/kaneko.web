// About, experience timeline, education and certifications.
// Newest first. Edit freely: the site renders whatever is here.

export const about = {
  paragraphs: [
    "I studied IT at Mapúa University with a specialization in cybersecurity and networking, and security is the lens I bring to everything I build. Before I write an endpoint I ask who can reach it, what happens when the input is hostile, and what an attacker would try first.",
    "I've practiced that on both sides: assessing systems with tools like Nmap, Wireshark and Burp Suite, and building backends with hashed credentials, account lockouts, rate limits, role checks and row-level security. During my internship I went from backend intern to co-leading the backend team.",
  ],
  interests: [
    "Application and network security",
    "Vulnerability assessment and packet analysis",
    "Access control, auth and data integrity",
    "Secure backend systems and API design",
  ],
};

export type TimelineEntry = {
  period: string;
  title: string;
  org: string;
  location?: string;
  kind: "work" | "education" | "project";
  summary?: string;
  points: string[];
};

export const timeline: TimelineEntry[] = [
  {
    period: "2026 · 488 hours",
    title: "Backend Developer Intern → Assistant Backend Lead",
    org: "Zhiyuan Enterprise Group Inc.",
    location: "Makati City, Philippines",
    kind: "work",
    summary:
      "Started as a backend intern and was promoted to co-lead the backend team, contributing to three internal and client systems.",
    points: [
      "Built the backend of the Distributor Management System: REST API endpoints, business logic, product pricing, data imports and multi-level commission computation",
      "Maintained the company's employee clock-time monitoring system, fixing issues and shipping requested features",
      "Worked as QA checker on a client real-estate website: tested features, logged defects and implemented post-review revisions",
      "Debugged, tested and supported integration in a Git-based, Agile/RAD team workflow with written technical documentation",
    ],
  },
  {
    period: "Apr – Jul 2026",
    title: "Capstone: Consulta",
    org: "Mapúa University",
    kind: "project",
    summary:
      "Team thesis project: a consultation and advising system for the School of Information Technology, deployed on Vercel and Railway.",
    points: [
      "Set up the Express backend, PostgreSQL schema and JWT authentication",
      "Built report exports, the advising slip flow and admin approval features",
    ],
  },
  {
    period: "Aug 2023 – 2026",
    title: "BS Information Technology",
    org: "Mapúa University",
    kind: "education",
    summary: "Specialization in Cybersecurity and Networking.",
    points: [
      "Coursework: application development, database management systems, object-oriented programming, UI/UX, systems integration",
    ],
  },
];

// As published on my GitHub profile. Add a `url` to link a credential.
export const certifications: { name: string; issuer: string; date: string; url?: string }[] = [
  { name: "Agile Project Management", issuer: "Packt", date: "Jan 2026" },
  { name: "Software Architecture", issuer: "University of Alberta", date: "Oct 2025" },
  { name: "Ethical Hacking Fundamentals", issuer: "LearnKartS", date: "Oct 2025" },
  { name: "User Experience: Research & Prototyping", issuer: "UC San Diego", date: "Oct 2025" },
  {
    name: "Emerging Technologies: From Smartphones to IoT to Big Data",
    issuer: "Yonsei University",
    date: "Sep 2025",
  },
  { name: "Certified in Cybersecurity Specialization", issuer: "ISC2", date: "Jul 2025" },
  { name: "Google Cybersecurity Professional Certificate", issuer: "Google", date: "Jun 2025" },
  {
    name: "Introduction to Computer Science and Programming",
    issuer: "University of London, Goldsmiths",
    date: "Oct 2023",
  },
];
