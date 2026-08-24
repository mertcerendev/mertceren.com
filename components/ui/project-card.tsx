"use client";

import { ViewTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import type { Project } from "@/lib/data";
import { useContent, useLocale } from "@/components/providers/locale-provider";
import { localePath } from "@/lib/content";
import { Magnetic } from "@/components/ui/magnetic-button";
import { foreignLang } from "@/lib/foreign";
import { AskAiButton } from "@/components/ui/ask-ai-button";

type ProjectCardProps = {
  project: Project;
  index: number;
  progress: MotionValue<number>;
  range: [number, number];
  targetScale: number;
};

/**
 * One panel of the sticky project stack. The wrapper pins to the top
 * of the viewport; as the next card scrolls over, this one recedes
 * (scales down slightly) driven by the shared scroll progress.
 */
export function ProjectCard({
  project,
  index,
  progress,
  range,
  targetScale,
}: ProjectCardProps) {
  const scale = useTransform(progress, range, [1, targetScale]);
  const { palette } = project;
  const locale = useLocale();
  const { ui } = useContent();

  // Subtle pointer-driven 3D tilt (mouse only)
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const rotateX = useSpring(tiltX, { stiffness: 120, damping: 18 });
  const rotateY = useSpring(tiltY, { stiffness: 120, damping: 18 });

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    tiltX.set(-py * 3);
    tiltY.set(px * 3);
  };

  const onPointerLeave = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  return (
    /* pointer-events-none, re-enabled on the card itself: this box is a full
       viewport tall while the card inside it is not, and the empty band above
       and below belongs to whichever card comes later in the stack. Left
       clickable, that transparent band sits over the previous card's button
       and swallows the tap. */
    <div
      className="pointer-events-none sticky top-0 flex h-svh items-center justify-center"
      style={{ perspective: 1400 }}
    >
      <motion.article
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        style={{
          scale,
          rotateX,
          rotateY,
          top: `calc(-4svh + ${index * 26}px)`,
        }}
        className="pointer-events-auto group relative flex h-[80svh] min-h-[520px] w-full origin-top flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl"
      >
        {/* Gradient-mesh artwork (swap for a real screenshot later) */}
        <div
          aria-hidden
          className="absolute inset-0 scale-100 transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
          style={{
            background: [
              `radial-gradient(110% 90% at 12% 12%, ${palette.from} 0%, transparent 55%)`,
              `radial-gradient(95% 85% at 88% 25%, ${palette.via} 0%, transparent 62%)`,
              `radial-gradient(130% 130% at 50% 105%, ${palette.to} 0%, #0a0a0b 100%)`,
              "#0a0a0b",
            ].join(", "),
          }}
        />
        {/* Watermark */}
        <span
          aria-hidden
          className="pointer-events-none absolute -right-4 top-1/2 -translate-y-1/2 select-none font-display text-[38vw] font-extrabold leading-none text-white/[0.045] sm:text-[24vw]"
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        {/* Scrim for text contrast */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-black/35"
        />

        {/* Floating project mockup window */}
        {project.image && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none md:left-1/3 z-10 flex items-end justify-end">
            <div className="relative w-full h-[60%] md:h-[70%] max-w-[480px] mr-[-5%] mb-[-4%] translate-y-[8%] rotate-[-4deg] group-hover:translate-y-[3%] group-hover:rotate-[-2deg] transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] opacity-75 group-hover:opacity-95">
              {/* Browser frame mockup wrapper */}
              <div className="w-full h-full rounded-tl-xl border border-white/15 bg-[#141416]/90 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col">
                {/* Browser address bar */}
                <div className="flex items-center gap-1.5 px-4 py-2 border-b border-white/10 bg-white/5">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                  <div className="ml-3 flex-1 h-3 rounded bg-white/10 max-w-[200px]" />
                </div>
                {/* Project screenshot. The frame caps at 480px wide and the
                    shot is cropped from the top-left inside it, so there is
                    no reason to ship the 700KB original. */}
                <div className="relative w-full flex-1 overflow-hidden">
                  {/* Paired with the same name on the case study and on the
                      work index, so the shot travels between the two pages
                      instead of one disappearing and another appearing.
                      The screenshot rather than the title: the title is a
                      RevealText over there, and morphing into something
                      that is itself animating in fights with it. */}
                  <ViewTransition name={`shot-${project.slug}`}>
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      sizes="480px"
                      className="object-cover object-left-top"
                    />
                  </ViewTransition>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* The scrim near the top of this file sits under the mockup, so on a
            phone — where the mockup is full width rather than tucked into the
            right third — the description was printed straight onto the
            screenshot. This one comes after it and so paints over it, under
            the text. Heavier below sm because that is where the two overlap. */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 z-10 h-2/3 bg-gradient-to-t from-black/90 via-black/65 to-transparent sm:h-1/2 sm:from-black/75 sm:via-black/35"
        />

        {/* Top meta row */}
        <div className="relative flex items-baseline justify-between p-6 sm:p-10 lg:p-12 z-20">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-white/70">
            <span className="text-white">{String(index + 1).padStart(2, "0")}</span>
            <span className="mx-3" aria-hidden>
              —
            </span>
            {project.category}
          </p>
          <div className="flex items-center gap-3">
            {project.status && (
              <span className="flex items-center gap-2 rounded-full border border-white/25 bg-black/25 px-3 py-1 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-white backdrop-blur-sm sm:text-[0.625rem]">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-70" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-accent" />
                </span>
                {project.status}
              </span>
            )}
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-white/70">
              {project.year}
            </p>
          </div>
        </div>

        {/* Bottom content */}
        <div className="relative p-6 sm:p-10 lg:p-12 z-20">
          <h3 className="font-display text-display-lg font-extrabold uppercase leading-none tracking-tight text-white">
            {project.title}
          </h3>
          {/* Three lines on a phone. The card is a fixed 80svh with a 520px
              floor, and on a 653px-tall screen the full text needed 614px of
              it — the overflow was hidden, which quietly cut the button off
              the bottom of the second card entirely. The full description is
              a tap away on the case study. */}
          <p className="mt-3 line-clamp-3 max-w-xl text-sm leading-relaxed text-white/80 sm:mt-4 sm:line-clamp-none sm:text-base sm:text-white/75">
            {project.description}
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 sm:mt-6 sm:gap-6">
            {/* Same budget: five tags wrapped to two rows below sm. Hidden by
                position rather than sliced in JS so both sides render alike. */}
            <ul className="flex flex-wrap gap-2 [&>*:nth-child(n+4)]:hidden sm:[&>*:nth-child(n+4)]:block">
              {project.tags.map((tag) => (
                <li
                  key={tag}
                  lang={foreignLang(tag)}
                  className="rounded-full border border-white/20 px-3 py-1 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-white/80 sm:text-[0.625rem]"
                >
                  {tag}
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-3">
              {project.aiPrompt && (
                <AskAiButton
                  prompt={project.aiPrompt}
                  label={ui.projectCard.askAi}
                  variant="card"
                />
              )}
              <Magnetic>
                <Link
                  href={localePath(locale, `/work/${project.slug}`)}
                  aria-label={`${ui.projectCard.ctaAria} ${project.title}`}
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/5 px-6 py-3 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-white backdrop-blur-sm transition-colors duration-300 hover:border-accent hover:bg-accent hover:text-accent-ink"
                >
                  {ui.projectCard.cta}
                  <span aria-hidden className="text-sm leading-none">
                    ↗
                  </span>
                </Link>
              </Magnetic>
            </div>
          </div>
        </div>
      </motion.article>
    </div>
  );
}
