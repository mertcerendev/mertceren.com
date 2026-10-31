"use client";

import { useEffect } from "react";
import { useLocale } from "@/components/providers/locale-provider";
import { readMute } from "@/lib/cursor-mute";

const AWAY_TITLE = {
  tr: "🐣 Geri gel, civciv bekliyor",
  en: "🐣 Come back, the chick is waiting",
} as const;

/**
 * The favicon with its period hollowed out — the site's mark, dozing. Same
 * geometry as app/icon.tsx: a dark tile, the editorial hairline down the left,
 * and the accent dot in the bottom corner, here as a ring rather than a disc.
 */
const AWAY_ICON = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#0a0a0b"/><rect x="13" y="13" width="3" height="38" fill="#f2f0ea" opacity=".45"/><circle cx="44" cy="44" r="5.5" fill="none" stroke="#ff4d00" stroke-width="3"/></svg>`
)}`;

/**
 * While the tab is in the background its title and favicon change, so the
 * tab strip shows the site waiting for you; both go back the moment you
 * return.
 *
 * The real values are read at the moment the tab is hidden rather than once
 * on mount: a case study sets its own title, and a locale switch changes it,
 * so a copy taken earlier could restore a page you have since left.
 *
 * Do-not-disturb covers this too, the same as the cursor's bubbles and the
 * idle overlay — it is one more thing on the page talking to you.
 */
export function TabPresence() {
  const locale = useLocale();

  useEffect(() => {
    let savedTitle: string | null = null;
    let savedIcons: Array<[HTMLLinkElement, string]> = [];

    const restore = () => {
      if (savedTitle === null) return;
      document.title = savedTitle;
      for (const [link, href] of savedIcons) link.href = href;
      savedTitle = null;
      savedIcons = [];
    };

    const onVisibility = () => {
      if (!document.hidden) {
        restore();
        return;
      }
      if (savedTitle !== null || readMute()) return;
      savedTitle = document.title;
      savedIcons = [
        ...document.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]'),
      ].map((link) => [link, link.href]);
      document.title = AWAY_TITLE[locale];
      for (const [link] of savedIcons) link.href = AWAY_ICON;
    };

    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      restore();
    };
  }, [locale]);

  return null;
}
