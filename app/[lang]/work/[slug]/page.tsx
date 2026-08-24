import type { Metadata } from "next";
import { ViewTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { RevealText } from "@/components/ui/reveal-text";
import { Magnetic } from "@/components/ui/magnetic-button";
import { getContent, isLocale, localePath } from "@/lib/content";
import { projects } from "@/lib/data";
import { foreignLang } from "@/lib/foreign";
import { AskAiButton } from "@/components/ui/ask-ai-button";

type Params = { lang: string; slug: string };

export function generateStaticParams(): Array<Pick<Params, "slug">> {
  return projects.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const { projects: localizedProjects, profile } = getContent(lang);
  const project = localizedProjects.find((p) => p.slug === slug);
  if (!project) return {};
  const title = `${project.title} — ${profile.name}`;
  return {
    title,
    description: project.description,
    alternates: {
      canonical: localePath(lang, `/work/${slug}`),
      languages: {
        tr: localePath("tr", `/work/${slug}`),
        en: localePath("en", `/work/${slug}`),
      },
    },
    /* Metadata merges per field, not per object: the layout sets a whole
       openGraph block and overriding title/description above left it
       untouched, so sharing any case study produced the home page's card —
       its headline, its description, and an og:url pointing at "/". Restated
       here for this page. Images are left out on purpose; the colocated
       opengraph-image.tsx is file-based metadata, which outranks this. */
    openGraph: {
      title,
      description: project.description,
      url: localePath(lang, `/work/${slug}`),
      siteName: profile.name,
      locale: lang === "tr" ? "tr_TR" : "en_US",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: project.description,
    },
  };
}

const BLOCKS = ["challenge", "approach", "outcome"] as const;

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const { projects: localizedProjects, ui } = getContent(lang);
  const index = localizedProjects.findIndex((p) => p.slug === slug);
  if (index === -1) notFound();
  const project = localizedProjects[index];
  const next = localizedProjects[(index + 1) % localizedProjects.length];
  const { palette, caseStudy } = project;

  return (
    <>
      <Header />
      <main id="main" className="px-5 pb-24 pt-28 sm:px-8 sm:pt-32 lg:px-12">
        {/* Breadcrumb row */}
        <div className="flex items-baseline justify-between border-t hairline pt-4">
          <Link
            href={`${localePath(lang, "/")}#work`}
            className="microlabel tap-target transition-colors duration-300 hover:text-accent"
          >
            {ui.caseStudy.back}
          </Link>
          <p className="microlabel">
            {String(index + 1).padStart(2, "0")} /{" "}
            {String(localizedProjects.length).padStart(2, "0")}
          </p>
        </div>

        {/* Title */}
        <RevealText
          as="h1"
          lines={[project.title]}
          className="mt-12 font-display text-display-xl font-extrabold uppercase leading-none tracking-tight"
        />
        <div className="mt-6 flex flex-wrap items-baseline justify-between gap-x-10 gap-y-4">
          <p className="microlabel">
            {project.category}
            <span className="mx-3 select-none" aria-hidden>
              —
            </span>
            {project.year}
          </p>
          <ul className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <li
                key={tag}
                lang={foreignLang(tag)}
                className="rounded-full border hairline px-3 py-1 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-muted sm:text-[0.625rem]"
              >
                {tag}
              </li>
            ))}
          </ul>
        </div>

        {/* Hero: the project's palette as the ground, the real screenshot
            standing on it. The gradient used to be the whole banner with a
            note to swap in a screenshot later — the screenshots were already
            sitting in /public/projects, so this is that swap. Keeping the
            gradient behind gives the shot somewhere to sit and keeps the
            per-project colour that the cards on the index page establish. */}
        <div className="relative mt-10 overflow-hidden rounded-2xl sm:rounded-3xl">
          {/* 4/3 on a phone rather than 16/9: the panel below is square and
              a 16/9 band left it 157px wide, too small to read a dashboard
              in. The wide 21/9 band returns from sm up, where there is room
              for the numeral beside it. */}
          <div
            aria-hidden
            className="aspect-[4/3] w-full sm:aspect-[21/9]"
            style={{
              background: [
                `radial-gradient(110% 90% at 12% 12%, ${palette.from} 0%, transparent 55%)`,
                `radial-gradient(95% 85% at 88% 25%, ${palette.via} 0%, transparent 62%)`,
                `radial-gradient(130% 130% at 50% 105%, ${palette.to} 0%, #0a0a0b 100%)`,
                "#0a0a0b",
              ].join(", "),
            }}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 select-none font-display text-[22vw] font-extrabold leading-none text-white/[0.05] sm:text-[14vw]"
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          {project.image && (
            /* Square panel rather than a wide crop: these are 1024×1024
               dashboard mockups whose bottom third carries real content
               (logs, transport controls), and cropping them to the banner's
               21/9 would throw it away. Centred on a phone, pushed right on
               wider screens so the index numeral behind it stays readable. */
            <div className="absolute inset-y-[7%] left-1/2 aspect-square -translate-x-1/2 overflow-hidden rounded-lg border border-white/15 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.75)] sm:inset-y-[8%] sm:left-auto sm:right-[8%] sm:translate-x-0 sm:rounded-xl">
              {/* The LCP element on this page, so it is preloaded rather than
                  discovered halfway down the body. The name pairs it with
                  the same shot on the card that opened this page. */}
              <ViewTransition name={`shot-${project.slug}`}>
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  preload
                  sizes="(max-width: 640px) 60vw, 430px"
                  className="object-cover"
                />
              </ViewTransition>
            </div>
          )}
        </div>

        {/* Intro + facts */}
        <div className="mt-16 grid gap-12 lg:grid-cols-[7fr_5fr] lg:gap-20">
          <p className="max-w-2xl font-display text-display-md font-bold leading-[1.15] tracking-tight">
            {caseStudy.intro}
          </p>
          <dl className="self-start border-t hairline">
            {caseStudy.facts.map((fact) => (
              <div
                key={fact.label}
                className="flex items-baseline justify-between gap-6 border-b hairline py-4"
              >
                <dt className="microlabel">{fact.label}</dt>
                <dd className="text-sm font-medium sm:text-base">{fact.value}</dd>
              </div>
            ))}
            {project.href !== "#" && (
              <div className="flex items-baseline justify-between gap-6 border-b hairline py-4">
                <dt className="microlabel">{ui.caseStudy.live}</dt>
                <dd>
                  <a
                    href={project.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-accent hover:underline sm:text-base"
                  >
                    {ui.caseStudy.visit}
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Narrative blocks */}
        <div className="mt-20 space-y-14 sm:mt-24">
          {BLOCKS.map((block, i) => (
            <section key={block} className="grid gap-4 border-t hairline pt-6 sm:grid-cols-[16rem_1fr] sm:gap-10">
              <h2 className="microlabel">
                <span className="text-accent">0{i + 1}</span>
                <span className="mx-3 select-none" aria-hidden>
                  —
                </span>
                {ui.caseStudy.blocks[block]}
              </h2>
              <p className="max-w-2xl text-sm leading-relaxed text-foreground/85 sm:text-base">
                {caseStudy[block]}
              </p>
            </section>
          ))}
        </div>

        {/* Contextual AI Copilot Callout */}
        {project.aiPrompt && (
          <div className="mt-20 flex flex-col items-start justify-between gap-6 rounded-2xl border hairline bg-surface/40 p-6 backdrop-blur-sm sm:flex-row sm:items-center sm:p-8">
            <div className="space-y-1">
              <p className="font-display text-lg font-bold text-foreground">
                {lang === "tr"
                  ? "Bu proje hakkında merak ettiklerin mi var?"
                  : "Curious about the technical details?"}
              </p>
              <p className="text-sm text-muted">
                {lang === "tr"
                  ? "Mimari kararları, model eğitimi ve entegrasyon süreçlerini yapay zekâ asistanına doğrudan sor."
                  : "Ask the AI assistant directly about architecture choices, model training, and pipelines."}
              </p>
            </div>
            <AskAiButton
              prompt={project.aiPrompt}
              label={ui.caseStudy.askAiPrompt}
              variant="glass"
            />
          </div>
        )}

        {/* Next project */}
        <div className="mt-24 border-t hairline pt-10 sm:mt-32">
          <p className="microlabel">{ui.caseStudy.next}</p>
          <Magnetic strength={0.1}>
            <Link
              href={localePath(lang, `/work/${next.slug}`)}
              className="group mt-4 inline-flex items-baseline gap-5 font-display text-display-lg font-extrabold uppercase tracking-tight transition-colors duration-300 hover:text-accent"
            >
              {next.title}
              <span
                aria-hidden
                className="text-display-md transition-transform duration-300 group-hover:translate-x-2"
              >
                →
              </span>
            </Link>
          </Magnetic>
        </div>
      </main>
      <Footer />
    </>
  );
}
