"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { useContent } from "@/components/providers/locale-provider";
import { useLocalTime } from "@/lib/hooks/use-local-time";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { heroStatement, profile, ui } = useContent();
  const time = useLocalTime(profile.timezone);

  /* Keyed by position rather than pushed into an array during render: a ref
     callback that returns a cleanup removes its own node when the letter
     unmounts, so switching locale cannot leave stale nodes behind and
     nothing has to be reset while rendering. */
  const charsRef = useRef(new Map<string, HTMLSpanElement>());
  const weightsRef = useRef(new WeakMap<Element, number>());
  const pointerRef = useRef({ x: 0, y: 0, live: false });
  const registerChar = (key: string) => (el: HTMLSpanElement | null) => {
    if (!el) return;
    charsRef.current.set(key, el);
    // Braced: Map.delete returns a boolean and a ref cleanup must return void.
    return () => {
      charsRef.current.delete(key);
    };
  };

  const glowX = useMotionValue(0);
  const glowY = useMotionValue(0);
  const springX = useSpring(glowX, { stiffness: 50, damping: 20 });
  const springY = useSpring(glowY, { stiffness: 50, damping: 20 });

  // Scroll-out parallax: the statement drifts up and dims as you leave
  const { scrollYProgress: exitProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const titleY = useTransform(exitProgress, [0, 1], [0, -90]);
  const titleOpacity = useTransform(exitProgress, [0, 0.85], [1, 0.1]);

  useEffect(() => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    glowX.jump(rect.width * 0.55);
    glowY.jump(rect.height * 0.35);
  }, [glowX, glowY]);

  /**
   * The pointer thins the letters it passes rather than thickening them.
   *
   * Syne's weight axis carries width with it — a glyph at 800 is half again
   * as wide as the same glyph at 650 — and the display size is tuned so the
   * longest word only just fits the viewport at 800. Swelling letters would
   * push the line off the side of the screen, so the resting state stays at
   * 800, exactly as it renders today, and the pointer takes weight away.
   *
   * Mouse only, and only while the pointer is actually over the section: the
   * loop stops itself once every letter is back at rest.
   */
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const REST = 800;
    const FLOOR = 440;
    const REACH = 220;

    let frame = 0;
    let measuredAt = 0;
    let nodes: HTMLSpanElement[] = [];
    let centres: Array<{ x: number; y: number }> = [];

    // Both rebuilt together, so a letter and its centre can never fall out
    // of step — and reading the map here rather than capturing it once means
    // a re-render that replaces the letters is picked up on the next pass.
    const measure = () => {
      nodes = [...charsRef.current.values()];
      centres = nodes.map((el) => {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      });
    };

    const tick = (now: number) => {
      // Thinning changes each glyph's advance, so the centres drift as the
      // effect runs. Re-measured on a slow cadence rather than every frame:
      // reading 30 rects a frame is a forced layout on top of Lenis's own.
      if (now - measuredAt > 120) {
        measure();
        measuredAt = now;
      }

      const p = pointerRef.current;
      let settled = true;

      for (let i = 0; i < nodes.length; i++) {
        const el = nodes[i];
        const c = centres[i];
        if (!el || !c) continue;

        let target = REST;
        if (p.live) {
          const dx = c.x - p.x;
          const dy = c.y - p.y;
          const t = Math.max(0, 1 - Math.hypot(dx, dy) / REACH);
          target = REST - t * t * (REST - FLOOR);
        }

        const current = weightsRef.current.get(el) ?? REST;
        const next = current + (target - current) * 0.18;
        if (Math.abs(next - target) > 1) settled = false;

        // Quantised: below about four units the change cannot be seen, and
        // every write here is a style recalculation.
        const rounded = Math.round(next / 4) * 4;
        if (Math.round(current / 4) * 4 !== rounded) {
          el.style.fontVariationSettings = `"wght" ${rounded}`;
        }
        weightsRef.current.set(el, next);
      }

      if (!p.live && settled) {
        frame = 0;
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const section = sectionRef.current;
    const onEnter = () => start();
    const onLeave = () => {
      pointerRef.current.live = false;
      start();
    };

    section?.addEventListener("pointerenter", onEnter);
    section?.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", measure, { passive: true });
    measure();

    return () => {
      if (frame) cancelAnimationFrame(frame);
      section?.removeEventListener("pointerenter", onEnter);
      section?.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", measure);
    };
  }, []);

  const onMouseMove = (e: React.MouseEvent) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    glowX.set(e.clientX - rect.left);
    glowY.set(e.clientY - rect.top);
    pointerRef.current = { x: e.clientX, y: e.clientY, live: true };
  };

  return (
    <section
      ref={sectionRef}
      onMouseMove={onMouseMove}
      className="relative flex min-h-svh flex-col justify-end overflow-hidden px-5 sm:px-8 lg:px-12"
    >
      {/* Cursor-tracking spotlight */}
      <motion.div
        aria-hidden
        style={{ x: springX, y: springY }}
        className="pointer-events-none absolute left-0 top-0 size-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl sm:size-[48rem]"
      >
        <div
          className="size-full rounded-full"
          style={{
            background: "radial-gradient(circle, var(--glow), transparent 65%)",
          }}
        />
      </motion.div>

      <motion.h1
        aria-label={heroStatement.lines.join(" ")}
        style={{ y: titleY, opacity: titleOpacity }}
        className="relative pt-28 font-display text-display-xl font-extrabold uppercase leading-[0.95] tracking-tight"
      >
        {heroStatement.lines.map((line, i) => {
          const endsWithPeriod = line.endsWith(".");
          const text = endsWithPeriod ? line.slice(0, -1) : line;
          return (
            <span key={i} aria-hidden className="block overflow-hidden">
              <span
                className={cn(
                  "block animate-[rise_1s_cubic-bezier(0.16,1,0.3,1)_both]",
                  i % 2 === 1 && "text-right"
                )}
                style={{ animationDelay: `${0.25 + i * 0.1}s` }}
              >
                {/* Split so the weight axis can be driven per letter. The
                    line is one word in both locales, so no space handling is
                    needed; a space would still render, it simply would not
                    be a target. */}
                {Array.from(text).map((ch, j) => (
                  <span
                    key={j}
                    ref={registerChar(`${i}-${j}`)}
                    className="inline-block"
                    style={{ fontVariationSettings: '"wght" 800' }}
                  >
                    {ch}
                  </span>
                ))}
                {endsWithPeriod && <span className="text-accent">.</span>}
              </span>
            </span>
          );
        })}
      </motion.h1>

      {/* Scroll cue */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.4 }}
        className="relative mt-14 flex items-center gap-3 sm:mt-20"
      >
        <span className="microlabel">{ui.hero.scroll}</span>
        <motion.span
          className="block h-px w-10 origin-left bg-accent"
          animate={{ scaleX: [0.3, 1, 0.3] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* Meta row */}
      {/* No opacity animation here: this paragraph is the page's LCP
          element, and an SSR'd opacity:0 delays its first paint until
          hydration. The slide-in is covered by the preloader anyway. */}
      <motion.div
        initial={{ y: 24 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.9, delay: 0.8, ease: EASE }}
        className="relative mt-6 flex flex-wrap items-end justify-between gap-x-10 gap-y-6 border-t hairline pb-8 pt-6"
      >
        <p className="max-w-md text-sm leading-relaxed text-muted sm:text-base">
          {heroStatement.sub}
        </p>
        <div className="flex flex-col gap-2 sm:items-end">
          <p className="microlabel">{profile.location}</p>
          <p className="microlabel tabular-nums" suppressHydrationWarning>
            {time ? `${time} — ${ui.hero.localSuffix}` : " "}
          </p>
          {profile.available && (
            <p className="microlabel flex items-center gap-2 text-foreground">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-accent" />
              </span>
              {profile.availabilityNote}
            </p>
          )}
        </div>
      </motion.div>
    </section>
  );
}
