"use client";

import { ViewTransition, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useMotionValue, useTransform } from "motion/react";
import { Magnetic } from "@/components/ui/magnetic-button";

/**
 * How much scrolling past the end of the page opens the next project, in
 * wheel pixels. A mouse notch is about 100, so this is nine notches; a
 * trackpad gets there in one deliberate swipe but not in the tail of the
 * fling that brought the reader down here — see GRACE.
 */
const THRESHOLD = 900;
/**
 * The page has to have been sitting at its end for this long before scrolling
 * counts as pulling. Momentum keeps sending wheel events for a second or so
 * after a trackpad fling, and without this the fling that reaches the bottom
 * would carry straight on into the next page.
 */
const GRACE = 350;
/** Let go for this long and the pull starts to drain back. */
const RELEASE = 220;

type Props = {
  href: string;
  slug: string;
  title: string;
  image?: string;
  label: string;
  hint: string;
  opening: string;
};

/**
 * The "next project" link, plus a way to get there without reaching for it:
 * keep scrolling once the page has run out and the bar under the title fills;
 * fill it and the next case study opens.
 *
 * The thumbnail carries the same view-transition name as the hero shot on
 * the page it leads to, so arriving morphs the one into the other — the same
 * pairing the cards on the index already use. That also holds for a plain
 * click on the link.
 *
 * Mounted with a key per destination by the page: moving between two case
 * studies keeps this component in place in the tree, and without the key it
 * would arrive on the next page still marked as opening.
 */
export function NextProjectPull({ href, slug, title, image, label, hint, opening }: Props) {
  const router = useRouter();
  const [isOpening, setIsOpening] = useState(false);
  const progress = useMotionValue(0);
  const thumbScale = useTransform(progress, [0, 1], [1, 1.3]);

  useEffect(() => {
    let pull = 0;
    let arrivedAt = 0;
    let lastInput = 0;
    let lastTouchY = 0;
    let frame = 0;
    let done = false;

    const atEnd = () =>
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 2;

    const set = (value: number) => {
      pull = value;
      progress.set(pull / THRESHOLD);
    };

    // Drains the bar once input stops, and stops itself when it is empty.
    const relax = () => {
      frame = 0;
      if (done) return;
      if (performance.now() - lastInput < RELEASE) {
        frame = requestAnimationFrame(relax);
        return;
      }
      set(pull * 0.86);
      if (pull < 2) {
        set(0);
        return;
      }
      frame = requestAnimationFrame(relax);
    };

    const feed = (delta: number) => {
      if (done || !arrivedAt) return;
      const now = performance.now();
      if (now - arrivedAt < GRACE) return;
      lastInput = now;
      set(Math.min(THRESHOLD, Math.max(0, pull + delta)));
      if (pull >= THRESHOLD) {
        done = true;
        setIsOpening(true);
        router.push(href);
        return;
      }
      if (!frame) frame = requestAnimationFrame(relax);
    };

    // Arrival is read off scroll rather than off the first pull, so the
    // grace period runs while the page settles and not while the reader is
    // already trying to go on.
    const onScroll = () => {
      if (atEnd()) {
        if (!arrivedAt) arrivedAt = performance.now();
      } else {
        arrivedAt = 0;
        if (pull) set(0);
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY <= 0) return;
      // Line-mode wheels (Firefox with some mice) report in lines, not px.
      feed(e.deltaMode === 1 ? e.deltaY * 40 : e.deltaY);
    };

    const onTouchStart = (e: TouchEvent) => {
      lastTouchY = e.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY ?? lastTouchY;
      // A finger travels far less than a wheel reports for the same intent.
      if (y < lastTouchY) feed((lastTouchY - y) * 2.5);
      lastTouchY = y;
    };
    const onTouchEnd = () => {
      lastInput = 0;
      if (!frame && !done) frame = requestAnimationFrame(relax);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [href, progress, router]);

  return (
    <div className="mt-24 border-t hairline pt-10 sm:mt-32">
      <div className="flex items-end justify-between gap-8">
        <div>
          <p className="microlabel">{label}</p>
          <Magnetic strength={0.1}>
            <Link
              href={href}
              className="group mt-4 inline-flex items-baseline gap-5 font-display text-display-lg font-extrabold uppercase tracking-tight transition-colors duration-300 hover:text-accent"
            >
              {title}
              <span
                aria-hidden
                className="text-display-md transition-transform duration-300 group-hover:translate-x-2"
              >
                →
              </span>
            </Link>
          </Magnetic>
        </div>

        {image && (
          <motion.div
            aria-hidden
            style={{ scale: thumbScale }}
            className="relative hidden aspect-square w-36 shrink-0 origin-bottom-right overflow-hidden rounded-xl border hairline sm:block lg:w-48"
          >
            <ViewTransition name={`shot-${slug}`}>
              <Image src={image} alt="" fill sizes="192px" className="object-cover" />
            </ViewTransition>
          </motion.div>
        )}
      </div>

      <div aria-hidden className="mt-8 flex items-center gap-4">
        <span className="relative h-px flex-1 overflow-hidden bg-line">
          <motion.span
            style={{ scaleX: progress }}
            className="absolute inset-0 origin-left bg-accent"
          />
        </span>
        <span className="microlabel shrink-0">{isOpening ? opening : hint}</span>
      </div>
    </div>
  );
}
