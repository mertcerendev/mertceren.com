"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "motion/react";
import { usePathname } from "next/navigation";
import { readMute, readMuteOnServer, subscribeMute } from "@/lib/cursor-mute";

/** Muting the cursor bubbles means "be quiet" — that covers this too. The
    pair this file used to declare now lives in lib/cursor-mute, where the
    header toggle and the cursor read it as well. */

/**
 * Three escalating stages of being ignored. `delay` is the wait *since the
 * previous stage*, not since the visitor went quiet — so the timeline lands at
 * 40s, 50s and 60s. Nobody sits still much longer than that, so the whole
 * escalation is over within a minute.
 */
const STAGES = [
  { delay: 40_000, dim: 0.55, blur: 2 }, // 40s
  { delay: 10_000, dim: 0.76, blur: 4 }, // 50s
  { delay: 10_000, dim: 0.9, blur: 7 }, // 60s
];

const MESSAGES_TR = [
  [
    "Uyudun mu? 😴 Işıkları biraz kıstım.",
    "Ekrana dalıp gitmişsin galiba... 🌙",
    "Tasarruf moduna geçiyorum ⚡",
  ],
  [
    "Hâlâ oradaysan bir kıpırda 👀",
    "Fare kayboldu mu, yoksa ben mi sıkıcıyım? 😅",
    "Bu sessizlik biraz uzadı ha 🤨",
  ],
  [
    "Gittiysen sekmeyi kapat da RAM boşuna yanmasın 🔌",
    "Tamam, ben moda geçtim. İyi geceler 🌚",
    "Işıkları kapatıyorum, elektrik pahalı 💡",
  ],
];

const MESSAGES_EN = [
  [
    "Did you doze off? 😴 I dimmed the lights.",
    "You've drifted off somewhere... 🌙",
    "Switching to power saving mode ⚡",
  ],
  [
    "Wiggle something if you're still there 👀",
    "Did the mouse run off, or am I just boring? 😅",
    "This silence is getting a bit long 🤨",
  ],
  [
    "If you've left, close the tab — save the RAM 🔌",
    "Fine, I'm going to sleep. Good night 🌚",
    "Turning the lights off, electricity is expensive 💡",
  ],
];

const HINT_TR = "Devam etmek için hareket et";
const HINT_EN = "Move anything to wake it up";

const ACTIVITY_EVENTS = [
  "pointermove",
  "pointerdown",
  "wheel",
  "keydown",
  "touchstart",
  "scroll",
] as const;

/**
 * Dims the site and throws a bit of shade once the visitor stops interacting.
 * Any input at all brings it straight back, and the whole thing stays out of
 * the way: the overlay never captures pointer events.
 */
export function IdleMode() {
  const pathname = usePathname() ?? "/";
  const isEnglish = pathname === "/en" || pathname.startsWith("/en/");

  const [stage, setStage] = useState(0);
  const [message, setMessage] = useState("");
  // Server render is always unmuted so the markup matches on hydration.
  const isMuted = useSyncExternalStore(subscribeMute, readMute, readMuteOnServer);

  const stageRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastWakeRef = useRef(0);
  // One shuffled deck per stage so a stage never repeats a line back to back.
  const decksRef = useRef<number[][]>([[], [], []]);
  const lastPickRef = useRef<number[]>([-1, -1, -1]);

  useEffect(() => {
    const messages = isEnglish ? MESSAGES_EN : MESSAGES_TR;

    const pick = (stageIndex: number) => {
      const pool = messages[stageIndex];
      if (decksRef.current[stageIndex].length === 0) {
        const deck = Array.from({ length: pool.length }, (_, i) => i);
        for (let i = deck.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        // Cards are drawn off the end, so guard the last slot.
        if (
          deck[deck.length - 1] === lastPickRef.current[stageIndex] &&
          deck.length > 1
        ) {
          [deck[deck.length - 1], deck[0]] = [deck[0], deck[deck.length - 1]];
        }
        decksRef.current[stageIndex] = deck;
      }
      const index = decksRef.current[stageIndex].pop()!;
      lastPickRef.current[stageIndex] = index;
      return pool[index];
    };

    const scheduleFrom = (current: number) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      const next = STAGES[current];
      if (!next) return; // deepest stage reached, let it rest

      timerRef.current = setTimeout(() => {
        // Read fresh rather than closing over state: the effect does not
        // re-run when the visitor toggles mute.
        if (readMute()) return;
        const advanced = current + 1;
        stageRef.current = advanced;
        setMessage(pick(advanced - 1));
        setStage(advanced);
        scheduleFrom(advanced);
      }, next.delay);
    };

    const wake = () => {
      const now = Date.now();
      // While awake, pointermove fires constantly — no need to reset the timer
      // more than once a second. While dimmed, react immediately.
      if (stageRef.current === 0 && now - lastWakeRef.current < 1_000) return;
      lastWakeRef.current = now;

      if (stageRef.current !== 0) {
        stageRef.current = 0;
        setStage(0);
      }
      scheduleFrom(0);
    };

    const onVisibility = () => {
      if (document.hidden) {
        if (timerRef.current) clearTimeout(timerRef.current);
        // Coming back to the tab is itself a wake-up, so never resume dimmed.
        stageRef.current = 0;
        setStage(0);
      } else {
        wake();
      }
    };

    for (const evt of ACTIVITY_EVENTS) {
      window.addEventListener(evt, wake, { passive: true });
    }
    document.addEventListener("visibilitychange", onVisibility);

    scheduleFrom(0);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      for (const evt of ACTIVITY_EVENTS) {
        window.removeEventListener(evt, wake);
      }
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [isEnglish]);

  const config = STAGES[stage - 1];

  return (
    <AnimatePresence>
      {stage > 0 && !isMuted && config && (
        <motion.div
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          // Never swallow a click: the same click also wakes the site up.
          className="pointer-events-none fixed inset-0 z-[9000] flex items-center justify-center"
        >
          <div
            className="absolute inset-0 bg-background transition-[opacity,backdrop-filter] duration-1000 ease-out"
            style={{
              opacity: config.dim,
              backdropFilter: `blur(${config.blur}px)`,
              WebkitBackdropFilter: `blur(${config.blur}px)`,
            }}
          />

          <motion.div
            key={stage}
            initial={{ opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex flex-col items-center gap-5 px-6 text-center"
          >
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex size-2.5 rounded-full bg-accent" />
            </span>

            <p className="max-w-lg font-display text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
              {message}
            </p>

            <p className="microlabel text-muted">
              {isEnglish ? HINT_EN : HINT_TR}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
