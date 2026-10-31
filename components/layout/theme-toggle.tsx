"use client";

import { flushSync } from "react-dom";
import { useTheme } from "next-themes";
import { useMounted } from "@/lib/hooks/use-mounted";
import { useContent } from "@/components/providers/locale-provider";

/**
 * Dark / light switch. The label is what made this the widest control in the
 * header, and a phone has no room for it: the bar overflowed its own padding
 * and the wordmark ended up touching the language toggle. Below sm it shrinks
 * to the dot alone, in the same 40px circle the neighbouring controls use —
 * the dot carries the state and aria-label carries the rest, so dropping the
 * word costs nothing.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();
  const { ui } = useContent();

  const isDark = resolvedTheme === "dark";

  /**
   * The new theme opens out of the button as a circle instead of replacing
   * the page in one frame.
   *
   * The class is put on <html> here, inside the transition's callback, and
   * not left to next-themes: it applies the class from an effect, which runs
   * after the browser has already taken its "after" snapshot, so the circle
   * would open onto the theme you were leaving. setTheme still runs, for the
   * stored preference and for everything that reads resolvedTheme.
   *
   * `theme-vt` on the root switches the default cross-fade off and every
   * CSS transition with it, for as long as the reveal runs — see globals.css.
   * Without that, the new snapshot is live and each transition-colors
   * element would be seen fading from the old palette inside the circle.
   *
   * Browsers without the API swap instantly, as they always did.
   */
  const toggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const next = isDark ? "light" : "dark";
    if (!document.startViewTransition) {
      setTheme(next);
      return;
    }

    const box = e.currentTarget.getBoundingClientRect();
    const x = box.left + box.width / 2;
    const y = box.top + box.height / 2;
    // Far enough to reach the corner of the viewport furthest from the button.
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const root = document.documentElement;
    root.classList.add("theme-vt");
    const transition = document.startViewTransition(() => {
      root.classList.remove("light", "dark");
      root.classList.add(next);
      root.style.colorScheme = next;
      flushSync(() => setTheme(next));
    });

    transition.ready
      .then(() => {
        root.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${radius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 650,
            easing: "cubic-bezier(0.16, 1, 0.3, 1)",
            pseudoElement: "::view-transition-new(root)",
          }
        );
      })
      // ready rejects when the transition is skipped — a second click before
      // this one has finished, say. The theme has changed either way.
      .catch(() => {});
    transition.finished.finally(() => root.classList.remove("theme-vt"));
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={
        mounted
          ? isDark
            ? ui.theme.switchToLight
            : ui.theme.switchToDark
          : ui.theme.toggle
      }
      // The label is what makes this the widest control in the bar, and there
      // is no room for it on a phone: the header overflowed its own padding
      // and the wordmark ended up touching the language toggle. Below sm it
      // shrinks to the dot alone, in the same 40px circle the other controls
      // use. The dot already carries the state, and aria-label carries the
      // rest, so nothing is lost by dropping the word.
      className="tap-target group flex size-10 items-center justify-center rounded-full border hairline transition-colors duration-300 hover:border-foreground/40 sm:h-auto sm:w-auto sm:gap-2 sm:px-3.5 sm:py-2"
    >
      <span
        aria-hidden
        className="size-3.5 rounded-full border border-current bg-current transition-all duration-300 dark:bg-transparent sm:size-2.5"
      />
      <span className="microlabel hidden text-foreground sm:inline">
        {mounted ? (isDark ? ui.theme.light : ui.theme.dark) : ui.theme.fallback}
      </span>
    </button>
  );
}
