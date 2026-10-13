// Build-time GitHub analysis.
//
// Collects public, read-only metadata about the configured account and writes
// it to src/data/github-snapshot.json. The website reads that snapshot for
// project analysis (detected stack, README summaries, ownership) and as a
// fallback when the live GitHub API is unavailable.
//
// It never runs on a visitor's page load. Run it manually or in CI:
//   GITHUB_TOKEN=<token> npm run sync:github
//
// What it reads per repository: metadata, languages, contributors, commit
// count, file tree (paths only), README, release count and a handful of
// dependency manifests (package.json, pubspec.yaml, *.csproj, ...). It does
// not read or store source code. Private repositories are skipped, .env-like
// files are never fetched, and README excerpts are scrubbed of e-mail
// addresses and anything that looks like a credential.

import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { site } from "../src/content/site.ts";
import { fetchAllContributions } from "../src/lib/contributions-source.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const snapshotPath = path.join(root, "src/data/github-snapshot.json");
const assetDir = path.join(root, "public/github");

const username = process.env.GITHUB_USERNAME || site.github.username;
const token = process.env.GITHUB_TOKEN;

if (!username || username === "YOUR_GITHUB_USERNAME") {
  console.error("Set GITHUB_USERNAME (or site.github.username) before syncing.");
  process.exit(1);
}
if (!token) {
  console.warn(
    "No GITHUB_TOKEN set: unauthenticated requests are limited to 60/hour, which is not enough for a full analysis.",
  );
}

const API = "https://api.github.com";
let requestCount = 0;

