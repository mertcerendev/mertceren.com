"use client";

import { useEffect, useRef } from "react";

/**
 * Leans the page slightly into the direction it is being scrolled, and lets
 * it settle back when the scrolling stops.
 *
 * Nobody notices this while it is on. They notice when it is taken away: the
 * page stops feeling like one piece of material and starts feeling like a
 * list of boxes moving past a window. It is the quiet half of why sites with
 * a lot of motion feel expensive.
 *
 * Two things keep it from breaking the page it is applied to:
 *
 * A transformed element becomes the containing block for any `position:
 * fixed` inside it, and three full-screen modals live under this wrapper. So
 * the transform is removed entirely — not set to zero — the moment the lean
 * settles, and it is never applied at all while a modal is open. Every one of
 * them locks the page by setting body overflow, which is what is checked
 * here, and that covers the mobile menu too.
 *
 * And no `will-change`. It would hint the compositor usefully, but it creates
 * the same containing block permanently, which is the bug it would be trying
 * to avoid.
 */
const MAX_DEG = 3;
/** Below this the lean is invisible, so the transform comes off instead. */
const SETTLED_DEG = 0.02;

export function ScrollSkew({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let frame = 0;
    let lastY = window.scrollY;
    let skew = 0;

    const locked = () => document.body.style.overflow === "hidden";

    const tick = () => {
      const y = window.scrollY;
      const dy = y - lastY;
      lastY = y;

      if (locked()) {
        skew = 0;
        el.style.transform = "";
        frame = 0;
        return;
      }

      // Eased toward the velocity rather than set from it, so a flick decays
      // instead of snapping upright the instant the wheel stops.
      const target = Math.max(-MAX_DEG, Math.min(MAX_DEG, dy * 0.12));
      skew += (target - skew) * 0.12;

      if (Math.abs(skew) < SETTLED_DEG && Math.abs(dy) < 0.5) {
        skew = 0;
        el.style.transform = "";
        frame = 0;
        return;
      }

      el.style.transform = `skewY(${skew.toFixed(2)}deg)`;
      frame = requestAnimationFrame(tick);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
      el.style.transform = "";
    };
  }, []);

  return <div ref={ref}>{children}</div>;
}
