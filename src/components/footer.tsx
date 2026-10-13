import { cacheLife } from "next/cache";
import { site } from "@/content/site";

async function currentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getUTCFullYear();
}

export async function Footer({ githubUrl }: { githubUrl: string }) {
  const year = await currentYear();
  return (
    <footer className="mx-auto mt-16 max-w-[56rem] border-t border-line px-5 py-8 sm:px-8">
      <div className="flex flex-col gap-3 text-xs text-dim sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          {site.motto ? <p className="font-mono text-accent-soft/80">&gt; {site.motto}</p> : null}
          <p>
            © {year} {site.name}. GitHub data refreshes hourly. <span className="font-mono">[exit 0]</span>
          </p>
        </div>
        <p className="flex gap-4">
          <a href={githubUrl} target="_blank" rel="noreferrer" className="hover:text-accent-soft">
            GitHub
          </a>
          <a href={site.links.linkedin} target="_blank" rel="noreferrer" className="hover:text-accent-soft">
            LinkedIn
          </a>
          <a href="#top" className="hover:text-accent-soft">
            Back to top ↑
          </a>
        </p>
      </div>
    </footer>
  );
}
