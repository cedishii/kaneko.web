# ~/kaneko_ — personal portfolio

Personal developer portfolio of Cedrick Miguel Peji Kaneko: a dark, purple-accented site with a sidebar layout,
live GitHub data (all-time contribution graph, repositories), project case studies built from verified repository
information, and editable experience and skills.

Pages: `/` (hero, activity, about, skills, latest projects, recently updated repos), `/projects` (case studies + every
public repository), `/projects/<slug>` (case study), `/experience` (timeline + certifications), `/contact`.

Built with Next.js 16 (App Router, Cache Components), React 19, TypeScript, Tailwind CSS 4 and Motion.

## Run it locally

Requires Node.js 20.9 or newer.

```bash
npm install
npm run dev          # http://localhost:3000
```

Production build and checks:

```bash
npm run lint
npm run typecheck
npm run build
npm start            # serves the production build on http://localhost:3000
```

## Where everything is configured

All content lives in `src/content/`. You never need to touch components to change what the site says.

| What | File |
|---|---|
| Name, greeting, sidebar role, tagline, location, email, LinkedIn, ORCID, résumé, site URL | `src/content/site.ts` |
| GitHub username, pinned / hidden repos, other people's repos you contributed to | `src/content/site.ts` → `github` |
| Project case studies (order, featured, hidden, links, screenshots, contributions) | `src/content/projects.ts` |
| About text, experience timeline, education, certifications | `src/content/experience.ts` |
| Skills | `src/content/skills.ts` |

### GitHub username

Set `site.github.username` in `src/content/site.ts` (currently `cedishii`). The `GITHUB_USERNAME` environment variable
overrides it, so a deployment can point at a different account without a code change. See `.env.example`.

### Résumé

1. Put the PDF at `public/resume.pdf`. Check it first: everything in `public/` is downloadable by anyone, so remove
   your phone number or home address if you don't want those published.
2. Set `resume: "/resume.pdf"` in `src/content/site.ts`.

While `resume` is `null`, the résumé buttons become "Request my résumé" e-mail links instead.

### Projects

Each entry in `src/content/projects.ts` is one case study at `/projects/<slug>`.

- **Order:** the order of the array is the order on the site.
- **`featured: true`:** shows the project in the main grid. Otherwise it appears under "more projects".
- **`hidden: true`:** removes the project without deleting it.
- **`repo: "owner/name"`:** links a public repository. The source link only appears once the sync script (below) has
  confirmed the repo is public. Leave it out for private work.
- **`demoUrl`:** only add URLs you have checked work.
- **`screenshots`:** paths under `public/`, e.g. `/projects/consulta/booking.png`. Without them, images referenced in
  the repo's README are used if the sync found any.
- **`contributions`:** each item has an `evidence` of `commit-history`, `sole-author` or `self-reported`. The site
  shows that label next to the claim, so mark anything you can't point to in Git history as `self-reported`.

## GitHub data: how it works

There are two layers.

**1. Live data, at runtime.** The GitHub section (profile counts, stars, contribution calendar, repository list) is
fetched on the server in `src/lib/github.ts` and cached with `use cache` for an hour. Visitors never call GitHub
themselves, and no token ever reaches the browser. If a request fails (rate limit, outage, timeout), that piece falls
back to the build-time snapshot, and the page labels it as a cached snapshot with the reason. Failed results are
retried after about 15 minutes.

**2. Repository analysis, at build time.** `scripts/sync-github.mts` reads each public repository's metadata,
languages, contributors, commit count, file tree, README, releases and dependency manifests (`package.json`,
`pubspec.yaml`, `*.csproj`, `pom.xml`), then writes `src/data/github-snapshot.json`. That analysis drives:

- the category labels (project, in progress, coursework, fork, empty)
- the detected tech stack and README summaries on repository cards
- the ownership numbers on case studies ("Team · 78 of 445 commits", "Solo · 28 commits")
- screenshots referenced in READMEs, which are downloaded to `public/github/`

The script never reads or stores source code, skips private repositories and `.env`/key files, and scrubs e-mail
addresses and anything that looks like a credential from README excerpts. Re-run it whenever your repositories
change, then commit the updated snapshot:

```bash
# PowerShell
$env:GITHUB_TOKEN = (gh auth token); npm run sync:github
# bash
GITHUB_TOKEN=$(gh auth token) npm run sync:github
```

A token is needed for the sync because it makes roughly 120 API requests, more than the 60/hour unauthenticated
limit. Any token works, since only public endpoints are called.

### Contribution graph data source

The Activity section shows **overall** contributions: every year since your first contribution, summed. The graph has
tabs for the last 12 months and for each individual year.

GitHub's REST API has no contribution calendar.

- **With `GITHUB_TOKEN` set on the server:** the site uses GitHub's official GraphQL API.
- **Without a token:** it uses [github-contributions-api.jogruber.de](https://github.com/grubersjoe/github-contributions-api),
  a free third-party service that mirrors the public profile calendar. That makes it an external dependency. If it is
  down, the calendar falls back to the snapshot.

The badge above the calendar always says which source was used.

## Deploying (Vercel)

1. Push this folder to a GitHub repository.
2. In Vercel, use **Add New → Project** and import the repository. The framework preset is detected automatically.
3. Optional, recommended: under **Settings → Environment Variables**, add `GITHUB_TOKEN`. Use a fine-grained personal
   access token with *Public repositories (read-only)* access and nothing else. It raises the API limit to
   5,000/hour and switches the calendar to GitHub's own API.
4. Optional: add `NEXT_PUBLIC_SITE_URL` (or set `site.url`) once you have a custom domain, so canonical links, the
   sitemap and social previews use it. Without it, Vercel's production URL is used.
5. Deploy.

The site runs on any Node.js host that supports Next.js (`npm run build && npm start`). It is not a static export,
because the hourly GitHub refresh needs a server.

## Accessibility and performance notes

- Animations respect `prefers-reduced-motion`. With it on, the hero terminal renders instantly and transform
  animations are disabled.
- Everything is keyboard accessible: there is a skip link, visible focus rings, and the contribution graph can be
  read with the arrow keys and announces each day to screen readers.
- The page is prerendered. GitHub data is part of the static HTML and is regenerated in the background.
- Unknown project URLs return a real 404 (see `src/proxy.ts`).

## Project structure

```text
scripts/sync-github.mts      build-time repository analysis → src/data/github-snapshot.json
src/content/                 everything you edit: site, projects, experience, skills
src/data/                    generated GitHub snapshot (commit it)
src/lib/                     GitHub fetching + fallback, project merging, formatting
src/components/              sidebar, hero, home sections, project cards, GitHub sections, UI pieces
src/app/                     routes: home, /projects, /projects/[slug], /experience, /contact, sitemap, robots, OG image
```
