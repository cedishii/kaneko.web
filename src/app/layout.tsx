import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Nunito } from "next/font/google";
import { Backdrop } from "@/components/backdrop";
import { Footer } from "@/components/footer";
import { MotionProvider } from "@/components/motion";
import { Sidebar } from "@/components/sidebar";
import { site } from "@/content/site";
import { githubUsername } from "@/lib/github";
import { siteUrl } from "@/lib/site-url";
import { snapshot } from "@/lib/snapshot";
import "./globals.css";

const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"] });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"] });

const title = `${site.shortName} · Cybersecurity, Networking & Secure Backend`;
const description = `${site.tagline} Portfolio of ${site.name}, BSIT graduate specializing in cybersecurity and networking, with secure backend development experience.`;

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: { default: title, template: `%s · ${site.shortName}` },
  description,
  applicationName: `${site.shortName} portfolio`,
  authors: [{ name: site.name }],
  creator: site.name,
  keywords: ["cybersecurity", "network security", "vulnerability assessment", "networking", "backend developer", "BSIT", "Node.js", "PostgreSQL", "portfolio", site.name],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    title,
    description,
    siteName: `${site.shortName} portfolio`,
    locale: "en_US",
    url: "/",
  },
  twitter: { card: "summary_large_image", title, description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#121118",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const username = githubUsername();
  const githubUrl = `https://github.com/${username}`;
  // Avatar from the build-time snapshot, only if it belongs to this account.
  const avatarUrl = snapshot.username.toLowerCase() === username.toLowerCase() ? snapshot.profile.avatarUrl : null;

  return (
    <html lang="en" className={`${nunito.variable} ${jetbrains.variable}`}>
      <body id="top" className="min-h-screen overflow-x-hidden">
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <a
          href="#main"
          className="sr-only z-[60] rounded-lg bg-accent px-4 py-2 text-sm font-bold text-bg focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <MotionProvider>
          <Sidebar
            name={site.shortName}
            role={site.sidebarRole}
            avatarUrl={avatarUrl}
            email={site.links.email}
            githubUrl={githubUrl}
            linkedinUrl={site.links.linkedin}
            resume={site.resume}
          />
          <div className="relative isolate min-h-screen pt-16 lg:pl-56 lg:pt-0">
            <Backdrop />
            <main id="main" className="mx-auto max-w-[56rem] px-5 sm:px-8">
              {children}
            </main>
            <Footer githubUrl={githubUrl} />
          </div>
        </MotionProvider>
        <div aria-hidden className="crt" />
      </body>
    </html>
  );
}
