"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useLenis } from "lenis/react";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { useContent } from "@/components/providers/locale-provider";
import { ChickFront } from "@/components/ui/header-chick";
import {
  endRewind,
  onRewind,
  replayHero,
  startRewind,
  type RewindDetail,
} from "@/lib/rewind";

/**
 * Fast off the mark and settling at the end, like a reel running down. A
 * cubic, not a quartic: measured, the quartic had covered 95% of the way by
 * half time and spent the second half creeping the last few pixels, which
 * read as the rewind stalling short of the top.
 */
const REWIND_EASE = (t: number) => 1 - Math.pow(1 - t, 3);
/** The hero starts its opening this far through, while the page settles. */
const REPLAY_AT = 0.72;
/** Pixels of page per second of "tape", for the counter in the display. */
const PX_PER_TAPE_SECOND = 120;
/** Where the header chick walks, for the balloon to drop it off at. */
const HEADER_CHICK_Y = 52;

/** Long pages take longer, but never so long that it feels like waiting. */
function rewindSeconds(distance: number) {
  return Math.min(2.4, Math.max(1.1, 0.9 + distance / 6000));
}

function tapeCounter(scrollY: number) {
  const total = Math.max(0, scrollY) / PX_PER_TAPE_SECOND;
  const minutes = Math.floor(total / 60);
  const seconds = Math.floor(total % 60);
  const frames = Math.floor((total % 1) * 25);
  return `${minutes}:${String(seconds).padStart(2, "0")}:${String(frames).padStart(2, "0")}`;
}

/** The chick from the header, hanging off an accent balloon. */
export function BalloonChick() {
  return (
    <span
      className="chick-resting relative inline-flex flex-col items-center"
      style={
        {
          "--chick-body": "#f7cf4e",
          "--chick-shade": "#e3b336",
        } as React.CSSProperties
      }
    >
      <svg viewBox="0 0 20 30" width="16" height="24" aria-hidden className="-mb-1">
        <ellipse cx="10" cy="9" rx="7.5" ry="8.5" fill="var(--accent)" />
        <ellipse cx="7.4" cy="6" rx="2" ry="3" fill="#fff" opacity="0.35" />
        <path d="M9 17.2h2l-1 1.6z" fill="var(--accent)" />
        <path d="M10 18.6q-1.6 3.4 0 5.6t0 5.8" stroke="currentColor" strokeWidth="0.7" fill="none" opacity="0.6" />
      </svg>
      <ChickFront />
    </span>
  );
}

/**
 * Runs the rewind: the scroll, the on-screen display, the grain, the
 * balloon flight and the hero's replay. Mounted once, in the layout.
 *
 * The scroll goes through Lenis with `lock` set, so a wheel turned halfway
 * up cannot fight it, and `force`, so it still runs while something else has
 * Lenis stopped. The spine down the left needs nothing from here: it already
 * follows the scroll, so a fast one sends the section names through it in
 * reverse, each decoding as it passes.
 */
