import { Suspense } from "react";
import { ActivitySection, ActivitySkeleton, RecentRepos } from "@/components/github/github-section";
import { Hero } from "@/components/hero";
import { AboutSection, SkillsSection } from "@/components/home-sections";
import { LatestProjects } from "@/components/project-cards";
import { site } from "@/content/site";
import { githubUsername } from "@/lib/github";
import { siteUrl } from "@/lib/site-url";

export default function Home() {
  const githubUrl = `https://github.com/${githubUsername()}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    jobTitle: "Cybersecurity Graduate",
    url: siteUrl().toString(),
    email: `mailto:${site.links.email}`,
    sameAs: [githubUrl, site.links.linkedin, site.links.orcid].filter(Boolean),
    alumniOf: { "@type": "CollegeOrUniversity", name: "Mapúa University" },
    knowsAbout: ["Cybersecurity", "Network security", "Vulnerability assessment", "Networking", "Secure backend development"],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Hero />
      <Suspense fallback={<ActivitySkeleton />}>
        <ActivitySection />
      </Suspense>
      <AboutSection />
      <SkillsSection />
      <LatestProjects />
      <Suspense fallback={null}>
        <RecentRepos />
      </Suspense>
    </>
  );
}
