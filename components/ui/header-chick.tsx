"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Legs swing ±30° on a ~5.5px shank, so a foot covers ~11px per gait cycle.
 * At a 0.18s cycle that works out to ~61px/s of ground; travelling slightly
 * under that keeps the feet from visibly sliding.
 */
const SPEED = 58;
/**
 * Phones get a slower stroll. The px/s never changed between breakpoints, but
 * the runway does: a phone header is narrow enough that the chick reaches the
 * far end and turns almost immediately, which reads as frantic rather than
 * brisk. Ground speed and the gait cycle have to move together or the feet
 * slide, so this factor is also applied to `--chick-gait` in globals.css —
 * change one and change the other.
 */
const MOBILE_GAIT_FACTOR = 0.7;
/** Matches Tailwind's `sm`, which is where the CSS side switches too. */
const MOBILE_QUERY = "(max-width: 39.99rem)";
const GREET_MS = 1800;
const TURN_PAUSE = [420, 950] as const;
/**
 * Roughly every five seconds of walking it stops for a peck at the ground.
 * The window is loose so the rhythm never turns metronomic, and PECK_MS must
 * match the `chick-peck` keyframe duration.
 */
const PECK_EVERY = [4200, 6000] as const;
const PECK_MS = 1400;
const DROP_PAUSE_MS = 300;
/** Breathing room between the chick's beak and the first header control. */
const LIMIT_GAP = 10;

const INK = "#2a2118";

/** Four changes of direction inside this window counts as being shaken. */
const SHAKE_WINDOW_MS = 900;
const SHAKE_REVERSALS = 4;
const QUEASY_MS = 3600;

const QUEASY_TR = [
  "Öğğ... sallamayı bırak 🤢",
  "Midem bulandı, biraz dur 🥴",
  "Salıncak değilim ben! 😵‍💫",
  "Bir daha yaparsan üstüne kusarım 🤮",
];

const QUEASY_EN = [
  "Ugh... stop shaking me 🤢",
  "I feel sick, hold still 🥴",
  "I am not a swing! 😵‍💫",
  "Do that again and I'll be sick on you 🤮",
];

/** Feeding. */
/**
 * Ground speed while heading for food. The stride in globals.css divides by
 * the same number — see .chick-rushing there — so the feet stay planted.
 * Sized off the runway rather than picked by feel: at 3x the longest
 * possible trip is about five seconds and a typical one about two, where 2x
 * left the far corner at nearly seven.
 */
const FOOD_RUSH = 3;
/** Reuses the peck keyframe, so it has to stay in step with PECK_MS. */
const EAT_MS = PECK_MS;
const THANKS_MS = 2800;
/**
 * A drop closer than this to the chick's middle is refused: the seeds would
 * land under its feet and the whole trip would be over before it started.
 */
const FOOD_CLEAR = 26;
const FOOD_W = 16;
/**
 * Height of the clickable ground. The strip the chick walks in is 28px and
 * overlaps the bottom of the nav links and the wordmark by a few pixels, so
 * only the part below them takes clicks — otherwise dropping food would eat
 * the last row of every link above it. Measured: the lowest control inside
 * the chick's reach ends 20px above the floor on a desktop and 22px on a
 * phone, so 18px clears both.
 */
const GROUND_H = 18;

const THANKS_TR = [
  "Mmm, teşekkürler! 🌾",
  "Tam da acıkmıştım 😋",
  "Sen iyi birisin 💛",
  "Bir tane daha? 👀",
  "Cik cik! (çeviri: harikasın)",
  "Karnım doydu, sağ ol! 🐥",
];

const THANKS_EN = [
  "Mmm, thank you! 🌾",
  "I was just getting hungry 😋",
  "You are a good one 💛",
  "One more? 👀",
  "Cheep cheep! (translation: you rock)",
  "That hit the spot, thanks! 🐥",
];

const between = ([min, max]: readonly [number, number]) =>
  min + Math.random() * (max - min);

/**
 * Shuffled draw without repeats: refills and reshuffles once the deck runs
 * out, so the same line never comes up twice in a row.
 */
