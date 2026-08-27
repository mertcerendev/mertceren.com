"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Where down the screen a section counts as the one being read. */
const READING_LINE = 0.35;

type Entry = { id: string; index: string; label: string };

/**
 * The section you are in, set down the left gutter like a page spine.
 *
 * Read out of the DOM rather than from a list kept here. Every section
 * already prints its own number and name through SectionHeading, and those
 * strings are locale-dependent and uppercased by CSS; a second copy in this
 * file would be a second thing to update and a second thing to get wrong.
 * Whatever the headings say, this says.
 *
 * Decoration only — aria-hidden and unclickable. The headings it repeats are
 * already in the document and already reachable from the nav, so to a screen
 * reader this would be every section title read out a second time for nothing.
 *
 * From lg up, where the page’s own 48px gutter has room for it. Below that
 * the text would sit on top of the content.
 */
export function SectionSpine() {
  const [current, setCurrent] = useState<Entry | null>(null);

  useEffect(() => {
    const entries: Entry[] = [];
    for (const section of document.querySelectorAll<HTMLElement>("main section[id]")) {
      const heading = section.querySelector("h2");
      const index = heading?.querySelector("span")?.textContent?.trim();
      if (!heading || !index) continue;

      /* The label is whatever is left of the heading once the number and the
         em dash between them are taken off. Read this way rather than by
         position, because the dash is a separate aria-hidden span and the
         label itself may be several nodes — a brand inside it gets its own
         lang attribute. */
      const label = [...heading.childNodes]
        .slice(2)
        .map((node) => node.textContent ?? "")
        .join("")
        .trim();
      if (!label) continue;

      entries.push({ id: section.id, index, label });
    }
    if (!entries.length) return;

    let frame = 0;
    const paint = () => {
      frame = 0;
      const line = window.innerHeight * READING_LINE;
      let active: Entry | null = null;
      for (const entry of entries) {
        const el = document.getElementById(entry.id);
        if (el && el.getBoundingClientRect().top <= line) active = entry;
      }
      /* These objects are built once above and handed back by reference, so
         an unchanged section passes React the identical value and the render
         is skipped — this runs on every scroll frame. null while the hero is
         still up: it carries no number, and borrowing the first section’s
         would be a lie about where you are. */
      setCurrent(active);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    /* Through a frame rather than called here. The first paint matters — a
       reload restores the scroll position, and a #section link opens partway
       down — but doing it in the effect body is a setState that cascades
       another render out of the one that just finished. */
    frame = requestAnimationFrame(paint);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      aria-hidden
      /* A zero-size anchor at the middle of the screen; the label centres
         itself on it. A translate here would measure against this box’s own
         height, which is nothing, so the label hung down from the midline
         instead of sitting across it. */
      className="pointer-events-none fixed left-0 top-1/2 z-40 hidden lg:block"
    >
      {/* whitespace-nowrap because the label is absolute inside that
          zero-height anchor: with nothing to measure against, the vertical
          text wrapped itself into four stacked columns, 66px wide instead of
          33 and half the height it should have been.

          Plain crossfade, and the labels are stacked absolutely so the two
          can overlap while it happens. mode="wait" reads better but holds the
          incoming label until the outgoing one’s exit reports finished, and
          nothing else in this codebase uses it — one stalled exit and the
          spine stops updating for the rest of the visit. */}
      <AnimatePresence>
        {current && (
          <motion.p
            key={current.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.4, ease: EASE }}
            /* The -translate-y-1/2 that centres this on the anchor and the y
               the animation moves it by are different CSS properties in
               Tailwind v4 — translate is standalone, motion writes transform
               — so the two compose instead of overwriting each other and the
               label stays centred while it fades. */
            className="microlabel absolute left-0 top-0 -translate-y-1/2 whitespace-nowrap pl-4 [writing-mode:vertical-rl]"
          >
            <span className="text-accent">{current.index}</span>
            <span className="my-3 select-none">—</span>
            {current.label}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