export function RewindDirector() {
  const lenis = useLenis();
  const { ui } = useContent();
  const [run, setRun] = useState<(RewindDetail & { seconds: number; id: number }) | null>(null);
  const runningRef = useRef(false);
  const counterRef = useRef<HTMLSpanElement>(null);

  useEffect(
    () =>
      onRewind((detail) => {
        if (runningRef.current) return;
        const distance = window.scrollY;
        // Already at the opening: nothing to rewind, so just play it again.
        if (distance < 4) {
          replayHero();
          endRewind();
          return;
        }

        runningRef.current = true;
        const seconds = rewindSeconds(distance);
        const root = document.documentElement;
        root.dataset.rewinding = "";
        setRun({ ...detail, seconds, id: Date.now() });

        const replay = setTimeout(replayHero, seconds * 1000 * REPLAY_AT);
        let finished = false;
        const finish = () => {
          if (finished) return;
          finished = true;
          clearTimeout(replay);
          clearTimeout(fallback);
          delete root.dataset.rewinding;
          runningRef.current = false;
          setRun(null);
          endRewind();
        };
        // onComplete is the normal ending; this is for one that never comes.
        const fallback = setTimeout(finish, seconds * 1000 + 600);

        if (lenis) {
          lenis.scrollTo(0, {
            duration: seconds,
            easing: REWIND_EASE,
            lock: true,
            force: true,
            onComplete: finish,
          });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }),
    [lenis]
  );

  /* The tape counter runs down with the page. Written to the node, not
     through state: it changes on every scroll frame for the length of the
     rewind. */
  useEffect(() => {
    if (!run) return;
    const write = () => {
      if (counterRef.current) counterRef.current.textContent = tapeCounter(window.scrollY);
    };
    write();
    window.addEventListener("scroll", write, { passive: true });
    return () => window.removeEventListener("scroll", write);
  }, [run]);

  const chickFrom = run?.source === "chick" ? run.from : undefined;

  return (
    <AnimatePresence>
      {run && (
        <motion.div
          key={run.id}
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.35 } }}
          transition={{ duration: 0.15 }}
          className="pointer-events-none fixed inset-0 z-[70]"
        >
          {/* The display a VCR puts up while it rewinds, set in the site's
              own microlabel rather than a pastiche of one. */}
          <div className="absolute right-5 top-20 flex items-center gap-3 rounded-md bg-background/70 px-3 py-2 backdrop-blur-sm sm:right-8 lg:right-12">
            <span className="microlabel animate-[rewind-blink_0.9s_steps(1)_infinite] text-accent">
              ◀◀ {ui.rewind.osd}
            </span>
            <span ref={counterRef} className="microlabel tabular-nums text-foreground" />
          </div>

          {/* Tracking noise: a faint band rolling down the screen, the way a
              tape shows it is moving. */}
          <div className="absolute inset-x-0 top-0 h-[3px] animate-[rewind-tracking_0.7s_linear_infinite] bg-foreground/15" />

          {chickFrom && <FlyingChick from={chickFrom} seconds={run.seconds} />}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * The footer's chick, carried up by its balloon while the page runs back
 * underneath it. It rises to where the header chick walks, lines up with it,
 * and there lets go: the chick fades into the one already walking, and the
 * balloon carries on up and away.
 */
function FlyingChick({ from, seconds }: { from: { x: number; y: number }; seconds: number }) {
  const [target] = useState(() => {
    const walker = document.querySelector<HTMLElement>('[data-cursor="chick"]');
    const box = walker?.getBoundingClientRect();
    return {
      x: (box ? box.left + box.width / 2 : 80) - from.x,
      y: HEADER_CHICK_Y - from.y,
    };
  });

  return (
    <div className="absolute" style={{ left: from.x, top: from.y }}>
      <motion.div
        className="-translate-x-1/2 -translate-y-1/2"
        initial={{ x: 0, y: 0 }}
        animate={{ x: [0, target.x * 0.3 + 10, target.x * 0.7 - 8, target.x], y: target.y }}
        transition={{
          y: { duration: seconds, ease: [0.25, 1, 0.5, 1] },
          x: { duration: seconds, ease: "easeInOut", times: [0, 0.35, 0.7, 1] },
        }}
      >
        <motion.div
          animate={{ rotate: [-6, 6, -4, 3, 0] }}
          transition={{ duration: seconds, ease: "easeInOut" }}
        >
          <BalloonChick />
        </motion.div>
      </motion.div>
    </div>
  );
}

/**
 * The way back up from the middle of the page: a film reel in the bottom-
 * left corner. It turns as the page scrolls — so during a rewind it spins
 * backwards, fast — and the ring around it fills with how far down you are.
 *
 * Out of the way where it would only repeat something: on the first screen,
 * where there is nothing to rewind, and over the footer, which has its own
 * Rewind button and chick. Watches the footer box per page, because a client
 * navigation replaces it and an observer would be left holding the old one.
 */
export function RewindReel() {
  const pathname = usePathname();
  const { ui } = useContent();
  const { scrollY, scrollYProgress } = useScroll();
  const spin = useTransform(scrollY, (y) => y * 0.35);
  const [pastFirstScreen, setPastFirstScreen] = useState(false);
  const [atFooter, setAtFooter] = useState(false);
  const [rewinding, setRewinding] = useState(false);

  useEffect(() => {
    const onScroll = () => setPastFirstScreen(window.scrollY > window.innerHeight * 0.8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const footer = document.querySelector("[data-site-footer]");
    if (!footer) return;
    const observer = new IntersectionObserver(
      ([entry]) => setAtFooter(entry.isIntersecting),
      { threshold: 0.16 }
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    const root = document.documentElement;
    const observer = new MutationObserver(() => setRewinding("rewinding" in root.dataset));
    observer.observe(root, { attributes: true, attributeFilter: ["data-rewinding"] });
    return () => observer.disconnect();
  }, []);

  // Stays up while it is spinning back, so the reel can be seen running down.
  const shown = rewinding || (pastFirstScreen && !atFooter);

  return (
    <AnimatePresence>
      {shown && (
        <motion.button
          type="button"
          aria-label={ui.rewind.reel}
          title={ui.rewind.reel}
          onClick={() => startRewind({ source: "reel" })}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="group fixed bottom-5 left-5 z-[45] flex size-12 items-center justify-center rounded-full border hairline bg-background/80 text-muted backdrop-blur-md transition-colors duration-300 hover:border-accent/50 hover:text-accent sm:bottom-8 sm:left-8"
        >
          {/* Progress ring: how much film has run. */}
          <svg viewBox="0 0 48 48" aria-hidden className="absolute inset-0 -rotate-90">
            <motion.circle
              cx="24"
              cy="24"
              r="22.5"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="1.5"
              style={{ pathLength: scrollYProgress }}
            />
          </svg>
          {/* The reel. */}
          <motion.svg viewBox="0 0 24 24" aria-hidden className="size-6" style={{ rotate: spin }}>
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="12" cy="12" r="1.6" fill="currentColor" />
            {[0, 72, 144, 216, 288].map((deg) => (
              <circle
                key={deg}
                cx={12 + 5.6 * Math.cos((deg * Math.PI) / 180)}
                cy={12 + 5.6 * Math.sin((deg * Math.PI) / 180)}
                r="2.1"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.3"
              />
            ))}
          </motion.svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