const drawFrom = (deck: { current: number[] }, size: number) => {
  if (deck.current.length === 0) {
    const next = Array.from({ length: size }, (_, i) => i);
    for (let i = next.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [next[i], next[j]] = [next[j], next[i]];
    }
    deck.current = next;
  }
  return deck.current.pop()!;
};

/** Walking pose, drawn facing right; the walk loop flips it to go left. */
function ChickSide() {
  return (
    <svg viewBox="0 0 26 26" width="26" height="26" fill="none">
      <g className="chick-part chick-leg-a" style={{ transformOrigin: "top center" }}>
        <path d="M9 17.5v4.6" stroke="var(--accent)" strokeWidth="1.1" strokeLinecap="round" opacity="0.75" />
        <path d="M7.6 22.4h2.8" stroke="var(--accent)" strokeWidth="1.1" strokeLinecap="round" opacity="0.75" />
      </g>
      <g className="chick-part chick-leg-b" style={{ transformOrigin: "top center" }}>
        <path d="M13 17.5v4.6" stroke="var(--accent)" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M11.6 22.4h2.8" stroke="var(--accent)" strokeWidth="1.2" strokeLinecap="round" />
      </g>

      <g className="chick-part chick-body" style={{ transformOrigin: "center" }}>
        <g className="chick-part chick-tail" style={{ transformOrigin: "right center" }}>
          <path d="M6.4 10.4 2.6 7.6l1.5 4.2-2.2 1.9 4.8 1.1z" fill="var(--chick-shade)" />
        </g>

        <ellipse cx="11.5" cy="13.2" rx="7" ry="6" fill="var(--chick-body)" />
        <ellipse cx="10.6" cy="13.8" rx="3.3" ry="2.5" fill="var(--chick-shade)" transform="rotate(-14 10.6 13.8)" />

        <g className="chick-part chick-head" style={{ transformOrigin: "center" }}>
          <circle cx="17.8" cy="7.2" r="4.6" fill="var(--chick-body)" />
          <path d="M21.9 6.7 25.3 8.2 21.9 9.7z" fill="var(--accent)" />
          <ellipse
            className="chick-part chick-eye"
            style={{ transformOrigin: "center" }}
            cx="19.1"
            cy="6.2"
            rx="0.95"
            ry="0.95"
            fill={INK}
          />
        </g>
      </g>
    </svg>
  );
}

/** Turned towards you — the pose it strikes when greeted. */
function ChickFront() {
  return (
    <svg viewBox="0 0 26 26" width="26" height="26" fill="none">
      <path d="M10.4 18v4.2" stroke="var(--accent)" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M9 22.5h2.8" stroke="var(--accent)" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M15.6 18v4.2" stroke="var(--accent)" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M14.2 22.5H17" stroke="var(--accent)" strokeWidth="1.2" strokeLinecap="round" />

      <g className="chick-part chick-body" style={{ transformOrigin: "center" }}>
        <ellipse cx="13" cy="14.4" rx="7.4" ry="6" fill="var(--chick-body)" />
        <ellipse cx="6.6" cy="14.6" rx="2.1" ry="3.2" fill="var(--chick-shade)" />
        <ellipse cx="19.4" cy="14.6" rx="2.1" ry="3.2" fill="var(--chick-shade)" />

        <circle cx="13" cy="7.6" r="5" fill="var(--chick-body)" />
        <path d="M13 9.1 14.6 10.4 13 11.7 11.4 10.4z" fill="var(--accent)" />
        <ellipse
          className="chick-part chick-eye"
          style={{ transformOrigin: "center" }}
          cx="11.1"
          cy="6.9"
          rx="0.95"
          ry="0.95"
          fill={INK}
        />
        <ellipse
          className="chick-part chick-eye"
          style={{ transformOrigin: "center" }}
          cx="14.9"
          cy="6.9"
          rx="0.95"
          ry="0.95"
          fill={INK}
        />
      </g>
    </svg>
  );
}

/**
 * Decorative easter egg: a chick patrolling the bottom edge of the header.
 * Hover it and it turns to face you with a heart; grab it and you can slide
 * it along its track, and it walks on from wherever you drop it.
 *
 * Horizontal position is driven here rather than in CSS because a keyframed
 * walk cannot be picked up mid-stride and resumed at an arbitrary point. It
 * is written straight to the DOM so dragging does not re-render at 60fps.
 */
