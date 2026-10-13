import { site } from "@/content/site";

export function siteUrl(): URL {
  const configured = site.url ?? process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return new URL(configured);
  // Set automatically by Vercel at build time.
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return new URL(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
  }
  return new URL("http://localhost:3000");
}
