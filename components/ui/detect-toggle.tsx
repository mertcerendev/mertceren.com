"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  DETECT_CHANGED_EVENT,
  DETECT_TOGGLE_EVENT,
} from "@/components/ui/detect-overlay";
import { cn } from "@/lib/utils";

/**
 * Companion switch for DetectOverlay. Same shape as the do-not-disturb
 * toggle beside it — the overlay owns the state and this only asks for it to
 * flip, so the two stay in step wherever the button is rendered.
 */
export function DetectToggle({ className }: { className?: string }) {
  const pathname = usePathname() ?? "/";
  const isEnglish = pathname === "/en" || pathname.startsWith("/en/");

  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (typeof detail?.enabled === "boolean") setEnabled(detail.enabled);
    };
    window.addEventListener(DETECT_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(DETECT_CHANGED_EVENT, onChange);
  }, []);

  const label = enabled
    ? isEnglish
      ? "Turn off detection mode"
      : "Tespit modunu kapat"
    : isEnglish
    ? "Turn on detection mode"
    : "Tespit modunu aç";

  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent(DETECT_TOGGLE_EVENT))}
      aria-pressed={enabled}
      aria-label={label}
      title={label}
      className={cn(
        "flex size-9 items-center justify-center rounded-full border transition-all duration-300 cursor-pointer",
        enabled
          ? "border-accent bg-accent/15 text-accent"
          : "hairline bg-surface/40 text-foreground hover:border-foreground/40",
        className
      )}
    >
      {/* A reticle rather than an emoji: the other controls in this row are
          emoji, but this one names a mode rather than a mood, and the shape
          is the same one the overlay draws. */}
      <svg
        viewBox="0 0 20 20"
        className="size-[1.05rem]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      >
        <path d="M3 7V4.6A1.6 1.6 0 0 1 4.6 3H7" />
        <path d="M13 3h2.4A1.6 1.6 0 0 1 17 4.6V7" />
        <path d="M17 13v2.4a1.6 1.6 0 0 1-1.6 1.6H13" />
        <path d="M7 17H4.6A1.6 1.6 0 0 1 3 15.4V13" />
        <circle cx="10" cy="10" r="2.4" />
      </svg>
    </button>
  );
}
