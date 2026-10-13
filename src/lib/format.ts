// Formatting helpers. Dates are always formatted in UTC with a fixed locale so
// server and client output match during hydration.

const dateFmt = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

const monthFmt = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", timeZone: "UTC" });

const dateTimeFmt = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
  timeZoneName: "short",
});

export const formatDate = (iso: string) => dateFmt.format(new Date(iso));
export const formatMonth = (iso: string) => monthFmt.format(new Date(iso));
export const formatDateTime = (iso: string) => dateTimeFmt.format(new Date(iso));
export const formatNumber = (n: number) => n.toLocaleString("en-US");

// GitHub linguist colours for the languages that appear on this profile.
const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Dart: "#00b4ab",
  "C#": "#178600",
  Python: "#3572a5",
  Java: "#b07219",
  PHP: "#4f5d95",
  HTML: "#e34c26",
  CSS: "#663399",
  TSQL: "#e38c00",
  PLpgSQL: "#336790",
  Kotlin: "#a97bff",
  Swift: "#f05138",
  "C++": "#f34b7d",
  C: "#555555",
  Shell: "#89e051",
};

export const languageColor = (lang: string | null | undefined) =>
  (lang && LANGUAGE_COLORS[lang]) || "#64748b";
