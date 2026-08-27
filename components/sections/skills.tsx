"use client";

import { useState } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { techMarquee, type Skill } from "@/lib/data";
import { Foreign } from "@/lib/foreign";
import { useContent, useLocale } from "@/components/providers/locale-provider";
import { SectionHeading } from "@/components/ui/section-heading";
import { Marquee } from "@/components/ui/marquee";
import { AskAiButton } from "@/components/ui/ask-ai-button";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;
const DISCIPLINES: Array<Skill["discipline"]> = [
  "AI / ML",
  "Languages",
  "Frontend",
  "Tooling",
  "Professional",
];

export function Skills() {
  const [pinned, setPinned] = useState<Skill["discipline"] | null>(null);
  const [hovered, setHovered] = useState<Skill["discipline"] | null>(null);
  const { skillTiers, ui } = useContent();
  const locale = useLocale();

  const active = hovered ?? pinned;

  // Marquee leans with scroll velocity — texture that reacts to the reader
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const skewRaw = useTransform(velocity, [-1200, 1200], [-4, 4]);
  const skewX = useSpring(skewRaw, { stiffness: 220, damping: 32 });

  return (
    <section id="skills" className="py-24 sm:py-32">
      <div className="px-5 sm:px-8 lg:px-12">
        <SectionHeading
          index="03"
          label={ui.sections.skills.label}
          meta={ui.sections.skills.meta}
        />

        {/* Discipline filter — hover to preview, click to pin */}
        <div
          className="mt-10 flex flex-wrap items-center justify-between gap-3"
          onMouseLeave={() => setHovered(null)}
        >
          <div className="flex flex-wrap items-center gap-2">
            {DISCIPLINES.map((discipline) => {
              const isPinned = pinned === discipline;
              const isHovered = hovered === discipline;

              return (
                <button
                  key={discipline}
                  type="button"
                  /* The disciplines are English in both locales, and these
                     chips are uppercased — see lib/foreign. */
                  lang="en"
                  aria-pressed={isPinned}
                  onMouseEnter={() => setHovered(discipline)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() =>
                    setPinned((current) => (current === discipline ? null : discipline))
                  }
                  className={cn(
                    "rounded-full border px-4 py-3 font-mono text-[0.6875rem] uppercase tracking-[0.14em] transition-all duration-300 cursor-pointer select-none sm:py-2",
                    isPinned
                      ? "border-accent bg-accent text-accent-ink font-semibold"
                      : isHovered
                      ? "border-accent/60 bg-accent/10 text-foreground"
                      : "hairline text-muted hover:border-foreground/40 hover:text-foreground"
                  )}
                >
                  {discipline} {isPinned && "✓"}
                </button>
              );
            })}
            {pinned && (
              <button
                type="button"
                onClick={() => setPinned(null)}
                className="rounded-full border hairline px-4 py-3 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted hover:border-foreground/40 hover:text-foreground transition-colors duration-300 cursor-pointer sm:px-3 sm:py-2"
              >
                ✕
              </button>
            )}
          </div>

          <AskAiButton
            prompt={
              locale === "tr"
                ? "Mert'in C#, Python ve YOLOv11 yetenek seviyesini ve yazılım geliştirme araçlarını anlatır mısın?"
                : "Can you explain Mert's proficiency in C#, Python, YOLOv11, and AI tooling?"
            }
            label={locale === "tr" ? "Yetenekleri Asistana Sor" : "Ask AI about Skills"}
            size="sm"
            variant="subtle"
          />
        </div>

        {/* Tier columns.

            Side by side, each column sized its own heading block, so a blurb
            that ran to two lines pushed that column's first card 20px below
            its neighbours' — visible as soon as you look along the row. The
            columns share the parent's two rows instead: one for the heading
            block, one for the list. The heading row takes the height of the
            tallest of the three and every list starts level, whatever the
            copy does later.

            Row gap is zeroed from md up because the columns sit in a single
            row there, so it would only ever open a gap inside a column,
            between the heading and its list — which `mt-6` already sets. */}
        <div className="mt-12 grid gap-12 md:grid-cols-3 md:grid-rows-[auto_1fr] md:gap-x-8 md:gap-y-0">
          {skillTiers.map((tier, tierIndex) => {
            /* Below md the filter removes rows rather than dimming them,
               so a tier can end up with nothing left under its heading. */
            const tierHasMatch =
              active === null ||
              tier.skills.some((skill) => skill.discipline === active);
            return (
            <motion.div
              key={tier.tier}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 0.8, delay: tierIndex * 0.1, ease: EASE }}
              /* minmax(0,1fr) rather than the implicit `auto` track: a grid
                 item will not shrink below its min-content width, and the
                 skill rows have an unwrappable label pinned to the right, so
                 the list pushed 6px past the viewport at md the moment this
                 column became a grid. */
              className={cn(
                "md:row-span-2 md:grid md:grid-cols-[minmax(0,1fr)] md:grid-rows-subgrid",
                !tierHasMatch && "max-md:hidden"
              )}
            >
              <div className="border-t hairline pt-4">
                <h3 className="font-display text-2xl font-bold">{tier.tier}</h3>
                <p className="mt-1 text-sm text-muted">{tier.blurb}</p>
              </div>
              {/* Plain rows on a phone, cards from sm up. Ten bordered, filled
                  boxes stacked 12px apart is the densest thing on the page at
                  that width and most of why it reads as congested; a hairline
                  between rows separates them just as well and leaves the type
                  to carry the section. Same idiom the awards list already
                  uses. */}
              <ul className="mt-6 sm:space-y-3">
                {tier.skills.map((skill) => {
                  const dimmed = active !== null && skill.discipline !== active;
                  return (
                    <li
                      key={skill.name}
                      className={cn(
                        "flex items-baseline justify-between gap-4 border-t hairline py-4 transition-all duration-400 sm:rounded-xl sm:border sm:bg-surface/50 sm:px-4 sm:py-3.5",
                        /* max-md:hidden, not just dimmed. Side by side
                           from md the dimming reads as a highlight inside
                           a list you can still see all of; stacked on a
                           phone it means scrolling nine ghost rows to
                           reach three real ones, and the section stays
                           exactly as long as it was. */
                        dimmed
                          ? "opacity-30 max-md:hidden"
                          : "opacity-100 hover:-translate-y-0.5 hover:border-accent/60"
                      )}
                    >
                      <div>
                        <p className="text-sm font-medium sm:text-base">{skill.name}</p>
                        <p className="microlabel mt-0.5 normal-case tracking-normal">
                          <Foreign text={skill.note} />
                        </p>
                      </div>
                      <span lang="en" className="microlabel shrink-0 text-accent">
                        {skill.discipline}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
            );
          })}
        </div>
      </div>

      {/* Tech stack marquee. lang, because the items are English in both
          locales and this row is uppercased — see lib/foreign. */}
      <div lang="en" className="mt-20 border-y hairline py-6 sm:mt-24">
        <motion.div style={{ skewX }}>
          <Marquee
            items={techMarquee}
            itemClassName="font-display text-2xl font-bold uppercase tracking-tight text-muted sm:text-4xl"
          />
        </motion.div>
      </div>
    </section>
  );
}
