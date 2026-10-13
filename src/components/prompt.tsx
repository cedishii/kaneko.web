import { site } from "@/content/site";

const user = site.greetingName.toLowerCase();
const host = site.shortName.split(" ").at(-1)?.toLowerCase() ?? "localhost";

// A shell prompt line: `cedrick@kaneko:~$ <cmd>`. Decorative, so it is hidden
// from screen readers; headings carry the real meaning.
export function Prompt({ cmd, path = "~", caret = false, className = "" }: { cmd: string; path?: string; caret?: boolean; className?: string }) {
  return (
    <p aria-hidden className={`font-mono text-xs sm:text-[0.8rem] ${className}`}>
      {/* user@host:path is dropped on narrow screens to keep the line short. */}
      <span className="hidden sm:inline">
        <span className="text-term">
          {user}@{host}
        </span>
        <span className="text-dim">:</span>
        <span className="text-accent">{path}</span>
      </span>
      <span className="text-term sm:text-dim">$ </span>
      <span className="text-ink/85">{cmd}</span>
      {caret ? <span className="caret" /> : null}
    </p>
  );
}
