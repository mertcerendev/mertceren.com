"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ReactLenis, useLenis } from "lenis/react";
import "lenis/dist/lenis.css";
import { locales } from "@/lib/content";

const LOCALE_PREFIX = new RegExp(`^/(?:${locales.join("|")})(?=/|$)`);
const barePath = (path: string) => path.replace(LOCALE_PREFIX, "") || "/";

/**
 * The bare path this module last navigated to, so the effect below can tell
 * a change of page from a change of language.
 *
 * Module scope rather than a ref: the layout this lives in sits under
 * app/[lang], and switching locale changes that segment's param, which can
 * take the component down and bring it back with a fresh ref. A module-level
 * value survives that and is reset by a full page load, which is exactly when
 * arriving at the top is right again.
 */
let lastBarePath: string | null = null;

/**
 * Puts the new page at the top after a client-side navigation.
 *
 * Lenis does not read the window's scroll position, it owns it: every frame
 * it writes its own internal offset back onto the document. Nothing resets
 * that offset when the route changes, so opening a case study from halfway
 * down the project list left Lenis still holding the homepage's offset and
 * it painted the new page at that same distance down — the further down the
 * card you clicked, the further into the case study you landed. The router's
 * own scroll-to-top runs and is then overwritten on the next frame.
 *
 * Anchors are left alone. A hash means somewhere specific was asked for —
 * the "back to projects" link on a case study is `/#work` — so the target is
 * scrolled to instead, through Lenis, since a native jump would be undone
 * the same way. `immediate` because this is arrival, not a journey: pages
 * should open where they open, without animating there.
 */
function ScrollToTopOnNavigate() {
  const lenis = useLenis();
  const pathname = usePathname();

  useEffect(() => {
    if (!lenis) return;

    const bare = barePath(pathname);
    const previous = lastBarePath;
    lastBarePath = bare;

    /* Same page in the other language: the reader asked for a translation,
       not a trip back to the top. This runs on any pathname change, and
       /tr -> /en is one, so it was undoing the toggle's own scroll={false}
       and throwing the reader out of whatever section they were reading. */
    if (previous !== null && previous === bare) return;

    const { hash } = window.location;
    if (hash) {
      const target = document.querySelector(hash);
      if (target) {
        lenis.scrollTo(target as HTMLElement, { immediate: true, force: true });
        return;
      }
    }

    lenis.scrollTo(0, { immediate: true, force: true });
  }, [pathname, lenis]);

  return null;
}

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.1, smoothWheel: true }}>
      <ScrollToTopOnNavigate />
      {children}
    </ReactLenis>
  );
}
