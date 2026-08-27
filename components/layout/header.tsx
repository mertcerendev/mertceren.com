"use client";

import { useEffect, useState } from "react";
import { useMotionValueEvent, useScroll } from "motion/react";
import { useLenis } from "lenis/react";
import { useContent, useLocale } from "@/components/providers/locale-provider";
import { localePath } from "@/lib/content";
import { foreignLang } from "@/lib/foreign";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { HeaderChick } from "@/components/ui/header-chick";
import { CursorMuteToggle } from "@/components/ui/cursor-mute-toggle";
import { cn } from "@/lib/utils";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const lenis = useLenis();
  const { scrollY } = useScroll();
  const locale = useLocale();
  const { navItems, profile, ui } = useContent();
  const home = localePath(locale, "/");

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));

  // Lock page scroll while the overlay menu is open
  useEffect(() => {
    if (lenis) {
      if (menuOpen) lenis.stop();
      else lenis.start();
    }
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen, lenis]);

  /* Neither of these clears body.style.overflow. The effect above owns it
     and clears it as soon as menuOpen goes false, which happens well
     before the 150ms wait below; writing it here as well only gave the
     property a second owner. */
  const goTo = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    setMenuOpen(false);

    setTimeout(() => {
      const target = document.querySelector(href);
      if (!target) {
        window.location.assign(home === "/" ? `/${href}` : `${home}${href}`);
        return;
      }
      if (lenis) {
        lenis.start();
        lenis.scrollTo(href, { duration: 1.2 });
      } else {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }, 150);
  };

  const goTop = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuOpen(false);

    if (window.location.pathname !== home) {
      window.location.assign(home);
      return;
    }
    if (lenis) {
      lenis.start();
      lenis.scrollTo(0, { duration: 1.2 });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <>
      {/*
        focus-visible, not focus: the router moves focus here after a
        client-side navigation, and plain :focus would flash the link at
        mouse users on every project they open. :focus-visible only fires
        when the browser judges focus should be shown — i.e. keyboard.
      */}
      <a
        href="#main"
        className="sr-only z-100 bg-accent text-accent-ink focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:rounded-full focus-visible:px-5 focus-visible:py-3 focus-visible:font-mono focus-visible:text-xs"
      >
        {ui.skipToContent}
      </a>

      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 border-b transition-colors duration-500",
          scrolled && !menuOpen
            ? "hairline bg-background/85 backdrop-blur-md"
            : "border-transparent"
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
          <a
            href="#main"
            onClick={goTop}
            aria-label={`${profile.wordmark}. ${profile.name} — ${ui.backToTopAria}`}
            className="tap-target font-display text-lg font-extrabold lowercase tracking-tight"
          >
            {profile.wordmark}
            <span className="text-accent">.</span>
          </a>

          {/* gap-2 below sm, not gap-3: the do-not-disturb toggle joined this
              row on phones and the group grew into the wordmark, leaving them
              touching at 375px. Tightening the cluster's own spacing buys the
              12px back, and keeps the gap to the wordmark wider than the gaps
              inside the cluster — so it still reads as a wordmark and then a
              set of controls, rather than one undifferentiated row. */}
          <div className="flex items-center gap-2 sm:gap-6">
            <nav aria-label="Primary" className="hidden items-center gap-5 lg:flex xl:gap-7">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  lang={foreignLang(item.label)}
                  onClick={(e) => goTo(e, item.href)}
                  className="microlabel group relative block text-foreground after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-right after:scale-x-0 after:bg-accent after:transition-transform after:duration-300 hover:after:origin-left hover:after:scale-x-100"
                >
                  {/* The label rolls up and an accent copy takes its place,
                      arriving with the accent rule that wipes in underneath —
                      one gesture, not two.

                      This replaced a per-frame character scramble. That one
                      did not move the layout (the face is monospace, so the
                      row measured the same to the pixel however it was
                      jumbled) but it rewrote every unsettled letter on every
                      frame, from a pool with no Turkish letters in it, so
                      Turkish words decayed into Latin noise — and sweeping
                      the row set all seven running at once, which read as a
                      shudder rather than a decode. Transforms only here:
                      nothing re-renders, and the row cannot shift.

                      1.5em of line box, not the 1.35 that also fitted: the
                      cedilla on İLETİŞİM came within 0.43px of the clip edge
                      there, measured off the font's own ink bounds, and a
                      margin that thin is a rounding error away from shaving
                      the tail. */}
                  <span className="relative block h-[1.5em] overflow-hidden">
                    <span className="block leading-[1.5] transition-transform duration-[450ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-full">
                      {item.label}
                    </span>
                    <span
                      aria-hidden
                      className="absolute inset-0 block translate-y-full leading-[1.5] text-accent transition-transform duration-[450ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0"
                    >
                      {item.label}
                    </span>
                  </span>
                </a>
              ))}
            </nav>

            <LanguageToggle />
            <ThemeToggle />
            {/* Not on the narrowest phones. Four controls plus the wordmark
                come to the full 375px with nothing between the wordmark and
                the language link; this is the most secondary of them, so it
                moves into the menu below sm instead of crowding the row. */}
            <CursorMuteToggle className="hidden sm:flex" />

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? ui.menu.close : ui.menu.open}
              className="tap-target relative flex size-10 items-center justify-center rounded-xl border hairline bg-surface/40 lg:hidden"
            >
              <span
                className={cn(
                  "absolute h-0.5 w-5 bg-foreground transition-transform duration-300",
                  menuOpen ? "rotate-45" : "-translate-y-[3.5px]"
                )}
              />
              <span
                className={cn(
                  "absolute h-0.5 w-5 bg-foreground transition-transform duration-300",
                  menuOpen ? "-rotate-45" : "translate-y-[3.5px]"
                )}
              />
            </button>
          </div>
        </div>

        <HeaderChick />
      </header>

      {/* Full-screen mobile menu overlay */}
      <div
        id="mobile-menu"
        inert={!menuOpen}
        className={cn(
          "fixed inset-0 z-40 flex flex-col justify-between overflow-y-auto bg-background/98 px-6 pb-8 pt-24 backdrop-blur-xl transition-all duration-300 lg:hidden",
          menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        <nav aria-label="Mobile" className="my-auto flex flex-col gap-1 py-4">
          {navItems.map((item, i) => (
            <span key={item.href} className="block overflow-hidden py-1">
              <a
                href={item.href}
                lang={foreignLang(item.label)}
                onClick={(e) => goTo(e, item.href)}
                style={{ transitionDelay: menuOpen ? `${60 + i * 40}ms` : "0ms" }}
                className={cn(
                  "flex items-center gap-4 py-2 font-display text-2xl font-bold uppercase tracking-tight transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-accent sm:text-3xl",
                  menuOpen ? "translate-y-0 opacity-100" : "translate-y-[100%] opacity-0"
                )}
              >
                <span className="font-mono text-xs font-semibold text-accent">0{i + 1}</span>
                <span>{item.label}</span>
              </a>
            </span>
          ))}
        </nav>

        <div
          style={{ transitionDelay: menuOpen ? "300ms" : "0ms" }}
          className={cn(
            "flex flex-col gap-2 border-t hairline pt-4 transition-opacity duration-500 text-xs text-muted sm:flex-row sm:items-center sm:justify-between",
            menuOpen ? "opacity-100" : "opacity-0"
          )}
        >
          <a href={`mailto:${profile.email}`} className="tap-target font-mono hover:text-accent transition-colors">
            {profile.email}
          </a>
          <div className="flex items-center justify-between gap-4">
            <p className="font-mono">{profile.location}</p>
            {/* The header's copy stops below sm; this one takes over there,
                so the control is reachable on a phone without sitting in the
                top row. Hidden from sm up, where the header carries it. */}
            <CursorMuteToggle className="sm:hidden" />
          </div>
        </div>
      </div>
    </>
  );
}
