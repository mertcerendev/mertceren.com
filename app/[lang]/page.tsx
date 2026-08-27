import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/sections/hero";
import { Works } from "@/components/sections/works";
import { About } from "@/components/sections/about";
import { Skills } from "@/components/sections/skills";
import { Awards } from "@/components/sections/awards";
import { Certificates } from "@/components/sections/certificates";
import { GithubStats } from "@/components/sections/github";
import { Contact } from "@/components/sections/contact";
import { isLocale } from "@/lib/content";
import { getGithubStats } from "@/lib/github";

/**
 * One hour. Still prerendered — this only adds a refresh window on top: the
 * GitHub numbers are rebuilt at most once an hour and every request in
 * between is served the static HTML, same as before.
 *
 * Written as a literal on purpose. Next reads segment config statically, so
 * importing GITHUB_REVALIDATE_SECONDS from lib/github here fails the build
 * with "Invalid segment configuration export". Keep the two in step.
 */
export const revalidate = 3600;

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const stats = await getGithubStats();

  /* Formatted here rather than in the client component: a date rendered
     through Intl on both sides of hydration can disagree if the server and
     the browser resolve the locale differently. Passing the finished string
     removes the question. */
  const lastPushLabel = stats?.lastPush
    ? new Intl.DateTimeFormat(lang === "tr" ? "tr-TR" : "en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(stats.lastPush))
    : null;

  return (
    <>
      <Header />
      <main id="main">
        <Hero />
        <Works />
        <About />
        <Skills />
        <GithubStats stats={stats} lastPushLabel={lastPushLabel} />
        <Certificates />
        <Awards />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
