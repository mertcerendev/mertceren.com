"use client";

import { useEffect, useRef } from "react";

const NOISE_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>`;

const NOISE_URL = `url("data:image/svg+xml,${NOISE_SVG}")`;

/** How far the lamp reaches, and how quickly it catches up with the pointer. */
const REACH = 260;
const EASE = 0.12;

export function GrainOverlay() {
  const lampRef = useRef<HTMLDivElement>(null);

  /**
   * A second helping of grain that follows the pointer around.
   *
   * The base layer below is unchanged and still covers the whole page — this
   * one only adds to it inside a soft circle, so the effect is more grain
   * under the cursor rather than grain that has moved. Lighting film makes
   * its grain easier to see, not brighter.
   *
   * Its noise is offset from the base layer's, so the two patterns do not sit
   * on top of each other. Aligned, doubling the opacity of the same speckles
   * would read as a dim spotlight; misaligned, it reads as texture.
   *
   * Mouse only, and it eases rather than tracking exactly: a lamp has some
   * weight to it, and the loop stops itself once it has caught up.
   */
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const el = lampRef.current;
    if (!el) return;

    let frame = 0;
    let started = false;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;

    const tick = () => {
      frame = 0;
      cx += (tx - cx) * EASE;
      cy += (ty - cy) * EASE;
      el.style.setProperty("--gx", `${cx.toFixed(1)}px`);
      el.style.setProperty("--gy", `${cy.toFixed(1)}px`);
      if (Math.abs(tx - cx) < 0.5 && Math.abs(ty - cy) < 0.5) return;
      frame = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      tx = e.clientX;
      ty = e.clientY;
      // The first sighting is a jump. Easing in from 0,0 would drag the lamp
      // diagonally across the page on the way to wherever the pointer is.
      if (!started) {
        started = true;
        cx = tx;
        cy = ty;
      }
      if (!frame) frame = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-100 opacity-[0.045] mix-blend-overlay dark:opacity-[0.06]"
        style={{ backgroundImage: NOISE_URL }}
      />
      {/* The mask starts a screen away, so there is nothing to see until the
          pointer has actually been somewhere. A touch visitor never moves it
          and never gets this layer at all. */}
      <div
        ref={lampRef}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-100 opacity-[0.055] mix-blend-overlay dark:opacity-[0.075]"
        style={{
          backgroundImage: NOISE_URL,
          backgroundPosition: "37px 53px",
          maskImage: `radial-gradient(circle ${REACH}px at var(--gx, -100vw) var(--gy, -100vw), #000 0%, transparent 72%)`,
          WebkitMaskImage: `radial-gradient(circle ${REACH}px at var(--gx, -100vw) var(--gy, -100vw), #000 0%, transparent 72%)`,
        }}
      />
    </>
  );
}
