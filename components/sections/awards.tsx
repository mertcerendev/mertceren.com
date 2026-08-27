"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { awardsGallery } from "@/lib/data";
import { useContent } from "@/components/providers/locale-provider";
import { SectionHeading } from "@/components/ui/section-heading";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Awards() {
  const { awards, ui } = useContent();
  const stripRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  /* Which photo the swipe has landed on, for the dots below the strip.
     Only ever moves below sm: from there up the strip is the marquee again,
     overflow is hidden and scrollLeft never leaves 0, so this costs a
     listener that is never called. Read off the first photo's real width
     rather than a constant, because the photos are sized in vw. */
  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const first = el.querySelector("img");
        if (!first) return;
        const step = first.getBoundingClientRect().width + 16; // + gap-4
        const i = Math.round(el.scrollLeft / step);
        setActive(Math.min(awardsGallery.length - 1, Math.max(0, i)));
      });
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  if (!awards.length) return null;

  return (
    <section id="awards" className="px-5 py-24 sm:px-8 sm:py-32 lg:px-12">
      <SectionHeading
        index="06"
        label={ui.sections.awards.label}
        meta={ui.sections.awards.meta}
      />

      <ol className="mt-10">
        {awards.map((award, i) => (
          <motion.li
            key={`${award.year}-${award.title}`}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.7, delay: i * 0.07, ease: EASE }}
            className="group grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-4 border-t hairline py-6 transition-colors duration-300 hover:bg-surface/60 sm:grid-cols-[3.5rem_1fr_auto] sm:px-4"
          >
            <span className="microlabel text-accent">0{i + 1}</span>
            <div>
              <h3 className="font-display text-xl font-bold sm:text-2xl">
                {award.title}
              </h3>
              <p className="mt-1 text-sm text-muted">
                {award.issuer} · {award.project}
              </p>
            </div>
            <span className="microlabel">{award.year}</span>
          </motion.li>
        ))}
      </ol>

      {/* Photo strip.

          From sm up it drifts left-to-right (reversed marquee) and pauses on
          hover; the row is duplicated so the -50% keyframe loops seamlessly.

          Below sm it is a swipeable gallery instead. The marquee put 234px
          photos on a 375px screen — 1.5 of them visible against 4.6 on a
          desktop — so a 55-second loop showed one picture drifting with no
          sense of a set behind it. Swiping hands the pace back to the reader,
          which is the only pace that works on a phone.

          One markup, switched in CSS: the duplicate row is the marquee's
          seam and has nothing to do on a scroller, so it only exists from sm,
          which is also the first width the animation runs at. */}
      {awardsGallery.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.8, ease: EASE }}
          className="mt-14"
        >
          <div
            ref={stripRef}
            /* overscroll-x-contain: without it a swipe that runs past the
               last photo is handed to the browser as a back gesture. */
            className="-mx-5 overflow-x-auto overscroll-x-contain scroll-pl-5 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:overflow-hidden sm:[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
          >
            <div className="flex w-max px-5 sm:animate-marquee sm:px-0 sm:will-change-transform sm:[animation-direction:reverse] sm:[animation-duration:55s] sm:hover:[animation-play-state:paused]">
              {[false, true].map((hidden) => (
                <div
                  key={String(hidden)}
                  aria-hidden={hidden || undefined}
                  className={
                    hidden
                      ? "hidden shrink-0 gap-4 pr-4 sm:flex"
                      : "flex shrink-0 gap-4 pr-4"
                  }
                >
                  {awardsGallery.map((photo, i) => (
                    <Image
                      key={photo.src}
                      src={photo.src}
                      alt={hidden ? "" : `${ui.sections.awards.label} — ${i + 1}`}
                      width={photo.width}
                      height={photo.height}
                      loading="lazy"
                      /* 78vw below sm, where the height follows the aspect
                         ratio; height-locked from sm as before, where the
                         widest it can render is 960/640 × 224 ≈ 336px. */
                      sizes="(max-width: 640px) 78vw, 336px"
                      className="h-auto w-[78vw] shrink-0 snap-start rounded-xl border hairline object-cover sm:h-56 sm:w-auto"
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Where the swipe has got to. Decoration only — the strip itself
              is the control, and it is already reachable by touch and by
              keyboard as a scroll container. */}
          <div aria-hidden className="mt-4 flex justify-center gap-2 sm:hidden">
            {awardsGallery.map((photo, i) => (
              <span
                key={photo.src}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === active ? "w-5 bg-accent" : "w-1.5 bg-line"
                }`}
              />
            ))}
          </div>
        </motion.div>
      )}
    </section>
  );
}
