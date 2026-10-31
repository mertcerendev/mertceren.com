"use client";

import { useEffect } from "react";
import { useContent, useLocale } from "@/components/providers/locale-provider";

const REPO = "https://github.com/mertcerendev/mertceren.com";

/* Module scope, not a ref: StrictMode runs the effect twice in development,
   and a locale switch remounts the layout's children — either way the
   greeting would be printed again into a console that already has it. */
let greeted = false;

/**
 * A note in the DevTools console for whoever opens it — usually another
 * developer reading the source, or someone hiring who wants to see how the
 * page is put together. The wordmark in the site's own colours, then where
 * the code lives and where to write.
 *
 * The page's fonts are self-hosted under hashed family names the console
 * cannot see, so the wordmark is set in the system face.
 */
export function ConsoleGreeting() {
  const locale = useLocale();
  const { profile } = useContent();

  useEffect(() => {
    if (greeted) return;
    greeted = true;

    const mark =
      "font: 800 26px/1.4 system-ui, sans-serif; letter-spacing: -0.02em; background: #0a0a0b; padding: 10px 0 10px 14px; color: #f2f0ea";
    const dot =
      "font: 800 26px/1.4 system-ui, sans-serif; background: #0a0a0b; padding: 10px 14px 10px 0; color: #ff4d00";
    const body = "font: 12px/1.7 ui-monospace, monospace; color: inherit";
    const accent = "font: 12px/1.7 ui-monospace, monospace; color: #ff4d00";

    const lines =
      locale === "tr"
        ? [
            "Konsolu açtıysan aynı dili konuşuyoruz demektir. 👀",
            "Bu sitenin kodu açık:",
            "Staj ya da proje için:",
          ]
        : [
            "If you opened the console, we speak the same language. 👀",
            "This site's code is open:",
            "For an internship or a project:",
          ];

    console.log(`%c${profile.wordmark}%c.`, mark, dot);
    console.log(
      `%c${lines[0]}\n${lines[1]} %c${REPO}\n%c${lines[2]} %c${profile.email}`,
      body,
      accent,
      body,
      accent
    );
  }, [locale, profile]);

  return null;
}
