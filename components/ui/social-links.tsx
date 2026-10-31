"use client";

import { socials } from "@/lib/data";
import { Magnetic } from "@/components/ui/magnetic-button";
import { GLYPHS } from "@/lib/brand-glyphs";

const EXPO = "ease-[cubic-bezier(0.16,1,0.3,1)]";

/**
 * The mark is printed rather than merely lit up: at rest it sits in the well
 * as a grey plate, and on hover accent ink rises through the glyph from its
 * base to its top. Two stacked copies of the same path do it — the lower one
 * grey, the upper one accent under a clip that retracts — so the shape never
 * moves, only what it is inked with. The site's grain and hairlines are
 * borrowed from print; this is the same idea given something to do.
 *
 * The label stays visible instead of being a hover reward. There is no hover
 * on a phone, and a bare glyph nobody recognises is worse than a word.
 */
export function SocialLinks() {
  return (
    <ul className="flex items-start justify-center gap-10 sm:gap-14">
      {socials.map((social) => {
        const glyph = GLYPHS[social.label];
        return (
          <li key={social.label}>
            <Magnetic strength={0.25}>
              <a
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center gap-3.5"
              >
                <span
                  /* `scale`, not `transform`: in Tailwind v4 scale-* sets
                     the standalone property, so transitioning `transform`
                     would leave the press instant. */
                  className={`relative flex size-16 items-center justify-center rounded-full border hairline bg-surface/40 transition-[border-color,scale] duration-500 ${EXPO} group-hover:border-accent group-active:scale-95`}
                >
                  {glyph ? (
                    <>
                      {/* The plate. */}
                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden
                        className="size-6 fill-muted transition-colors duration-500"
                      >
                        <path d={glyph} />
                      </svg>
                      {/* The ink. Clipped to nothing from the top down, so
                          retracting the inset fills the glyph upwards. */}
                      <span
                        aria-hidden
                        className={`absolute inset-0 flex items-center justify-center [clip-path:inset(100%_0_0_0)] transition-[clip-path] duration-[650ms] ${EXPO} group-hover:[clip-path:inset(0_0_0_0)]`}
                      >
                        <svg viewBox="0 0 24 24" className="size-6 fill-accent">
                          <path d={glyph} />
                        </svg>
                      </span>
                    </>
                  ) : (
                    <span lang="en" className="microlabel">{social.label.slice(0, 2)}</span>
                  )}
                </span>
                <span
                  lang="en"
                  className="microlabel transition-colors duration-500 group-hover:text-accent"
                >
                  {social.label}
                </span>
              </a>
            </Magnetic>
          </li>
        );
      })}
    </ul>
  );
}