async function gh(pathname: string, accept = "application/vnd.github+json"): Promise<Response> {
  requestCount++;
  const res = await fetch(pathname.startsWith("http") ? pathname : API + pathname, {
    headers: {
      Accept: accept,
      "User-Agent": `${username}-portfolio-sync`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (res.status === 403 || res.status === 429) {
    const reset = res.headers.get("x-ratelimit-reset");
    throw new Error(
      `GitHub rate limit hit on ${pathname}` +
        (reset ? ` (resets ${new Date(Number(reset) * 1000).toISOString()})` : ""),
    );
  }
  return res;
}

async function json<T>(pathname: string): Promise<T | null> {
  const res = await gh(pathname);
  // 404 missing, 409 empty repository, 204 no content (e.g. contributors of an empty repo)
  if (res.status === 404 || res.status === 409 || res.status === 204) return null;
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${pathname}`);
  return (await res.json()) as T;
}

async function text(pathname: string): Promise<string | null> {
  const res = await gh(pathname, "application/vnd.github.raw+json");
  if (!res.ok) return null;
  return await res.text();
}

// Count items behind a paginated endpoint by asking for one per page and
// reading the last page number from the Link header.
async function countPaginated(pathname: string): Promise<number> {
  const sep = pathname.includes("?") ? "&" : "?";
  const res = await gh(`${pathname}${sep}per_page=1`);
  if (!res.ok) return 0;
  const link = res.headers.get("link");
  const last = link?.match(/[?&]page=(\d+)>;\s*rel="last"/);
  if (last) return Number(last[1]);
  const body = (await res.json()) as unknown[];
  return body.length;
}

// ---------------------------------------------------------------------------
// Types (mirrored in src/lib/github-types.ts)

type ApiRepo = {
  name: string;
  full_name: string;
  owner: { login: string };
  private: boolean;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  fork: boolean;
  archived: boolean;
  size: number;
  created_at: string;
  pushed_at: string;
  topics?: string[];
  default_branch: string;
  license: { spdx_id: string } | null;
};

type TreeEntry = { path: string; type: "blob" | "tree"; size?: number };

type Category = "project" | "in-progress" | "coursework" | "empty" | "profile" | "fork";

// ---------------------------------------------------------------------------
// README parsing

const SECRET_PATTERNS = [
  /\b(gh[pousr]_[A-Za-z0-9]{20,})\b/g,
  /\b(sk-[A-Za-z0-9_-]{20,})\b/g,
  /\bAKIA[0-9A-Z]{16}\b/g,
  /\b(eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,})\b/g,
  /\b[A-Fa-f0-9]{40,}\b/g,
];
const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;

function scrub(s: string): string {
  let out = s.replace(EMAIL, "[email removed]");
  for (const p of SECRET_PATTERNS) out = out.replace(p, "[redacted]");
  return out;
}

function plain(md: string): string {
  return scrub(
    md
      .replace(/!\[[^\]]*\]\([^)]*\)/g, "") // images
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // links -> text
      .replace(/<[^>]+>/g, "") // html
      .replace(/[*_`]{1,3}([^*_`]+)[*_`]{1,3}/g, "$1") // emphasis/code
      .replace(/\s+/g, " ")
      .trim(),
  );
}

type ReadmeInfo = {
  title: string | null;
  summary: string | null;
  headings: string[];
  features: string[];
  images: string[];
};

function parseReadme(md: string): ReadmeInfo {
  const noCode = md.replace(/```[\s\S]*?```/g, "");
  const lines = noCode.split(/\r?\n/);
  const title = lines.find((l) => /^#\s+/.test(l))?.replace(/^#\s+/, "").trim() ?? null;
  const headings = lines
    .filter((l) => /^#{2,3}\s+/.test(l))
    .map((l) => plain(l.replace(/^#+\s+/, "")))
    .filter(Boolean)
    .slice(0, 20);

  // First real paragraph: not a heading, badge, table, list or blank line.
  const paragraphs = noCode.split(/\r?\n\s*\r?\n/).map((p) => p.trim());
  const summaryRaw = paragraphs.find(
    (p) =>
      p &&
      !/^#/.test(p) &&
      !/^(\||[-*+]\s|\d+\.\s|>|!\[|<)/.test(p) &&
      !/^---+$/.test(p) &&
      plain(p).length > 30,
  );
  const summary = summaryRaw ? plain(summaryRaw).slice(0, 600) : null;

  // Bullets under a heading that looks like a feature list.
  // Wrapped bullets continue on indented lines, so collect until the next
  // bullet, heading or blank line.
  const rawFeatures: string[] = [];
  let inFeatures = false;
  let current: string | null = null;
  const flush = () => {
    if (current !== null) rawFeatures.push(current);
    current = null;
  };
  let featureLevel = 0;
  for (const line of lines) {
    const heading = line.match(/^(#{1,4})\s+(.*)/);
    if (heading) {
      flush();
      const level = heading[1].length;
      if (/feature|what it does|highlights|capabilit|roles/i.test(heading[2])) {
        inFeatures = true;
        featureLevel = level;
      } else if (!inFeatures || level <= featureLevel) {
        inFeatures = false; // sub-headings (e.g. per-role lists) stay inside the section
      }
      continue;
    }
    if (!inFeatures) continue;
    const row = line.match(/^\|([^|]+)\|/);
    if (row) {
      // Feature tables: first column of each body row.
      flush();
      const cell = row[1].trim();
      if (cell && !/^:?-{2,}:?$/.test(cell) && !/^feature$/i.test(cell)) rawFeatures.push(cell);
    } else if (/^\s{0,2}[-*+]\s+/.test(line)) {
      flush();
      current = line.replace(/^\s*[-*+]\s+/, "");
    } else if (current !== null && /^\s+\S/.test(line)) {
      current += " " + line.trim();
    } else {
      flush();
    }
  }
  flush();
  const features = rawFeatures
    .map((f) => plain(f))
    .filter((f) => f.length > 3)
    .map((f) => (f.length > 260 ? f.slice(0, 257).trimEnd() + "…" : f))
    .slice(0, 16);

  // Relative images referenced from the README (badges and remote images skipped).
  const images = [...md.matchAll(/!\[[^\]]*\]\(([^)\s]+)[^)]*\)|<img[^>]+src="([^"]+)"/g)]
    .map((m) => m[1] ?? m[2])
    .filter((src) => src && !/^(https?:|data:)/.test(src));

  return { title, summary, headings, features, images };
}

// ---------------------------------------------------------------------------
// Tech detection from manifests and file paths (never from source contents)

const NPM_TECH: Record<string, string> = {
  next: "Next.js",
  react: "React",
  "@angular/core": "Angular",
  vue: "Vue",
  express: "Express",
  pg: "PostgreSQL",
  mysql2: "MySQL",
  sqlite3: "SQLite",
  "better-sqlite3": "SQLite",
  mongoose: "MongoDB",
  prisma: "Prisma",
  jsonwebtoken: "JWT",
  bcrypt: "bcrypt",
  bcryptjs: "bcrypt",
  helmet: "Helmet",
  "express-rate-limit": "Rate limiting",
  "express-validator": "express-validator",
  tailwindcss: "Tailwind CSS",
  typescript: "TypeScript",
  cloudinary: "Cloudinary",
  pdfkit: "PDFKit",
  "pdf-lib": "pdf-lib",
  exceljs: "ExcelJS",
  recharts: "Recharts",
  "@supabase/supabase-js": "Supabase",
  firebase: "Firebase",
  vite: "Vite",
  multer: "Multer",
  nodemailer: "Nodemailer",
  "socket.io": "Socket.IO",
};

const PUB_TECH: Record<string, string> = {
  flutter: "Flutter",
  supabase_flutter: "Supabase",
  sqflite: "SQLite",
  sqflite_common_ffi: "SQLite",
  drift: "Drift",
  provider: "Provider",
  flutter_riverpod: "Riverpod",
  go_router: "go_router",
  pdf: "PDF generation",
  syncfusion_flutter_pdf: "Syncfusion PDF",
  firebase_core: "Firebase",
};

function techFromPackageJson(raw: string, into: Set<string>) {
  try {
    const pkg = JSON.parse(raw) as Record<string, Record<string, string> | undefined>;
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    for (const name of Object.keys(deps)) if (NPM_TECH[name]) into.add(NPM_TECH[name]);
    into.add("Node.js");
  } catch {
    /* malformed manifest: ignore */
  }
}

function techFromPubspec(raw: string, into: Set<string>) {
  into.add("Dart");
  for (const [name, label] of Object.entries(PUB_TECH)) {
    if (new RegExp(`^\\s{2}${name}:`, "m").test(raw)) into.add(label);
  }
}

function techFromCsproj(raw: string, into: Set<string>) {
  into.add("C#");
  const tfm = raw.match(/<TargetFramework>([^<]+)<\/TargetFramework>/)?.[1];
  if (tfm) {
    const v = tfm.match(/^net(\d+)\.\d/);
    into.add(v ? `.NET ${v[1]}` : tfm.startsWith("net4") ? ".NET Framework" : tfm);
  } else if (/<TargetFrameworkVersion>v4/.test(raw)) {
    into.add(".NET Framework");
  }
  if (/<UseWindowsForms>true/i.test(raw) || /System\.Windows\.Forms/.test(raw)) into.add("WinForms");
  if (/<UseWPF>true/i.test(raw)) into.add("WPF");
  if (/Dapper/.test(raw)) into.add("Dapper");
  if (/Microsoft\.EntityFrameworkCore/.test(raw)) into.add("Entity Framework Core");
}

function techFromPom(raw: string, into: Set<string>) {
  into.add("Java");
  into.add("Maven");
  if (/spring-boot/.test(raw)) into.add("Spring Boot");
  if (/spring-boot-starter-security|spring-security/.test(raw)) into.add("Spring Security");
  if (/spring-boot-starter-data-jpa|hibernate/.test(raw)) into.add("JPA / Hibernate");
  if (/<artifactId>postgresql<\/artifactId>/.test(raw)) into.add("PostgreSQL");
  if (/<artifactId>mysql-connector/.test(raw)) into.add("MySQL");
  if (/jjwt|java-jwt/.test(raw)) into.add("JWT");
}

function techFromPaths(paths: string[], into: Set<string>) {
  const has = (re: RegExp) => paths.some((p) => re.test(p));
  if (has(/(^|\/)docker-compose\.ya?ml$|(^|\/)Dockerfile$/)) into.add("Docker");
  if (has(/\.sqlproj$/)) into.add("SQL Server");
  if (has(/(^|\/)supabase\/migrations\//)) into.add("Supabase");
  if (has(/\.sql$/)) into.add("SQL");
  if (has(/(^|\/)requirements\.txt$|\.py$/)) into.add("Python");
  if (has(/\.php$/)) into.add("PHP");
  if (has(/\.java$/)) into.add("Java");
  if (has(/(^|\/)vercel\.json$/)) into.add("Vercel");
  if (has(/(^|\/)\.github\/workflows\//)) into.add("GitHub Actions");
  if (has(/\.html$/)) into.add("HTML");
  if (has(/\.css$/)) into.add("CSS");
  if (has(/(^|\/)android\/app\/src\/main\/AndroidManifest\.xml$/)) into.add("Android");
}

const MANIFEST = /(^|\/)(package\.json|pubspec\.yaml|pom\.xml|[^/]+\.csproj)$/;
const SKIP_DIR = /(^|\/)(node_modules|vendor|build|dist|\.dart_tool|packages|bin|obj|ios\/Pods)\//;
const NEVER_FETCH = /(^|\/)\.env|secret|credential|\.pem$|\.key$|\.jks$|\.keystore$|key\.properties$/i;

// ---------------------------------------------------------------------------
// Classification

const COURSEWORK =
  /\b(LE\d+|ACT\d+|activity|assignment|final project|lab|mini-project)\b|homework|ITS\d{3}|KanekoLE\d/i;

function classify(
  repo: ApiRepo,
  ctx: { empty: boolean; commits: number; fileCount: number; paths: string[]; readme: ReadmeInfo | null },
): { category: Category; reasons: string[] } {
  const reasons: string[] = [];
  if (repo.name.toLowerCase() === repo.owner.login.toLowerCase()) {
    return { category: "profile", reasons: ["GitHub profile README repository"] };
  }
  if (repo.fork) return { category: "fork", reasons: ["Forked from another repository"] };
  if (ctx.empty || ctx.fileCount === 0) {
    return { category: "empty", reasons: ["Repository has no files"] };
  }
  const haystack = `${repo.name} ${repo.description ?? ""}`;
  if (COURSEWORK.test(haystack)) {
    reasons.push("Name or description matches a course activity pattern");
    return { category: "coursework", reasons };
  }
  if (ctx.paths.some((p) => COURSEWORK.test(p.split("/").pop() ?? ""))) {
    reasons.push("File names match a course activity pattern");
    return { category: "coursework", reasons };
  }
  if (/in development|work in progress|\bwip\b/i.test(`${repo.description ?? ""} ${ctx.readme?.summary ?? ""}`)) {
    reasons.push("Description says it is still in development");
    return { category: "in-progress", reasons };
  }
  if (ctx.commits <= 2 && !ctx.readme?.summary) {
    reasons.push("Very few commits and no README description");
    return { category: "in-progress", reasons };
  }
  reasons.push("Has a README description and real source files");
  return { category: "project", reasons };
}

// ---------------------------------------------------------------------------

async function analyzeRepo(repo: ApiRepo, opts: { downloadAssets: boolean }) {
  const full = repo.full_name;
  console.log(`  analysing ${full}`);

  const [languages, contributors, commits, tree, readmeRaw, releases] = await Promise.all([
    json<Record<string, number>>(`/repos/${full}/languages`),
    json<{ login: string; contributions: number; type: string }[]>(`/repos/${full}/contributors?per_page=100`),
    countPaginated(`/repos/${full}/commits`),
    json<{ tree: TreeEntry[]; truncated: boolean }>(
      `/repos/${full}/git/trees/${encodeURIComponent(repo.default_branch)}?recursive=1`,
    ),
    text(`/repos/${full}/readme`),
    countPaginated(`/repos/${full}/releases`),
  ]);

  const blobs = (tree?.tree ?? []).filter((e) => e.type === "blob");
  const paths = blobs.map((b) => b.path);
  const empty = repo.size === 0 && paths.length === 0;
  const readme = readmeRaw ? parseReadme(readmeRaw) : null;

  // Tech stack: GitHub's language stats + manifests + well-known paths.
  const tech = new Set<string>();
  const manifests = paths
    .filter((p) => MANIFEST.test(p) && !SKIP_DIR.test(p) && !NEVER_FETCH.test(p) && p.split("/").length <= 4)
    .slice(0, 6);
  for (const p of manifests) {
    const raw = await text(`/repos/${full}/contents/${p.split("/").map(encodeURIComponent).join("/")}`);
    if (!raw) continue;
    if (p.endsWith("package.json")) techFromPackageJson(raw, tech);
    else if (p.endsWith("pubspec.yaml")) techFromPubspec(raw, tech);
    else if (p.endsWith(".csproj")) techFromCsproj(raw, tech);
    else if (p.endsWith("pom.xml")) techFromPom(raw, tech);
  }
  techFromPaths(paths.filter((p) => !SKIP_DIR.test(p)), tech);

  const topDirs = [
    ...new Set(paths.filter((p) => p.includes("/") && !SKIP_DIR.test(p)).map((p) => p.split("/")[0])),
  ].slice(0, 12);

  // Ownership from contributor stats (default branch).
  const people = (contributors ?? []).filter((c) => c.type !== "Bot");
  const totalByContributors = people.reduce((n, c) => n + c.contributions, 0);
  const mine = people.find((c) => c.login.toLowerCase() === username.toLowerCase())?.contributions ?? 0;

  const { category, reasons } = classify(repo, {
    empty,
    commits,
    fileCount: paths.length,
    paths,
    readme,
  });

  // Screenshots: images the README references, or files in a screenshots folder.
  const screenshots: { src: string; path: string }[] = [];
  if (opts.downloadAssets && (category === "project" || category === "in-progress")) {
    const candidates = new Set<string>();
    for (const img of readme?.images ?? []) {
      const clean = img.replace(/^\.?\//, "").split(/[?#]/)[0];
      if (paths.includes(clean)) candidates.add(clean);
    }
    for (const p of paths) {
      if (/(^|\/)(screenshots?|screens|preview|demo)\/[^/]+\.(png|jpe?g|webp|gif)$/i.test(p)) candidates.add(p);
    }
    for (const p of [...candidates].slice(0, 4)) {
      const entry = blobs.find((b) => b.path === p);
      if (!entry || (entry.size ?? 0) > 2_000_000 || NEVER_FETCH.test(p)) continue;
      if (/(logo|icon|favicon|badge|banner)[^/]*$/i.test(p)) continue; // branding, not a screenshot
      const res = await gh(
        `/repos/${full}/contents/${p.split("/").map(encodeURIComponent).join("/")}`,
        "application/vnd.github.raw+json",
      );
      if (!res.ok) continue;
      const fileName = p.replace(/[^A-Za-z0-9._-]+/g, "_");
      const dir = path.join(assetDir, repo.name);
      await mkdir(dir, { recursive: true });
      await writeFile(path.join(dir, fileName), Buffer.from(await res.arrayBuffer()));
      screenshots.push({ src: `/github/${repo.name}/${fileName}`, path: p });
    }
  }

  return {
    name: repo.name,
    fullName: full,
    owner: repo.owner.login,
    description: repo.description ? scrub(repo.description) : null,
    htmlUrl: repo.html_url,
    homepage: repo.homepage || null,
    language: repo.language,
    languages: languages ?? {},
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    fork: repo.fork,
    archived: repo.archived,
    topics: repo.topics ?? [],
    license: repo.license?.spdx_id && repo.license.spdx_id !== "NOASSERTION" ? repo.license.spdx_id : null,
    createdAt: repo.created_at,
    pushedAt: repo.pushed_at,
    analysis: {
      category,
      categoryReasons: reasons,
      commits,
      releases,
      fileCount: paths.length,
      treeTruncated: tree?.truncated ?? false,
      topDirs,
      tech: [...tech].sort(),
      readme: readme && {
        title: readme.title ? plain(readme.title) : null,
        summary: readme.summary,
        headings: readme.headings,
        features: readme.features,
      },
      ownership: {
        yourCommits: mine,
        totalCommits: totalByContributors,
        contributors: people.map((c) => ({ login: c.login, commits: c.contributions })),
        soleAuthor: people.length > 0 && people.every((c) => c.login.toLowerCase() === username.toLowerCase()),
      },
      screenshots,
    },
  };
}

async function contributions() {
  try {
    return (await fetchAllContributions(username, token)).data;
  } catch (err) {
    console.warn(`  contributions unavailable: ${err instanceof Error ? err.message : err}`);
    return null;
  }
}

async function main() {
  console.log(`Syncing GitHub data for ${username}`);
  const profile = await json<{
    login: string;
    name: string | null;
    avatar_url: string;
    bio: string | null;
    public_repos: number;
    followers: number;
    following: number;
    html_url: string;
    created_at: string;
  }>(`/users/${username}`);
  if (!profile) throw new Error(`GitHub user ${username} not found`);

  // /users/:user/repos only ever lists public repositories, even with a token.
  const repos = ((await json<ApiRepo[]>(`/users/${username}/repos?per_page=100&type=owner&sort=pushed`)) ?? []).filter(
    (r) => !r.private,
  );

  await rm(assetDir, { recursive: true, force: true });
  await mkdir(assetDir, { recursive: true });

  const analysed = [];
  for (const repo of repos) analysed.push(await analyzeRepo(repo, { downloadAssets: true }));

  const external = [];
  for (const fullName of site.github.extraRepos) {
    const repo = await json<ApiRepo>(`/repos/${fullName}`);
    if (!repo || repo.private) {
      console.warn(`  skipping ${fullName}: not found or not public`);
      continue;
    }
    external.push(await analyzeRepo(repo, { downloadAssets: false }));
  }

  const snapshot = {
    generatedAt: new Date().toISOString(),
    username,
    profile: {
      login: profile.login,
      name: profile.name,
      avatarUrl: profile.avatar_url,
      bio: profile.bio,
      publicRepos: profile.public_repos,
      followers: profile.followers,
      following: profile.following,
      htmlUrl: profile.html_url,
      createdAt: profile.created_at,
    },
    stars: repos.reduce((n, r) => n + r.stargazers_count, 0),
    contributions: await contributions(),
    repos: analysed,
    externalRepos: external,
  };

  await mkdir(path.dirname(snapshotPath), { recursive: true });
  await writeFile(snapshotPath, JSON.stringify(snapshot, null, 2) + "\n");
  console.log(
    `Wrote ${path.relative(root, snapshotPath)}: ${analysed.length} repos, ${external.length} external, ${requestCount} API requests.`,
  );
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
