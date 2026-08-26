"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useContent, useLocale } from "@/components/providers/locale-provider";
import { SectionHeading } from "@/components/ui/section-heading";
import { AskAiButton } from "@/components/ui/ask-ai-button";

const EASE = [0.16, 1, 0.3, 1] as const;

export function About() {
  const { about, experience, profile, ui } = useContent();
  const locale = useLocale();
  return (
    <section id="about" className="px-5 py-24 sm:px-8 sm:py-32 lg:px-12">
      <SectionHeading index="02" label={ui.sections.about.label} meta={profile.location} />

      <div className="mt-14 grid gap-16 lg:grid-cols-[5fr_7fr] lg:gap-20">
        {/* Sticky manifesto column */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <motion.blockquote
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 0.9, ease: EASE }}
            className="font-display text-display-md font-bold leading-[1.1] tracking-tight"
          >
            {about.manifesto}
          </motion.blockquote>

          <div className="mt-8 space-y-5">
            {about.paragraphs.map((paragraph, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10% 0px" }}
                transition={{ duration: 0.8, delay: 0.1 + i * 0.1, ease: EASE }}
                className="max-w-prose text-sm leading-relaxed text-muted sm:text-base"
              >
                {paragraph}
              </motion.p>
            ))}
          </div>

          {/* Portrait placeholder frame */}
          <motion.figure
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative mt-10 flex aspect-[5/4] max-w-sm flex-col justify-between overflow-hidden rounded-2xl border hairline bg-surface p-6 group/portrait text-white"
          >
            {profile.image && (
              <>
                {/* The figure is already `relative` and aspect-locked, so
                    `fill` is the right shape here — no intrinsic size to
                    hardcode and no layout shift to reserve against. It never
                    renders wider than max-w-sm (384px) above the phone
                    breakpoint, which is what `sizes` tells the optimizer. */}
                <Image
                  src={profile.image}
                  alt={profile.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 384px"
                  className="object-cover opacity-75 mix-blend-luminosity group-hover/portrait:opacity-90 group-hover/portrait:mix-blend-normal group-hover/portrait:scale-[1.03] transition-all duration-700 ease-out"
                />
                {/* Scrim for text readability */}
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/45 z-10"
                />
              </>
            )}
            <span
              aria-hidden
              className="pointer-events-none absolute -bottom-10 -right-6 select-none font-display text-[10rem] font-extrabold leading-none text-white/[0.04]"
            >
              {profile.monogram}
            </span>
            <span
              aria-hidden
              className="absolute left-1/2 top-0 h-40 w-64 -translate-x-1/2 rounded-full blur-3xl z-10"
              style={{ background: "var(--glow)" }}
            />
            <figcaption className="microlabel relative text-white/80 z-20">
              {ui.sections.about.portrait}
            </figcaption>
            <div className="relative text-white z-20">
              <p className="font-display text-xl font-bold">{profile.name}</p>
              <p className="microlabel mt-1 text-white/80">{profile.role}</p>
            </div>
          </motion.figure>
        </div>

        {/* Experience timeline */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="microlabel">{ui.sections.about.timeline}</p>
            <AskAiButton
              prompt={
                locale === "tr"
                  ? "Mert'in İSKİ stajı, BANÜ Bilgi İşlem asistanlığı ve yazılım mühendisliği eğitim geçmişini özetler misin?"
                  : "Can you summarize Mert's internship at İSKİ, BANÜ IT assistant role, and software engineering education?"
              }
              label={locale === "tr" ? "Deneyimleri Asistana Sor" : "Ask AI about Experience"}
              size="sm"
              variant="subtle"
            />
          </div>
          <ol>
            {experience.map((entry, i) => (
              <motion.li
                key={`${entry.period}-${entry.title}`}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10% 0px" }}
                transition={{ duration: 0.8, delay: i * 0.08, ease: EASE }}
                tabIndex={0}
                className="group border-t hairline py-7 outline-none transition-colors duration-300 first:border-t-0 hover:bg-surface/60 focus-visible:bg-surface/60 sm:px-4"
              >
                <div className="grid gap-3 sm:grid-cols-[9.5rem_1fr] sm:gap-6 items-start">
                  <p className="microlabel pt-2 text-accent">{entry.period}</p>
                  <div className="flex items-start gap-4">
                    {entry.logo && (
                      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border hairline bg-surface/80 p-1.5 shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:border-accent/40 mt-0.5">
                        <Image
                          src={entry.logo}
                          alt={entry.place}
                          width={44}
                          height={44}
                          className="h-full w-full object-contain rounded-lg"
                        />
                      </div>
                    )}
                    <div className="flex-1 space-y-1">
                      <h3 className="font-display text-xl font-bold sm:text-2xl">
                        {entry.title}
                      </h3>
                      <p className="text-sm text-muted">
                        {entry.place} · {entry.summary}
                      </p>
                      {/* Detail expands on hover / keyboard focus */}
                      <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-focus-within:grid-rows-[1fr] group-hover:grid-rows-[1fr]">
                        <div className="overflow-hidden">
                          <p className="max-w-lg pt-3 text-sm leading-relaxed text-foreground/80">
                            {entry.detail}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
