"use client";

import { useEffect, useRef } from "react";

/**
 * Colour fringing at the top and bottom edges, as strong as the page is fast.
 *
 * This is the replacement for the scroll skew that came out on 2026-08-27.
 * That effect was liked and made the owner queasy, and the reason is worth
 * keeping written down: it tilted the whole page, so every fixed reference
 * the eye had — the header, the section edges, the horizon of the text —
 * moved somewhere it had not been asked to go. Nothing here moves. Only two
 * gradients at the edges change opacity, so there is no geometry for the
 * inner ear to disagree with.
 *
 * The leading edge takes the warm fringe and the trailing edge the cool one,
 * swapping when the direction does, which is the way a lens actually smears
 * a fast pan.
 */

const WARM = "255, 77, 0"; // the site accent, so the fringe belongs to it
const COOL = "0, 170, 255";

/** px per millisecond at which the fringe reaches full strength. */
const FULL_SPEED = 2.2;
/** Opacity at full speed. Deliberately low: this should register as a feeling. */
const PEAK = 0.5;

const band = (rgb: string, from: "top" | "bottom") =>
  `linear-gradient(to ${from === "top" ? "bottom" : "top"}, rgba(${rgb}, 0.55), rgba(${rgb}, 0) 100%)`;

export function ScrollChroma() {
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const top = topRef.current;
    const bottom = bottomRef.current;
    if (!top || !bottom) return;

    let lastY = window.scrollY;
    let lastT = performance.now();
    let eased = 0;
    let painted = -1;
    let frame = 0;

    const tick = (now: number) => {
      const y = window.scrollY;
      const dt = Math.max(1, now - lastT);
      const raw = (y - lastY) / dt;
      lastY = y;
      lastT = now;

      // Rises quickly and falls slowly: a fringe that vanishes the instant
      // the wheel stops reads as a flicker rather than as momentum.
      const target = Math.min(1, Math.abs(raw) / FULL_SPEED);
      eased += (target - eased) * (target > eased ? 0.4 : 0.12);

      if (eased < 0.005 && target === 0) {
        eased = 0;
        top.style.opacity = "0";
        bottom.style.opacity = "0";
        frame = 0;
        return;
      }

      // Only rewritten when the direction actually flips — a gradient string
      // assigned every frame is a style recalculation for no visible gain.
      const dir = raw > 0 ? 1 : raw < 0 ? 0 : painted;
      if (dir !== painted && dir !== -1) {
        painted = dir;
        top.style.background = band(dir === 1 ? WARM : COOL, "top");
        bottom.style.background = band(dir === 1 ? COOL : WARM, "bottom");
      }

      const o = (eased * PEAK).toFixed(3);
      top.style.opacity = o;
      bottom.style.opacity = o;
      frame = requestAnimationFrame(tick);
    };

    const onScroll = () => {
      if (!frame) {
        lastT = performance.now();
        lastY = window.scrollY;
        frame = requestAnimationFrame(tick);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-70 overflow-hidden"
    >
      {/* multiply in light, screen in dark. A screen blend over the light
          theme's near-white ground resolves to white and the fringe would
          simply not be there. */}
      <div
        ref={topRef}
        className="absolute inset-x-0 top-0 h-28 opacity-0 mix-blend-multiply dark:mix-blend-screen sm:h-36"
        style={{ background: band(WARM, "top") }}
      />
      <div
        ref={bottomRef}
        className="absolute inset-x-0 bottom-0 h-28 opacity-0 mix-blend-multiply dark:mix-blend-screen sm:h-36"
        style={{ background: band(COOL, "bottom") }}
      />
    </div>
  );
}
