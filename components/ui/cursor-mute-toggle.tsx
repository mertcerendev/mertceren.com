"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function CursorMuteToggle({ className }: { className?: string }) {
  const pathname = usePathname() ?? "/";
  const isEnglish = pathname === "/en" || pathname.startsWith("/en/");

  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("mert_cursor_muted");
      if (saved === "true") setIsMuted(true);
    } catch {
      // ignore
    }

    const handleStateChange = (e: Event) => {
      const customEvt = e as CustomEvent;
      if (typeof customEvt.detail?.muted === "boolean") {
        setIsMuted(customEvt.detail.muted);
      }
    };

    window.addEventListener("mert-cursor-mute-changed", handleStateChange);
    return () => window.removeEventListener("mert-cursor-mute-changed", handleStateChange);
  }, []);

  const handleClick = () => {
    window.dispatchEvent(new CustomEvent("mert-toggle-cursor-mute"));
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      /* One flag, three things: the cursor's bubbles, the idle overlay that
         dims the page, and the chick's one greeting on a phone. Naming any
         of them individually gets it wrong somewhere — "mute the cursor" is
         a lie on a phone, where there is no cursor and the switch still does
         two jobs. What they have in common is that they all speak without
         being asked, so the switch is named for that. Feeding the chick still
         gets an answer: this is not a gag, it is do-not-disturb. */
      aria-label={
        isMuted
          ? isEnglish
            ? "Turn off do not disturb"
            : "Rahatsız Etmeyi Kapat"
          : isEnglish
          ? "Do not disturb"
          : "Rahatsız Etme"
      }
      title={
        isMuted
          ? isEnglish
            ? "Turn off do not disturb 🤪"
            : "Rahatsız Etmeyi Kapat 🤪"
          : isEnglish
          ? "Do not disturb 🤐"
          : "Rahatsız Etme 🤐"
      }
      className={cn(
        "flex size-9 items-center justify-center rounded-full border transition-all duration-300 cursor-pointer text-[1rem]",
        isMuted
          ? "border-amber-500/60 bg-amber-500/15 text-amber-400 hover:border-amber-500"
          : "hairline bg-surface/40 text-foreground hover:border-foreground/40",
        className
      )}
    >
      <span>{isMuted ? "🤐" : "🤪"}</span>
    </button>
  );
}
