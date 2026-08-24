import type { Metadata } from "next";
import { ViewTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { RevealText } from "@/components/ui/reveal-text";
import { getContent, isLocale, localePath, locales } from "@/lib/content";
import { foreignLang } from "@/lib/foreign";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const { ui, profile, site } = getContent(lang);
  /* "All projects", not the home page section's "Selected Works" — this
     page is the full list, and the link that reaches it says so. */
  const title = `${ui.workIndex.allProjects} — ${profile.name}`;
  return {
    title,
    description: site.description,
    alternates: {
      canonical: localePath(lang, "/work"),
      languages: {
        tr: localePath("tr", "/work"),
        en: localePath("en", "/work"),
      },
    },
    openGraph: {
      title,
      description: site.description,
      url: localePath(lang, "/work"),
      siteName: profile.name,
      locale: lang === "tr" ? "tr_TR" : "en_US",
      type: "website",
    },
  };
}

/**
 * The index the case studies always implied. `/work` answered 404 while
 * `/work/<slug>` worked, so trimming the URL — or a crawler reaching for the
 * parent — hit a dead end.
 *
 * Deliberately a list rather than a second copy of the home page's sticky
 * stack: that treatment is the home page's argument, and repeating it here
 * would say the same thing twice. This is the reference view.
 */
export default async function WorkIndexPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const { projects, ui } = getContent(lang);

  return (
    <>
      <Header />
      <main id="main" className="px-5 pb-24 pt-28 sm:px-8 sm:pt-32 lg:px-12">
        <div className="flex items-baseline justify-between border-t hairline pt-4">
          <Link
            href={localePath(lang, "/")}
            className="microlabel tap-target transition-colors duration-300 hover:text-accent"
          >
            {ui.workIndex.back}
          </Link>
          <p className="microlabel">{ui.workIndex.meta}</p>
        </div>

        <RevealText
          as="h1"
          lines={[ui.workIndex.allProjects]}
          className="mt-12 font-display text-display-xl font-extrabold uppercase leading-none tracking-tight"
        />

        <ul className="mt-20">
          {projects.map((project, index) => (
            <li key={project.slug}>
              <Link
                href={localePath(lang, `/work/${project.slug}`)}
                className="group grid gap-6 border-t hairline py-10 transition-colors duration-500 sm:grid-cols-[1fr_minmax(0,18rem)] sm:items-center sm:gap-12 sm:py-14"
              >
                <div>
                  <p className="microlabel">
                    <span className="text-accent">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="mx-3 select-none" aria-hidden>
                      —
                    </span>
                    {project.category}
                    <span className="mx-3 select-none" aria-hidden>
                      ·
                    </span>
                    {project.year}
                  </p>
                  <h2 className="mt-4 font-display text-display-md font-extrabold uppercase leading-none tracking-tight transition-colors duration-500 group-hover:text-accent">
                    {project.title}
                  </h2>
                  {/* Two lines here against the card's three: this row is a
                      way through to the case study, not the case itself. */}
                  <p className="mt-4 line-clamp-2 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
                    {project.description}
                  </p>
                  <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                    <ul className="flex flex-wrap gap-2">
                      {project.tags.slice(0, 3).map((tag) => (
                        <li
                          key={tag}
                          lang={foreignLang(tag)}
                          className="rounded-full border hairline px-3 py-1 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-muted sm:text-[0.625rem]"
                        >
                          {tag}
                        </li>
                      ))}
                    </ul>
                    <span className="microlabel text-foreground transition-colors duration-500 group-hover:text-accent">
                      {ui.workIndex.view}
                      <span
                        aria-hidden
                        className="ml-2 inline-block transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1"
                      >
                        ↗
                      </span>
                    </span>
                  </div>
                </div>

                {project.image && (
                  <div
                    className="relative aspect-[4/3] overflow-hidden rounded-xl border hairline"
                    style={{
                      background: `linear-gradient(140deg, ${project.palette.from}, ${project.palette.to})`,
                    }}
                  >
                    <ViewTransition name={`shot-${project.slug}`}>
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 288px"
                        className="object-cover object-left-top transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                      />
                    </ViewTransition>
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </>
  );
}
