// Returns a real 404 status for unknown project slugs. Without this, the
// page's static shell starts streaming before notFound() runs, so the
// not-found UI would arrive with a 200 (still marked noindex).

import { NextResponse, type NextRequest } from "next/server";
import { projects } from "@/content/projects";

const known = new Set(projects.filter((p) => !p.hidden).map((p) => p.slug));

export function proxy(request: NextRequest) {
  const slug = request.nextUrl.pathname.split("/")[2];
  if (slug && !known.has(decodeURIComponent(slug))) {
    // No route matches this path, so Next renders the not-found page.
    return NextResponse.rewrite(new URL("/__not-found", request.url), { status: 404 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/projects/:slug",
};
