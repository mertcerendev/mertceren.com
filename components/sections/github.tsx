"use client";

import { motion } from "motion/react";
import { useContent, useLocale } from "@/components/providers/locale-provider";
import { SectionHeading } from "@/components/ui/section-heading";
import { featuredRepos } from "@/lib/data";
import { Foreign } from "@/lib/foreign";
import type { GithubStats as LiveStats } from "@/lib/github";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * `stats` is read from the public GitHub API by the page (a Server
 * Component) and refreshed hourly by ISR. It is null whenever that call
 * failed — rate limit, outage, offline build — and everything below then
 * falls back to the hand-written figures, which is exactly what this
 * section rendered before it was wired up.
 */
export function GithubStats({
  stats,
  lastPushLabel,
}: {
  stats?: LiveStats | null;
  /** Pre-formatted on the server: see the note where it is rendered. */
  lastPushLabel?: string | null;
}) {
  const { ui } = useContent();
  const isTr = useLocale() === "tr";

  const githubSection = ui.sections.github;

  /* Only shown when the API call fails. Kept close to what the live figures
     actually report so the fallback is not a different, rosier claim. */
  const curatedLanguages = [
    { name: "TypeScript", percentage: 30, note: "AI-assisted web development", color: "bg-amber-400" },
    { name: "JavaScript", percentage: 28, note: "Web platforms & tooling", color: "bg-yellow-400" },
    { name: "C#", percentage: 22, note: "Object-oriented programming", color: "bg-blue-500" },
    { name: "Python", percentage: 20, note: "YOLOv11, computer vision", color: "bg-accent" },
  ];

  /* Written here rather than read from GitHub because these repositories
     carry no description there, and what is on GitHub would be English-only
     anyway. The stack strings are the last-resort values: when the API
     answers, the real language mix replaces them. */
  const curatedRepos: Record<
    (typeof featuredRepos)[number],
    { description: string; badge: string; stack: string }
  > = {
    "bwai-IK-Karar-Motoru": {
      description: isTr
        ? "Yapay zekâ destekli İnsan Kaynakları aday değerlendirme ve yetkinlik karar motoru."
        : "AI-supported HR candidate evaluation and competence decision engine.",
      badge: "JavaScript",
      stack: "JavaScript / CSS",
    },
    RossoLoungeWeb: {
      description: isTr
        ? "Rosso Lounge Bistro için özel geliştirilmiş dinamik menü ve yönetim panelli web platformu."
        : "Custom dynamic web platform with management panel built for Rosso Lounge Bistro.",
      badge: "HTML",
      stack: "HTML / C#",
    },
    yeniportfo: {
      description: isTr
        ? "Next.js 16, TypeScript ve TailwindCSS ile sıfırdan geliştirilmiş kişisel web portfolyosu."
        : "Personal web portfolio built from scratch with Next.js 16, TypeScript & TailwindCSS.",
      badge: "TypeScript",
      stack: "TypeScript / CSS",
    },
  };

  const isLive = Boolean(stats?.languages.length);

  const languages = isLive ? stats!.languages : curatedLanguages;

  /* Selection and prose stay curated; the stack labels come from GitHub, so
     a repository whose contents drift no longer needs the badge corrected
     by hand. */
  const repos = featuredRepos.map((name) => {
    const curated = curatedRepos[name];
    const live = stats?.repoFacts[name];
    return {
      name,
      description: curated.description,
      badge: live?.badge ?? curated.badge,
      language: live?.stack ?? curated.stack,
      url: live?.url ?? `https://github.com/mertcerendev/${name}`,
    };
  });

  return (
    <section id="github" className="px-5 py-24 sm:px-8 sm:py-32 lg:px-12">
      <SectionHeading
        index="04"
        label={<Foreign text={githubSection.label} />}
        /* The heading promises live data, so it only says so when the fetch
           actually landed. */
        meta={isLive ? githubSection.meta : githubSection.metaStale}
      />

      <div className="mt-12 space-y-8">
        {/* Profile Banner */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.7, ease: EASE }}
          className="group relative overflow-hidden rounded-2xl border hairline bg-surface/60 p-6 sm:p-8 backdrop-blur-sm transition-all duration-500 hover:border-accent/40"
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-accent font-bold font-mono text-sm border border-accent/30">
                  GH
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-foreground sm:text-2xl">
                    @mertcerendev
                  </h3>
                  <p lang="en" className="microlabel text-muted">
                    GitHub · Software Engineering Student
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted max-w-xl">
                {githubSection.commitsNote}
              </p>
              {/* The one line on the page that can be checked against GitHub
                  in a second. Formatted upstream on the server so the string
                  is identical on both sides of hydration. */}
              {isLive && lastPushLabel && (
                <p className="microlabel text-accent">
                  {githubSection.lastPush}: {lastPushLabel}
                  <span className="mx-2 select-none text-muted" aria-hidden>
                    ·
                  </span>
                  <span className="text-muted">
                    {stats!.publicRepos} <Foreign text={githubSection.publicRepos} />
                  </span>
                </p>
              )}
            </div>

            <a
              href="https://github.com/mertcerendev"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-accent bg-accent px-6 py-3 font-mono text-xs uppercase tracking-[0.14em] text-accent-ink font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-accent/20 shrink-0"
            >
              {/* One span, so the parts Foreign splits out stay in a single
                  flex item — as separate items the space between them would
                  be dropped and the label would run together. */}
              <span>
                <Foreign text={githubSection.viewProfile} />
              </span>
            </a>
          </div>
        </motion.div>

        {/* Code Stack Breakdown & Repos Grid */}
        {/* Wider gap on a phone, where these two stack: 24px under a 466px
            panel is not enough to read as a break between them. */}
        <div className="grid gap-10 sm:gap-6 lg:grid-cols-12">
          {/* Left: Language Stack Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
            className="flex flex-col justify-between rounded-2xl border hairline bg-surface/40 p-6 sm:p-8 lg:col-span-5"
          >
            <div>
              <h4 className="font-display text-lg font-bold">{githubSection.stackTitle}</h4>
              <p className="mt-1 text-xs text-muted">{githubSection.stackNote}</p>

              <div className="mt-6 space-y-5">
                {languages.map((lang) => (
                  <div key={lang.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">{lang.name}</span>
                      <span className="font-mono text-accent">{lang.percentage}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-surface">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${lang.percentage}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: EASE }}
                        className={`h-full ${lang.color}`}
                      />
                    </div>
                    <p lang="en" className="microlabel text-[0.6875rem] text-muted sm:text-[0.65rem]">
                      {lang.note}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right: Featured GitHub Repositories */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
            className="flex flex-col gap-4 lg:col-span-7"
          >
            <div className="flex items-center justify-between px-1">
              <h4 className="font-display text-lg font-bold">{githubSection.reposTitle}</h4>
              <span className="microlabel text-accent">
                <Foreign text={githubSection.publicRepos} />
              </span>
            </div>

            <div className="space-y-3">
              {repos.map((repo) => (
                <a
                  key={repo.name}
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col justify-between gap-3 rounded-xl border hairline bg-surface/40 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/60 hover:bg-surface/70"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-accent font-bold">/</span>
                      <h5 className="font-display text-base font-bold group-hover:text-accent transition-colors">
                        {repo.name}
                      </h5>
                    </div>
                    <span className="rounded-full border hairline px-2.5 py-0.5 font-mono text-[0.6875rem] text-muted group-hover:border-accent/40 group-hover:text-foreground transition-colors sm:text-[0.65rem]">
                      {repo.badge}
                    </span>
                  </div>

                  <p className="text-xs text-muted line-clamp-2">{repo.description}</p>

                  <div className="flex items-center justify-between pt-1 border-t hairline text-[0.6875rem] text-muted sm:text-[0.65rem]">
                    <span>{repo.language}</span>
                    <span className="group-hover:text-accent transition-colors">
                      {githubSection.viewRepo}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