export function HeaderChick() {
  const pathname = usePathname() ?? "/";
  const isEnglish = pathname === "/en" || pathname.startsWith("/en/");

  const trackRef = useRef<HTMLDivElement>(null);
  const chickRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);

  const xRef = useRef(0);
  const dirRef = useRef(1); // 1 → walking right, -1 → walking left
  const pausedUntilRef = useRef(0);
  const peckUntilRef = useRef(0);
  const nextPeckAtRef = useRef(0);
  const lastFrameRef = useRef(0);
  const draggingRef = useRef(false);
  const greetingRef = useRef(false);
  const grabOffsetRef = useRef(0);
  const greetTimerRef = useRef<NodeJS.Timeout | null>(null);

  const queasyTimerRef = useRef<NodeJS.Timeout | null>(null);
  const queasyDeckRef = useRef<number[]>([]);
  const shakeDirRef = useRef(0);
  const reversalsRef = useRef<number[]>([]);
  const queasyRef = useRef(false);
  /** Read inside the frame loop, so it is a ref rather than state. */
  const speedRef = useRef(SPEED);

  const groundRef = useRef<HTMLDivElement>(null);
  const groundWidthRef = useRef(-1);
  /** Centre of the food in track coordinates, or null when there is none. */
  const foodRef = useRef<number | null>(null);
  const thanksTimerRef = useRef<NodeJS.Timeout | null>(null);
  const thanksDeckRef = useRef<number[]>([]);
  /**
   * eatFood is reached from the frame loop, which is set up once and so
   * holds the first render's closure. Read through a ref, or switching
   * locale would leave the thank you in the language the page opened in.
   */
  const isEnglishRef = useRef(isEnglish);

  const [greeting, setGreeting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [queasyMessage, setQueasyMessage] = useState<string | null>(null);
  const [food, setFood] = useState<number | null>(null);
  const [thanksMessage, setThanksMessage] = useState<string | null>(null);

  /**
   * Far end of the walk. The track spans the whole header, but the chick has
   * to turn back where the header controls begin — the element tagged
   * `data-chick-limit` — or it ends up strolling under the language and theme
   * buttons with its head across them. On wide screens that boundary lands
   * just past the last nav item.
   */
  const maxX = () => {
    const track = trackRef.current;
    const chick = chickRef.current;
    if (!track || !chick) return 0;

    const full = track.clientWidth - chick.offsetWidth;
    const limit = document.querySelector("[data-chick-limit]");
    if (!limit) return Math.max(0, full);

    const stopBefore =
      limit.getBoundingClientRect().left -
      track.getBoundingClientRect().left -
      chick.offsetWidth -
      LIMIT_GAP;

    return Math.max(0, Math.min(full, stopBefore));
  };

  /**
   * Writes the current position out. Called from the walk loop and straight
   * from the drag handler, so dragging tracks the pointer within the same
   * event rather than waiting for the next frame.
   */
  const paint = (resting: boolean) => {
    const chick = chickRef.current;
    if (!chick) return;
    // The artwork faces right, so only walking left needs the flip. The
    // greeting pose faces front and is symmetrical, so it stays unflipped —
    // otherwise the mirror would throw the heart out to the wrong side.
    const facing = greetingRef.current || queasyRef.current ? 1 : dirRef.current;
    chick.style.transform = `translateX(${xRef.current}px) scaleX(${facing})`;
    chick.classList.toggle("chick-resting", resting);

    // The complaint bubble lives outside the clipped strip, so it has to be
    // moved to match rather than riding along inside the chick.
    if (bubbleRef.current) {
      bubbleRef.current.style.transform = `translateX(${xRef.current}px)`;
    }
  };

  const goQueasy = () => {
    const pool = isEnglish ? QUEASY_EN : QUEASY_TR;
    queasyRef.current = true;
    setQueasyMessage(pool[drawFrom(queasyDeckRef, pool.length)]);
    reversalsRef.current = [];

    if (queasyTimerRef.current) clearTimeout(queasyTimerRef.current);
    queasyTimerRef.current = setTimeout(() => {
      queasyRef.current = false;
      setQueasyMessage(null);
    }, QUEASY_MS);
  };

  /**
   * Reached the seeds. The peck keyframe doubles as the eat, and the thank
   * you lands when the mouthful is done rather than on arrival, so the line
   * reads as a reply to the food and not to the walk.
   */
  const eatFood = (now: number) => {
    foodRef.current = null;
    setFood(null);
    peckUntilRef.current = now + EAT_MS;
    nextPeckAtRef.current = now + EAT_MS + between(PECK_EVERY);

    if (thanksTimerRef.current) clearTimeout(thanksTimerRef.current);
    thanksTimerRef.current = setTimeout(() => {
      const pool = isEnglishRef.current ? THANKS_EN : THANKS_TR;
      setThanksMessage(pool[drawFrom(thanksDeckRef, pool.length)]);
      thanksTimerRef.current = setTimeout(
        () => setThanksMessage(null),
        THANKS_MS
      );
    }, EAT_MS);
  };

  /** Counts changes of direction; enough of them in a short window is a shake. */
  const noteShake = (from: number, to: number) => {
    const direction = to > from ? 1 : to < from ? -1 : 0;
    if (direction === 0) return;

    const now = performance.now();
    if (shakeDirRef.current !== 0 && direction !== shakeDirRef.current) {
      reversalsRef.current.push(now);
    }
    shakeDirRef.current = direction;

    reversalsRef.current = reversalsRef.current.filter(
      (t) => now - t < SHAKE_WINDOW_MS
    );

    if (reversalsRef.current.length >= SHAKE_REVERSALS && !queasyRef.current) {
      goQueasy();
    }
  };

  useEffect(() => {
    isEnglishRef.current = isEnglish;
  }, [isEnglish]);

  /* Kept in step with the `--chick-gait` media query in globals.css: the
     stride length is fixed by the leg geometry, so slowing one without the
     other would have the feet skating. */
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const sync = () => {
      speedRef.current = mq.matches ? SPEED * MOBILE_GAIT_FACTOR : SPEED;
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  /**
   * The frame loop sizes the ground as well, but only from its first frame,
   * and a tab that is never shown never gets one. Observed rather than
   * measured once on mount: maxX() reads where the header controls sit, and
   * on mount they may not be laid out yet — measuring then returns 0 and
   * leaves the ground one chick wide.
   */
  useEffect(() => {
    const sync = () => {
      const chick = chickRef.current;
      const ground = groundRef.current;
      if (!chick || !ground) return;
      const width = Math.round(maxX() + chick.offsetWidth);
      if (groundWidthRef.current === width) return;
      ground.style.width = `${width}px`;
      groundWidthRef.current = width;
    };

    const observer = new ResizeObserver(sync);
    const track = trackRef.current;
    const limit = document.querySelector("[data-chick-limit]");
    if (track) observer.observe(track);
    if (limit) observer.observe(limit);

    sync();
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let frame = 0;

    const tick = (now: number) => {
      const track = trackRef.current;
      const chick = chickRef.current;

      if (track && chick) {
        const max = maxX();
        const dt = lastFrameRef.current
          ? Math.min(now - lastFrameRef.current, 60)
          : 0;
        const held =
          draggingRef.current || greetingRef.current || queasyRef.current;
        const pecking = now < peckUntilRef.current;
        const resting = held || pecking || now < pausedUntilRef.current;

        // First frame: start the clock rather than pecking immediately.
        if (!nextPeckAtRef.current) {
          nextPeckAtRef.current = now + between(PECK_EVERY);
        }

        // The clickable ground only reaches as far as the chick does, so the
        // strip is sized from the same limit the walk turns at.
        const ground = groundRef.current;
        if (ground) {
          const width = Math.round(max + chick.offsetWidth);
          if (groundWidthRef.current !== width) {
            ground.style.width = `${width}px`;
            groundWidthRef.current = width;
          }
        }

        const foodX = foodRef.current;

        if (!resting && dt && foodX !== null) {
          // Straight for it, at a trot. No pecking on the way and no turning
          // at the ends: it has somewhere to be.
          const centre = xRef.current + chick.offsetWidth / 2;
          const delta = foodX - centre;
          const step = speedRef.current * FOOD_RUSH * (dt / 1000);
          dirRef.current = delta >= 0 ? 1 : -1;

          if (Math.abs(delta) <= step) {
            xRef.current = foodX - chick.offsetWidth / 2;
            eatFood(now);
          } else {
            xRef.current += dirRef.current * step;
          }
        } else if (!resting && dt) {
          xRef.current += dirRef.current * speedRef.current * (dt / 1000);

          if (xRef.current >= max) {
            xRef.current = max;
            dirRef.current = -1;
            pausedUntilRef.current = now + between(TURN_PAUSE);
          } else if (xRef.current <= 0) {
            xRef.current = 0;
            dirRef.current = 1;
            pausedUntilRef.current = now + between(TURN_PAUSE);
          } else if (now >= nextPeckAtRef.current) {
            peckUntilRef.current = now + PECK_MS;
            nextPeckAtRef.current = now + PECK_MS + between(PECK_EVERY);
          }
        }

        // A resize can leave the chick past the new right edge.
        xRef.current = Math.min(max, Math.max(0, xRef.current));
        paint(resting);
        chick.classList.toggle("chick-pecking", pecking);
        // Shortens the stride to match the extra ground speed; see the
        // .chick-rushing note in globals.css.
        chick.classList.toggle("chick-rushing", foodX !== null && !resting);
      }

      lastFrameRef.current = now;
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(
    () => () => {
      if (greetTimerRef.current) clearTimeout(greetTimerRef.current);
      if (queasyTimerRef.current) clearTimeout(queasyTimerRef.current);
      if (thanksTimerRef.current) clearTimeout(thanksTimerRef.current);
    },
    []
  );

  const startGreeting = () => {
    if (greetTimerRef.current) clearTimeout(greetTimerRef.current);
    greetingRef.current = true;
    setGreeting(true);
  };

  const endGreeting = () => {
    if (greetTimerRef.current) clearTimeout(greetTimerRef.current);
    greetingRef.current = false;
    setGreeting(false);
  };

  /** Touch has no pointerleave, so it lets go on a timer instead. */
  const releaseAfterDelay = () => {
    if (greetTimerRef.current) clearTimeout(greetTimerRef.current);
    greetTimerRef.current = setTimeout(endGreeting, GREET_MS);
  };

  /**
   * Scatter seeds where the ground was clicked. One lot at a time, and never
   * under the chick — a click that lands on the chick itself never gets here
   * anyway, since the chick is its own element on top of this one, but a
   * click just beside it would otherwise drop food half under its body.
   */
  const dropFood = (e: React.MouseEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    const chick = chickRef.current;
    if (!track || !chick) return;
    if (foodRef.current !== null || draggingRef.current) return;

    const half = chick.offsetWidth / 2;
    const max = maxX();
    const at = e.clientX - track.getBoundingClientRect().left;
    // Held inside the runway, or the chick would walk to the end and stall
    // next to food it can never stand on.
    const x = Math.min(max + half, Math.max(half, at));

    if (Math.abs(x - (xRef.current + half)) < FOOD_CLEAR) return;

    foodRef.current = x;
    setFood(x);
    // It notices straight away: drop a mouthful of nothing and cut short the
    // pause it may be standing in.
    peckUntilRef.current = 0;
    pausedUntilRef.current = 0;
  };

  const positionFromPointer = (clientX: number) => {
    const track = trackRef.current;
    const chick = chickRef.current;
    if (!track || !chick) return;

    const max = maxX();
    const next =
      clientX - track.getBoundingClientRect().left - grabOffsetRef.current;
    const clamped = Math.min(max, Math.max(0, next));

    // Face the way it is being dragged, so it carries on that way.
    if (clamped > xRef.current + 0.5) dirRef.current = 1;
    else if (clamped < xRef.current - 0.5) dirRef.current = -1;

    noteShake(xRef.current, clamped);
    xRef.current = clamped;
    paint(true);
  };

  return (
    // The wrapper is deliberately unclipped so the complaint bubble can hang
    // below the header; only the walking strip inside it clips.
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 px-5 sm:px-8 lg:px-12"
    >
      <div ref={trackRef} className="relative h-7 overflow-hidden">
        {/* The ground takes the clicks. Only the bottom band of the strip,
            and only as wide as the chick can walk — see GROUND_H. It sits
            before the chick in the DOM so the chick paints over it and takes
            its own clicks, which is what keeps a tap on the chick from
            dropping food underneath itself. */}
        <div
          ref={groundRef}
          onClick={dropFood}
          style={{ height: GROUND_H }}
          className="pointer-events-auto absolute bottom-0 left-0"
        />

        {food !== null && (
          <div
            className="pointer-events-none absolute bottom-0 left-0"
            style={{ transform: `translateX(${food - FOOD_W / 2}px)` }}
          >
            <svg
              width={FOOD_W}
              height="7"
              viewBox="0 0 16 7"
              fill="none"
              style={{
                animation: "chick-food-drop 320ms cubic-bezier(0.34,1.56,0.64,1)",
                transformOrigin: "50% 100%",
              }}
            >
              <ellipse cx="3.4" cy="5.2" rx="2.1" ry="1.5" fill="#c8a05a" transform="rotate(-18 3.4 5.2)" />
              <ellipse cx="8" cy="4.1" rx="2.3" ry="1.6" fill="#e0b96d" transform="rotate(12 8 4.1)" />
              <ellipse cx="12.6" cy="5.4" rx="2" ry="1.4" fill="#b98f4c" transform="rotate(-8 12.6 5.4)" />
            </svg>
          </div>
        )}

        <div
          ref={chickRef}
          data-cursor="chick"
          data-dragging={dragging ? "true" : undefined}
          style={
            {
              "--chick-body": queasyMessage ? "#a8c46a" : "#f7cf4e",
              "--chick-shade": queasyMessage ? "#8fae55" : "#e3b336",
            } as React.CSSProperties
          }
          onPointerEnter={startGreeting}
          onPointerLeave={() => {
            if (!draggingRef.current) endGreeting();
          }}
          onPointerDown={(e) => {
            const track = trackRef.current;
            if (!track) return;
            e.preventDefault();
            e.currentTarget.setPointerCapture(e.pointerId);
            grabOffsetRef.current =
              e.clientX - track.getBoundingClientRect().left - xRef.current;
            draggingRef.current = true;
            setDragging(true);
            // Picked up mid-peck: drop the mouthful and reset the clock.
            peckUntilRef.current = 0;
            nextPeckAtRef.current = performance.now() + between(PECK_EVERY);
            startGreeting();
          }}
          onPointerMove={(e) => {
            if (draggingRef.current) positionFromPointer(e.clientX);
          }}
          onPointerUp={(e) => {
            if (!draggingRef.current) return;
            e.currentTarget.releasePointerCapture(e.pointerId);
            draggingRef.current = false;
            setDragging(false);
            // A beat to find its feet before walking off again.
            pausedUntilRef.current = performance.now() + DROP_PAUSE_MS;
            releaseAfterDelay();
          }}
          className={`pointer-events-auto absolute bottom-0 left-0 touch-none select-none leading-none${queasyMessage ? " chick-queasy" : ""}`}
        >
          {greeting || queasyMessage ? <ChickFront /> : <ChickSide />}

          {greeting && (
            // Sits beside the head rather than above it: the track clips
            // anything that rises past its top edge.
            <span
              style={{ animation: `chick-heart ${GREET_MS}ms ease-out forwards` }}
              className="absolute left-full top-0.5 text-[0.7rem] leading-none"
            >
              ❤️
            </span>
          )}
        </div>
      </div>

      {/* One bubble for both moods — they never overlap, and paint() moves
          whichever is up, since it lives outside the clipped strip. */}
      {(queasyMessage ?? thanksMessage) && (
        <div
          ref={bubbleRef}
          className="absolute left-0 top-full mt-1 whitespace-nowrap rounded-xl border border-accent/30 bg-background/95 px-3 py-1.5 text-xs font-medium text-foreground shadow-xl backdrop-blur-md"
        >
          {queasyMessage ?? thanksMessage}
        </div>
      )}
    </div>
  );
}
