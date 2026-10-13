// Technical skills, grouped. Only list what you have actually used.
// `usedIn` is shown to visitors (and screen readers) as evidence; leave it
// out rather than guessing. No percentages on purpose.

export type Skill = { name: string; usedIn?: string };
export type SkillGroup = {
  title: string;
  icon: "code" | "server" | "database" | "shield" | "layers" | "wrench";
  blurb: string;
  skills: Skill[];
};

export const skillGroups: SkillGroup[] = [
  {
    title: "Cybersecurity & networking",
    icon: "shield",
    blurb: "My specialization: assessing systems and building them defensively.",
    skills: [
      { name: "Vulnerability assessment" },
      { name: "Packet analysis" },
      { name: "Network configuration" },
      { name: "Kali Linux" },
      { name: "Wireshark" },
      { name: "Nmap" },
      { name: "Burp Suite" },
      { name: "Metasploit" },
      { name: "Autopsy" },
      { name: "Secure coding practices", usedIn: "Consulta, Project: 1000" },
    ],
  },
  {
    title: "Languages",
    icon: "code",
    blurb: "What I write day to day, and what I have shipped with.",
    skills: [
      { name: "TypeScript", usedIn: "Consulta" },
      { name: "JavaScript", usedIn: "Consulta, USTET Reviewer, internship" },
      { name: "SQL", usedIn: "Consulta, Project: 1000, coursework" },
      { name: "C#", usedIn: "Action Cloner, coursework" },
      { name: "Dart", usedIn: "Project: 1000, OmniTool" },
      { name: "PHP", usedIn: "SK Community Web Portal, internship" },
      { name: "Python", usedIn: "Coursework, test tooling" },
      { name: "Java", usedIn: "NewsCheck" },
    ],
  },
  {
    title: "Backend & APIs",
    icon: "server",
    blurb: "REST APIs, auth and the business logic behind them.",
    skills: [
      { name: "Node.js", usedIn: "Consulta, internship" },
      { name: "Express", usedIn: "Consulta, internship" },
      { name: "REST API design", usedIn: "Consulta, internship" },
      { name: "JWT auth & role-based access", usedIn: "Consulta" },
      { name: "Supabase (RPC, RLS)", usedIn: "Project: 1000" },
      { name: ".NET", usedIn: "Action Cloner, coursework" },
      { name: "Spring Boot", usedIn: "NewsCheck" },
    ],
  },
  {
    title: "Databases",
    icon: "database",
    blurb: "Schemas, migrations and keeping data consistent.",
    skills: [
      { name: "PostgreSQL", usedIn: "Consulta, Project: 1000" },
      { name: "SQLite", usedIn: "Project: 1000, internship" },
      { name: "MySQL", usedIn: "SK Community Web Portal" },
      { name: "SQL Server", usedIn: "Coursework (stored procedures)" },
    ],
  },
  {
    title: "Frontend & mobile",
    icon: "layers",
    blurb: "Enough to ship the whole thing when I need to.",
    skills: [
      { name: "Next.js", usedIn: "Consulta, this site" },
      { name: "React", usedIn: "Consulta" },
      { name: "Tailwind CSS", usedIn: "Consulta, this site" },
      { name: "Flutter", usedIn: "Project: 1000, OmniTool" },
      { name: "Angular", usedIn: "NewsCheck" },
      { name: "WinForms", usedIn: "Action Cloner" },
    ],
  },
  {
    title: "Tools & workflow",
    icon: "wrench",
    blurb: "How the work gets built, reviewed and shipped.",
    skills: [
      { name: "Git & GitHub" },
      { name: "Docker", usedIn: "Consulta, SK Community Web Portal" },
      { name: "Vercel", usedIn: "Consulta, Project: 1000" },
      { name: "Railway", usedIn: "Consulta" },
      { name: "Agile / RAD", usedIn: "Internship" },
      { name: "Technical documentation", usedIn: "Internship, project READMEs" },
    ],
  },
];
