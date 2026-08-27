"use client";

import { motion } from "motion/react";
import { useLocale } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";

type AskAiButtonProps = {
  prompt: string;
  label?: string;
  size?: "sm" | "md";
  variant?: "glass" | "subtle" | "ghost" | "card";
  className?: string;
  iconOnly?: boolean;
};

export function AskAiButton({
  prompt,
  label,
  size = "md",
  variant = "glass",
  className,
  iconOnly = false,
}: AskAiButtonProps) {
  const locale = useLocale();
  const isTr = locale === "tr";

  const defaultLabel = isTr ? "Asistana Sor" : "Ask AI";
  const displayLabel = label || defaultLabel;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("mert-ask-ai", {
          detail: { prompt },
        })
      );
    }
  };

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      title={displayLabel}
      aria-label={`${displayLabel}: ${prompt}`}
      className={cn(
        /* tap-target: the visible box is 27px tall at sm and 34px at md, and
           neither is a thumb target. The overlay grows the hit area to 44px
           on coarse pointers without touching layout, so the type stays as
           drawn. */
        "group/ai-btn tap-target relative inline-flex items-center justify-center gap-2 rounded-full font-mono transition-all duration-300 cursor-pointer select-none",
        /* sm is a desktop size: it exists to sit quietly beside a section
           heading. On a phone it rendered 10px type in a 27px box, under the
           11px the rest of the site treats as its floor (see microlabel), so
           below sm it borrows md metrics and the small ones start at sm. */
        size === "sm" &&
          "px-4 py-2.5 text-[0.6875rem] tracking-[0.12em] sm:px-3 sm:py-1.5 sm:text-[0.625rem] sm:tracking-[0.1em]",
        size === "md" && "px-4 py-2 text-[0.6875rem] tracking-[0.12em]",
        variant === "glass" &&
          "border border-white/20 bg-white/5 text-white backdrop-blur-md hover:border-accent hover:bg-accent/15 hover:text-accent shadow-sm",
        variant === "card" &&
          "border border-white/25 bg-black/40 text-white/90 backdrop-blur-md hover:border-accent hover:bg-accent/20 hover:text-accent shadow-lg shadow-black/20",
        variant === "subtle" &&
          "hairline bg-surface/60 text-muted hover:border-accent/60 hover:bg-accent/10 hover:text-foreground",
        variant === "ghost" &&
          "text-muted hover:text-accent hover:bg-accent/10",
        className
      )}
    >
      {/* Sparkle Icon */}
      <span
        aria-hidden
        className="relative flex items-center justify-center text-accent transition-transform duration-300 group-hover/ai-btn:rotate-12 group-hover/ai-btn:scale-110"
      >
        <svg
          className={cn("fill-current", size === "sm" ? "size-3" : "size-3.5")}
          viewBox="0 0 24 24"
        >
          <path d="M12 2L14.4 8.6L21 11L14.4 13.4L12 20L9.6 13.4L3 11L9.6 8.6L12 2Z" />
        </svg>
      </span>

      {!iconOnly && (
        <span className="font-semibold uppercase truncate">
          {displayLabel}
        </span>
      )}
    </motion.button>
  );
}
