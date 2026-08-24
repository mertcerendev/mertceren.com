"use client";

import { socials } from "@/lib/data";
import { Magnetic } from "@/components/ui/magnetic-button";

/**
 * Brand marks, official paths from simple-icons. Keyed by the `label` in
 * `socials` — add a network there and it needs its glyph here, or it falls
 * back to reading as text.
 */
const GLYPHS: Record<string, string> = {
  GitHub:
    "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
  LinkedIn:
    "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
};

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
