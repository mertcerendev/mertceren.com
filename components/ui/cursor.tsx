"use client";

import { useCallback, useEffect, useState, useRef, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { readMute, readMuteOnServer, subscribeMute, writeMute } from "@/lib/cursor-mute";

const IDLE_MESSAGES_TR = [
  "Hangi projeyi incelesek? 🤔",
  "Kod yazarken ben: ☕ + 💻",
  "YOLOv11 kareleri sayıyor... 🤖",
  "Beni burada unuttun sanırım 😅",
  "Bug var mı diye bakıyorum... 🐛🔍",
  "Buradayım, kaybolmadım! 👋",
  "Yine mi aşağı kaydırıyorsun? 📜",
  "Sayfayı aşındırdın valla 😅",
  "Gözüm üzerinde 👀",
  "Kaydırma tekerleğin yorulmadı mı? 🖱️",
  "Projeleri beğendin mi? 🚀",
  "Aşağıdaki butonlar tıklanmak için var 🚀",
  "Bana mı bakıyorsun, projelere mi? 👀",
  "Piksel piksel inceledin valla 🔍",
  "Sayfada kaybolursan ses et! 📍",
  "Tıklamaktan korkma, bozulmaz! 🖱️💥",
  "Biraz daha durursan çay koyacağım ☕",
  "Ben de buradayım ha, unutma 👀",
  "İmleçim diye ciddiye almıyorsun beni 🥲",
  "Sen bilirsin, ben bir şey demiyorum... 😑",
];

/**
 * Replaces the idle deck while the pointer is resting on a project card.
 *
 * These lines used to sit in the general deck and so came up anywhere — a
 * nudge to ask the assistant about a project, delivered while you were
 * reading the contact section, and a jealous remark about a button that was
 * nowhere on screen. Here they land next to the "Asistana Sor" button they
 * are talking about, which is the only place either joke actually lands.
 */
const PROJECT_MESSAGES_TR = [
  "Bu projeyi asistana sorabilirsin 🤖",
  "Detayını merak ettiysen asistan anlatır 👇",
  "Asistana soracağına bana sorsana 🙄",
  "Asistan mı ben mi? Bir karar ver 😤",
  "O asistanın benden fazla nesi var? 😒",
  "Karta tıkla, hikâyesi içeride 📂",
];

const PROJECT_MESSAGES_EN = [
  "You can ask the assistant about this one 🤖",
  "Curious about the details? The assistant knows 👇",
  "Ask me instead of that assistant 🙄",
  "The assistant or me? Pick one 😤",
  "What's that assistant got that I haven't? 😒",
  "Click the card, the story is inside 📂",
];

const IDLE_MESSAGES_EN = [
  "Which project shall we explore? 🤔",
  "Me while coding: ☕ + 💻",
  "YOLOv11 counting frames... 🤖",
  "I think you forgot me here 😅",
  "Looking for bugs... 🐛🔍",
  "Still here, not lost! 👋",
  "Scrolling down again? 📜",
  "You're wearing out the page 😅",
  "My eyes are on you 👀",
  "Is your scroll wheel tired yet? 🖱️",
  "Liking the projects so far? 🚀",
  "The buttons below are meant to be clicked 🚀",
  "Looking at me or the projects? 👀",
  "Examined pixel by pixel 🔍",
  "Shout if you get lost on the page! 📍",
  "Don't be afraid to click, it won't break! 🖱️💥",
  "If you stay a bit longer, I'll pour tea ☕",
  "I'm right here too, you know 👀",
  "You don't take me seriously, I'm just a cursor 🥲",
  "Suit yourself. Not saying a word... 😑",
];

/** Fired when the page is flung, not merely scrolled. */
const SCROLL_DOWN_TR = [
  "Yavaş ol biraz, başım döndü 😵‍💫",
  "Bu hızda iniyorsan kemer tak 🎢",
  "Kaydırma tekerini kırmaya mı çalışıyorsun? 🌀",
  "Iıı, çok hızlı indik aşağı 🫠",
];

const SCROLL_UP_TR = [
  "Yukarı fırladık, midem ağzıma geldi 😵",
  "Asansör mü bu? 🛗",
  "Bir şey mi kaçırdın, niye geri döndük? 🤨",
  "Roket gibi çıktık valla 🚀",
];

const SCROLL_DOWN_EN = [
  "Slow down, you're making me dizzy 😵‍💫",
  "Buckle up if we're going that fast 🎢",
  "Trying to snap that scroll wheel? 🌀",
  "Whoa, that was a long way down 🫠",
];

const SCROLL_UP_EN = [
  "Shot straight up — my stomach dropped 😵",
  "Is this an elevator? 🛗",
  "Miss something? Why are we back up here? 🤨",
  "That was practically a launch 🚀",
];

/**
 * Flick speed that counts as "flung", and how long before it can nag again.
 * Lenis eases the wheel out over several frames, so peak velocity here is
 * lower than a raw native scroll: a wheel notch lands around 300px/s and a
 * hard fling clears 3000px/s.
 */
const FAST_SCROLL_PX_PER_SEC = 2000;
const SCROLL_REACTION_COOLDOWN = 9000;
const SCROLL_REACTION_MS = 2600;

/** How close to an edge the cursor has to be for the bubble to move aside. */
const BUBBLE_EDGE_X = 220;
const BUBBLE_EDGE_Y = 120;

const TAIL_BASE = "absolute size-2 rotate-45 border-accent/30 bg-background/95";

/**
 * Where the bubble hangs off the cursor, per corner or edge it is near: the
 * offset, whether the box is centred / right-aligned on the cursor, and which
 * side the little tail points from.
 */
const BUBBLE_PLACEMENTS = {
  default: {
    x: 0,
    y: -58,
    align: "-translate-x-1/2",
    tail: "-bottom-1 left-1/2 -translate-x-1/2 border-b border-r",
  },
  top: {
    x: 0,
    y: 25,
    align: "-translate-x-1/2",
    tail: "-top-1 left-1/2 -translate-x-1/2 border-t border-l",
  },
  left: {
    x: 25,
    y: -18,
    align: "",
    tail: "-left-1 top-1/2 -translate-y-1/2 border-b border-l",
  },
  right: {
    x: -25,
    y: -18,
    align: "-translate-x-full",
    tail: "-right-1 top-1/2 -translate-y-1/2 border-t border-r",
  },
  "top-left": {
    x: 20,
    y: 20,
    align: "",
    tail: "-top-1 left-3 border-t border-l",
  },
  "top-right": {
    x: -20,
    y: 20,
    align: "-translate-x-full",
    tail: "-top-1 right-3 border-t border-r",
  },
  "bottom-left": {
    x: 20,
    y: -45,
    align: "",
    tail: "-bottom-1 left-3 border-b border-l",
  },
  "bottom-right": {
    x: -20,
    y: -45,
    align: "-translate-x-full",
    tail: "-bottom-1 right-3 border-b border-r",
  },
} as const;

type BubbleZone = keyof typeof BUBBLE_PLACEMENTS;

function zoneFor(x: number, y: number, vw: number, vh: number): BubbleZone {
  const left = x < BUBBLE_EDGE_X;
  const right = x > vw - BUBBLE_EDGE_X;
  const top = y < BUBBLE_EDGE_Y;
  const bottom = y > vh - BUBBLE_EDGE_Y;

  if (top && left) return "top-left";
  if (top && right) return "top-right";
  if (bottom && left) return "bottom-left";
  if (bottom && right) return "bottom-right";
  if (left) return "left";
  if (right) return "right";
  if (top) return "top";
  return "default";
}

/**
 * Custom cursor: instant accent dot + silky smooth lerp trailing ring.
 * Displays a playful speech bubble with a header Mute / Unmute emoji toggle.
 */
export function Cursor() {
  const pathname = usePathname() ?? "/";
  const isEnglish = pathname === "/en" || pathname.startsWith("/en/");

  const [active, setActive] = useState(false);
  const [hovering, setHovering] = useState(false);
  // The ring is larger than the header chick and would bury it, so the
  // custom cursor steps aside and lets the native grab cursor show.
  const [overChick, setOverChick] = useState(false);
  const [idleMessage, setIdleMessage] = useState<string | null>(null);
  /** Talks over the idle deck when the page gets flung around. */
  const [reactionMessage, setReactionMessage] = useState<string | null>(null);

  // Mute & Sulky state. The flag lives in the shared store rather than in
  // this component, so the header toggle, the idle overlay and the chick
  // all read one value instead of four copies of the same localStorage.
  const isMuted = useSyncExternalStore(subscribeMute, readMute, readMuteOnServer);
  const [sulkyMessage, setSulkyMessage] = useState<string | null>(null);

  /**
   * Which side of the cursor the bubble hangs off. The bubble itself rides
   * along by transform like the dot does, so this only has to change when the
   * cursor crosses into a different edge of the viewport — a handful of
   * renders while a message is up, rather than one per frame.
   */
  const [bubbleZone, setBubbleZone] = useState<BubbleZone>("default");

  /**
   * The dot, the ring and the bubble are moved by writing transforms straight
   * onto these nodes from the animation loop. Routing a pointer position
   * through React state instead would re-render this whole component on every
   * mouse move and again on every frame — a few thousand renders a minute, all
   * of them throwing away identical markup.
   */
  const dotElRef = useRef<HTMLDivElement | null>(null);
  const ringElRef = useRef<HTMLDivElement | null>(null);
  const bubbleElRef = useRef<HTMLDivElement | null>(null);

  /** Live zone and viewport, kept by the frame loop so no render depends on them. */
  const zoneRef = useRef<BubbleZone>("default");
  const viewportRef = useRef({ w: 1200, h: 800 });
  const bubbleShownRef = useRef(false);

  const mouseRef = useRef({ x: -100, y: -100 });
  const ringRef = useRef({ x: -100, y: -100 });
  const activeRef = useRef(false);
  const hoveringRef = useRef(false);
  /** Whether the pointer is resting on a project card; picks the idle deck. */
  const onProjectRef = useRef(false);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastIndexRef = useRef<number>(-1);
  const queueRef = useRef<number[]>([]);
  const reactionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMutedRef = useRef(false);

  /* The same flag, readable from inside long-lived closures. The scroll
     loop below checks it on every event and the toggle handler needs it
     without re-subscribing, and neither can see a value captured at the
     render it was created in. Mirrored here rather than read from storage
     each time, which that loop would do hundreds of times a scroll. */
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  /* useCallback so the listener effect below can name these in its
     dependency array honestly. As plain functions they were a new pair on
     every render, and the effect quietly left them out to avoid
     re-subscribing on each one. */
  const handleMute = useCallback(() => {
    const tripMsg = isEnglish
      ? "Fine! I'll shut up! 🙄 Not saying a single word, happy?!"
      : "Öff tamam sustum ya! 🙄 HİÇ konuşmuyorum tamam mı!";

    setBubbleZone(zoneRef.current);
    setSulkyMessage(tripMsg);

    setTimeout(() => {
      setSulkyMessage(null);
      setIdleMessage(null);
      // Set here as well as by the effect above: the store notifies on the
      // next render, and the scroll loop may read the ref before then.
      isMutedRef.current = true;
      writeMute(true);
    }, 2200);
  }, [isEnglish]);

  const handleUnmute = useCallback(() => {
    isMutedRef.current = false;
    writeMute(false);

    const happyMsg = isEnglish
      ? "Yayy! Finally letting me talk again! 😄🎉"
      : "Yeyy! Sonunda konuşturdun beni! 😄🎉";

    setBubbleZone(zoneRef.current);
    setSulkyMessage(happyMsg);
    setTimeout(() => {
      setSulkyMessage(null);
    }, 2200);
  }, [isEnglish]);

  // Listen to header toggle event
  useEffect(() => {
    const handleToggleEvent = () => {
      if (isMutedRef.current) {
        handleUnmute();
      } else {
        handleMute();
      }
    };

    window.addEventListener("mert-toggle-cursor-mute", handleToggleEvent);
    return () => window.removeEventListener("mert-toggle-cursor-mute", handleToggleEvent);
  }, [handleMute, handleUnmute]);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine) return;

    const messages = isEnglish ? IDLE_MESSAGES_EN : IDLE_MESSAGES_TR;

    const readViewport = () => {
      viewportRef.current = { w: window.innerWidth, h: window.innerHeight };
    };
    readViewport();

    /**
     * Moves all three pieces once a frame: the dot pinned to the pointer, the
     * ring easing after it, the bubble riding along with the dot. Transforms
     * are written straight to the nodes, so a mouse crossing the screen costs
     * no React work at all — only crossing into a different edge of the
     * viewport does, and only while a message is actually up.
     */
    const paint = () => {
      if (activeRef.current) {
        const { x, y } = mouseRef.current;
        const factor = hoveringRef.current ? 1.0 : 0.12;
        ringRef.current.x += (x - ringRef.current.x) * factor;
        ringRef.current.y += (y - ringRef.current.y) * factor;

        const dot = dotElRef.current;
        if (dot) {
          dot.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
        }

        const ring = ringElRef.current;
        if (ring) {
          ring.style.transform = `translate3d(${ringRef.current.x}px, ${ringRef.current.y}px, 0) translate(-50%, -50%)`;
        }

        const bubble = bubbleElRef.current;
        if (bubble) {
          bubble.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        }

        const zone = zoneFor(x, y, viewportRef.current.w, viewportRef.current.h);
        if (zone !== zoneRef.current) {
          zoneRef.current = zone;
          // With nothing on screen the ref is enough: the next message reads
          // it as it appears, so the placement is right on its first frame.
          if (bubbleShownRef.current) setBubbleZone(zone);
        }
      }
      animFrameRef.current = requestAnimationFrame(paint);
    };

    animFrameRef.current = requestAnimationFrame(paint);

    const getNextIndex = () => {
      if (queueRef.current.length === 0) {
        const deck = Array.from({ length: messages.length }, (_, i) => i);
        for (let i = deck.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        if (deck[deck.length - 1] === lastIndexRef.current && deck.length > 1) {
          [deck[deck.length - 1], deck[0]] = [deck[0], deck[deck.length - 1]];
        }
        queueRef.current = deck;
      }
      const nextIndex = queueRef.current.pop()!;
      lastIndexRef.current = nextIndex;
      return nextIndex;
    };

    /** Same shuffled-deck rotation, for the short scroll-reaction lists. */
    const makePicker = (list: string[]) => {
      let deck: number[] = [];
      let last = -1;
      return () => {
        if (deck.length === 0) {
          deck = Array.from({ length: list.length }, (_, i) => i);
          for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
          }
          if (deck[deck.length - 1] === last && deck.length > 1) {
            [deck[deck.length - 1], deck[0]] = [deck[0], deck[deck.length - 1]];
          }
        }
        const index = deck.pop()!;
        last = index;
        return list[index];
      };
    };

    const pickScrollDown = makePicker(isEnglish ? SCROLL_DOWN_EN : SCROLL_DOWN_TR);
    const pickScrollUp = makePicker(isEnglish ? SCROLL_UP_EN : SCROLL_UP_TR);
    /* Its own rotation, so moving on and off a card does not replay a line.
       The general deck keeps its place independently of this one. */
    const pickProject = makePicker(
      isEnglish ? PROJECT_MESSAGES_EN : PROJECT_MESSAGES_TR
    );

    let lastScrollY = window.scrollY;
    let lastScrollAt = performance.now();
    let lastReactionAt = 0;

    const onScroll = () => {
      const now = performance.now();
      const y = window.scrollY;
      const dt = now - lastScrollAt;

      // Ignore the first sample and anything too small to measure against.
      if (dt >= 16) {
        const velocity = ((y - lastScrollY) / dt) * 1000;

        if (
          Math.abs(velocity) > FAST_SCROLL_PX_PER_SEC &&
          now - lastReactionAt > SCROLL_REACTION_COOLDOWN &&
          !isMutedRef.current
        ) {
          lastReactionAt = now;
          setBubbleZone(zoneRef.current);
          setReactionMessage(velocity > 0 ? pickScrollDown() : pickScrollUp());
          if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current);
          reactionTimerRef.current = setTimeout(
            () => setReactionMessage(null),
            SCROLL_REACTION_MS
          );
        }

        lastScrollY = y;
        lastScrollAt = now;
      }
    };

    const resetIdleTimer = () => {
      setIdleMessage(null);

      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }

      idleTimerRef.current = setTimeout(() => {
        setBubbleZone(zoneRef.current);
        // Where the pointer came to rest decides which deck speaks.
        setIdleMessage(
          onProjectRef.current ? pickProject() : messages[getNextIndex()]
        );
      }, 2500); // 2.5 seconds idle trigger
    };

    const onMove = (e: PointerEvent) => {
      const clientX = e.clientX;
      const clientY = e.clientY;

      mouseRef.current = { x: clientX, y: clientY };

      if (!activeRef.current) {
        ringRef.current = { x: clientX, y: clientY };
        activeRef.current = true;
        setActive(true);
      }

      if (hoveringRef.current) {
        ringRef.current = { x: clientX, y: clientY };
      }

      resetIdleTimer();
    };

    const onLeave = () => {
      activeRef.current = false;
      setActive(false);
      setIdleMessage(null);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };

    const onOver = (e: Event) => {
      const target = e.target as Element | null;
      const onChick = !!target?.closest?.('[data-cursor="chick"]');
      setOverChick(onChick);

      onProjectRef.current = !!target?.closest?.(
        '[data-cursor-context="project"]'
      );

      const isHover =
        !onChick && !!target?.closest?.("a, button, [role='button']");

      if (isHover && !hoveringRef.current) {
        ringRef.current = { x: mouseRef.current.x, y: mouseRef.current.y };
      }

      hoveringRef.current = isHover;
      setHovering(isHover);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", readViewport, { passive: true });
    document.addEventListener("mouseleave", onLeave, { passive: true });
    document.documentElement.classList.add("custom-cursor");

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", readViewport);
      document.removeEventListener("mouseleave", onLeave);
      document.documentElement.classList.remove("custom-cursor");
    };
  }, [isEnglish]);

  const bubbleMessage = sulkyMessage ?? (isMuted ? null : reactionMessage ?? idleMessage);
  const placement = BUBBLE_PLACEMENTS[bubbleZone];

  // Lets the frame loop know whether a zone change is worth a render.
  useEffect(() => {
    bubbleShownRef.current = bubbleMessage !== null;
  }, [bubbleMessage]);

  if (!active || overChick) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[999999] hidden md:block"
    >
      {/* 1. Instant Center Accent Dot — positioned by the frame loop */}
      <div
        ref={dotElRef}
        style={{ transform: "translate3d(-100px, -100px, 0) translate(-50%, -50%)" }}
        className="absolute left-0 top-0 size-1.5 rounded-full bg-accent transition-opacity duration-200"
      />

      {/* 2. Silky Smooth Trailing Ring — likewise */}
      <div
        ref={ringElRef}
        style={{ transform: "translate3d(-100px, -100px, 0) translate(-50%, -50%)" }}
        className="absolute left-0 top-0"
      >
        <div
          className={cn(
            "size-8 rounded-full border transition-[scale,border-color,background-color] duration-200 ease-out",
            hovering
              ? "scale-125 border-accent/80 bg-accent/10 shadow-sm"
              : "scale-100 border-foreground/35"
          )}
        />
      </div>

      {/* 3. Playful Speech Bubble — the wrapper rides the cursor with the dot,
          so a message stays attached while the pointer keeps moving. */}
      <div
        ref={bubbleElRef}
        style={{ transform: "translate3d(-100px, -100px, 0)" }}
        className="absolute left-0 top-0"
      >
        <AnimatePresence>
          {bubbleMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1, x: placement.x, y: placement.y }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 500, damping: 28 }}
              className={cn(
                "absolute left-0 top-0 whitespace-nowrap rounded-xl border border-accent/30 bg-background/95 px-3.5 py-1.5 text-xs font-medium text-foreground shadow-xl backdrop-blur-md",
                placement.align
              )}
            >
              {bubbleMessage}
              {/* Speech bubble tail pointer */}
              <div className={cn(TAIL_BASE, placement.tail)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
