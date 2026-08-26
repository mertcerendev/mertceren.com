"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Draws detector-style boxes over the page's own contents.
 *
 * The subject of this site is object detection, and the interface never said
 * so. This is the site run through its own kind of model: switch it on and
 * everything the page knows how to name is boxed and labelled with a
 * confidence, the way a YOLO overlay labels a frame.
 *
 * Deliberately not hover-driven. A detector labels everything in the frame,
 * not the thing you happen to be pointing at — and following the pointer
 * would have left touch devices with nothing, which is the asymmetry the
 * rest of the site has been climbing out of.
 */
const CLASSES: Record<string, { tr: string; en: string; conf: number }> = {
  person: { tr: "kişi", en: "person", conf: 0.99 },
  project: { tr: "proje", en: "project", conf: 0.94 },
  document: { tr: "belge", en: "document", conf: 0.88 },
  logo: { tr: "logo", en: "logo", conf: 0.96 },
  /* Low on purpose, and the only joke in the label set: a chick is genuinely
     the hardest thing on this page to be sure about. */
  chick: { tr: "civciv", en: "chick", conf: 0.61 },
};

export const DETECT_KEY = "mert_detect_mode";
export const DETECT_TOGGLE_EVENT = "mert-toggle-detect";
export const DETECT_CHANGED_EVENT = "mert-detect-changed";

type Box = {
  id: string;
  label: string;
  conf: string;
  x: number;
  y: number;
  w: number;
  h: number;
  below: boolean;
};

/**
 * Same class, slightly different number each time — a detector never reports
 * a round figure twice. Derived from the element's position in the document
 * so it stays put instead of flickering on every frame.
 */
function confidenceFor(base: number, index: number): string {
  // Spread over two decimal places, because that is all that gets printed —
  // at /1000 the variation rounded away and the three project cards all
  // reported the same figure, which reads as a hard-coded label rather than
  // a measurement.
  const jitter = ((index * 37) % 7) / 100;
  return (base - jitter).toFixed(2);
}

export function DetectOverlay() {
  const pathname = usePathname() ?? "/";
  const isEnglish = pathname === "/en" || pathname.startsWith("/en/");
  const isEnglishRef = useRef(isEnglish);

  const [enabled, setEnabled] = useState(false);
  const [boxes, setBoxes] = useState<Box[]>([]);
  const enabledRef = useRef(false);
  const visibleRef = useRef<Set<Element>>(new Set());
  const frameRef = useRef(0);

  useEffect(() => {
    isEnglishRef.current = isEnglish;
  }, [isEnglish]);

  useEffect(() => {
    const apply = (next: boolean) => {
      enabledRef.current = next;
      setEnabled(next);
      try {
        localStorage.setItem(DETECT_KEY, String(next));
      } catch {
        // Private mode: the toggle still works, it just will not be remembered.
      }
      window.dispatchEvent(
        new CustomEvent(DETECT_CHANGED_EVENT, { detail: { enabled: next } })
      );
    };

    try {
      if (localStorage.getItem(DETECT_KEY) === "true") apply(true);
    } catch {
      // ignore
    }

    const onToggle = () => apply(!enabledRef.current);
    window.addEventListener(DETECT_TOGGLE_EVENT, onToggle);
    return () => window.removeEventListener(DETECT_TOGGLE_EVENT, onToggle);
  }, []);

  /**
   * Only what is on screen is measured. Reading a rect forces layout, and
   * doing that for every tagged element on the page once a frame would be
   * paid for on every frame of every scroll; the observer keeps the set to
   * the handful actually in view.
   */
  useEffect(() => {
    if (!enabled) return;

    const targets = document.querySelectorAll<HTMLElement>("[data-detect]");
    const order = new Map<Element, number>();
    targets.forEach((el, i) => order.set(el, i));

    // Held locally as well as on the ref: the cleanup below must not read
    // the ref, which by then may belong to a later run of this effect.
    const visible = visibleRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target);
          else visible.delete(entry.target);
        }
      },
      { rootMargin: "0px" }
    );
    targets.forEach((el) => observer.observe(el));

    const tick = () => {
      const next: Box[] = [];
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      for (const el of visible) {
        const key = (el as HTMLElement).dataset.detect;
        const spec = key ? CLASSES[key] : undefined;
        if (!spec) continue;

        const r = el.getBoundingClientRect();
        if (r.width < 24 || r.height < 24) continue;

        // Clipped to the viewport: a card half off the bottom should read as
        // a box that ends at the edge, the way a crop does.
        const x = Math.max(0, r.left);
        const y = Math.max(0, r.top);
        const w = Math.min(vw, r.right) - x;
        const h = Math.min(vh, r.bottom) - y;
        if (w < 24 || h < 24) continue;

        const index = order.get(el) ?? 0;
        next.push({
          id: `${key}-${index}`,
          label: isEnglishRef.current ? spec.en : spec.tr,
          conf: confidenceFor(spec.conf, index),
          x,
          y,
          w,
          h,
          // The chip sits above the box, except where there is no room above.
          below: y < 26,
        });
      }

      setBoxes(next);
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);

    // Cleared here rather than on the way in: switching the mode off unmounts
    // the overlay, and leaving the last frame's boxes in state would flash
    // them at stale positions for one frame the next time it is switched on.
    return () => {
      cancelAnimationFrame(frameRef.current);
      observer.disconnect();
      visible.clear();
      setBoxes([]);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[900] overflow-hidden"
    >
      {boxes.map((b) => (
        <div
          key={b.id}
          className="absolute border border-accent/70"
          style={{
            transform: `translate3d(${b.x}px, ${b.y}px, 0)`,
            width: b.w,
            height: b.h,
            top: 0,
            left: 0,
          }}
        >
          {/* Corner ticks, brighter than the box itself — the detail that
              separates a detector overlay from a plain outline. */}
          <span className="absolute -left-px -top-px size-2 border-l-2 border-t-2 border-accent" />
          <span className="absolute -right-px -top-px size-2 border-r-2 border-t-2 border-accent" />
          <span className="absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-accent" />
          <span className="absolute -bottom-px -right-px size-2 border-b-2 border-r-2 border-accent" />

          <span
            className={`absolute left-0 whitespace-nowrap bg-accent px-1.5 py-0.5 font-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-accent-ink tabular-nums ${
              b.below ? "top-0" : "-top-[1.15rem]"
            }`}
          >
            {b.label} {b.conf}
          </span>
        </div>
      ))}
    </div>
  );
}
