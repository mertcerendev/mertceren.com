"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLenis } from "lenis/react";
import { socials } from "@/lib/data";
import { GLYPHS } from "@/lib/brand-glyphs";
import { cvVersion } from "@/lib/cv-version";
import { localePath } from "@/lib/content";
import { foreignLang } from "@/lib/foreign";
import { useContent, useLocale } from "@/components/providers/locale-provider";
import { useLocalTime } from "@/lib/hooks/use-local-time";
import { onRewind, onRewindEnd, startRewind } from "@/lib/rewind";
import { BalloonChick } from "@/components/ui/rewind";

/* Shared by both copies of the wordmark so the lit one lands exactly over
   the base — they differ only in what fills the clipped text. */
const MARK =
  "translate-y-[14%] select-none whitespace-nowrap bg-clip-text text-center font-display text-[15.5vw] font-extrabold uppercase leading-[0.8] tracking-tight text-transparent";

const LINK =
  "microlabel tap-target inline-flex items-center gap-2 text-foreground/80 transition-colors duration-300 hover:text-accent";

export function Footer() {
  const lenis = useLenis();
  const locale = useLocale();
  const { navItems, profile, projects, ui } = useContent();
  const time = useLocalTime(profile.timezone);
  const litRef = useRef<HTMLParagraphElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const home = localePath(locale, "/");

  /* What he is probably up to, by the hour where he is. Read off the same
     clock string the line already prints, so the two can never disagree, and
     empty until that clock has mounted. */
  const hour = time ? Number(time.slice(0, 2)) : null;
  const mood =
    hour === null
      ? null
      : ui.footer.moods.findLast((m) => hour >= m.from)?.text ?? null;

  /**
   * Curtain reveal: the page lifts off the footer rather than scrolling it
   * into view. The footer is pinned to the bottom of the viewport inside a
   * box of its own height, and the box's clip-path — which, unlike overflow,
   * does clip fixed descendants — shows only as much of it as the box has
   * scrolled into view. The wordmark at the bottom arrives first, and the
   * rows above it are uncovered as the page goes.
   *
   * Only when the footer fits the screen. Pinned to the bottom, a footer
   * taller than the viewport would have its top cut off for good, so a short
   * phone gets it scrolling in normally. That is also the server render and
   * the first paint: the reveal switches on once the height is measured.
   */
  const [revealHeight, setRevealHeight] = useState<number | null>(null);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;
    const measure = () => {
      const height = footer.offsetHeight;
      // Zero means not laid out — mid-refresh, or an ancestor hidden — not
      // a footer with no height. Taking it would size the box to nothing
      // and clip the footer away for good.
      setRevealHeight(height > 0 && height <= window.innerHeight ? height : null);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(footer);
    window.addEventListener("resize", measure, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  /* The way back up is a rewind (components/ui/rewind.tsx). Two things
     here take part in it: the wordmark lifts off as it starts, and the
     balloon chick leaves its post for the flight. Both come back when it
     ends, by which time the page has long covered the footer again. */
  const [lifting, setLifting] = useState(false);
  const [chickAway, setChickAway] = useState(false);
  useEffect(() => {
    const offStart = onRewind(({ source }) => {
      if (source === "wordmark") setLifting(true);
      if (source === "chick") setChickAway(true);
    });
    const offEnd = onRewindEnd(() => {
      setLifting(false);
      setChickAway(false);
    });
    return () => {
      offStart();
      offEnd();
    };
  }, []);

  const rideBalloon = (e: React.MouseEvent<HTMLButtonElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    startRewind({
      source: "chick",
      from: { x: box.left + box.width / 2, y: box.top + box.height / 2 },
    });
  };

  /* On the home page the sections are right here, so the link scrolls to
     one through Lenis as the header's do. Anywhere else the href already
     leads home with the section in the hash, and the browser follows it. */
  const goToSection = (e: React.MouseEvent, hash: string) => {
    const target = document.querySelector(hash);
    if (!target) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(hash, { duration: 1.2 });
    else target.scrollIntoView({ behavior: "smooth" });
  };

  /* Written straight onto the node instead of through state: this fires on
     every mousemove, and a setState per frame would re-render the whole
     footer to move a gradient the compositor can move on its own. */
  const trackLight = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = litRef.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${((e.clientX - box.left) / box.width) * 100}%`);
    el.style.setProperty("--my", `${((e.clientY - box.top) / box.height) * 100}%`);
    el.style.opacity = "1";
  };

  const dropLight = () => {
    if (litRef.current) litRef.current.style.opacity = "0";
  };

  return (
    <div
      data-site-footer
      className="relative"
      style={
        revealHeight === null
          ? undefined
          : { height: revealHeight, clipPath: "inset(0 0 0 0)" }
      }
    >
      {/* The edge of the lifting page: a shadow it casts on the footer
          below, riding on the box rather than the pinned footer, so it is
          always exactly where the page ends. Without it a half-uncovered row
          read as text cut in half rather than as something underneath. */}
      {revealHeight !== null && (
        <div
          aria-hidden
          /* The hairline is what carries it in the dark theme: there the
             surface is only a few levels off the page and a black shadow
             on near-black has nothing to darken. */
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 border-t hairline bg-gradient-to-b from-black/[0.07] to-transparent dark:from-black/40"
        />
      )}
      <div className={revealHeight === null ? undefined : "fixed inset-x-0 bottom-0"}>
        {/* A shade off the page — surface, not background — so the layer
            the page lifts away from reads as a different sheet. */}
        <footer
          ref={footerRef}
          className="border-t hairline bg-surface px-5 pt-12 sm:px-8 lg:px-12"
        >
          {/* Status: whether he is free, and where and when he is. One line
              across the top rather than a column of its own — squeezed in
              beside three link columns it broke every one of its lines in
              two, and stacked it was the tallest thing in the footer. */}
          <div className="mb-10 flex flex-wrap items-center gap-x-8 gap-y-3">
            {profile.available && (
              <p className="microlabel flex items-center gap-2 text-foreground">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" />
                  <span className="relative inline-flex size-2 rounded-full bg-accent" />
                </span>
                {profile.availabilityNote}
              </p>
            )}
            <p className="microlabel tabular-nums" suppressHydrationWarning>
              {profile.location}
              {time ? ` — ${time}` : ""}
            </p>
            <p className="microlabel min-h-[1.2em] text-foreground/80">
              {mood ?? " "}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-[1.6fr_1fr_1fr]">
            <nav aria-label={ui.footer.pages}>
              <p className="microlabel mb-4 text-accent">{ui.footer.pages}</p>
              {/* Two columns: seven links in one made this the tallest
                  column by two rows, and every row here is a row the page
                  has to lift before the footer is uncovered — on a case
                  study it pushed the next-project title off the screen at
                  the very point the pull past the end asks you to look. */}
              <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <a
                      href={`${home}${item.href}`}
                      lang={foreignLang(item.label)}
                      onClick={(e) => goToSection(e, item.href)}
                      className={LINK}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div>
              <p className="microlabel mb-4 text-accent">{ui.footer.projects}</p>
              <ul className="space-y-2.5">
                {projects.map((project) => (
                  <li key={project.slug}>
                    <Link href={localePath(locale, `/work/${project.slug}`)} className={LINK}>
                      {project.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <p className="microlabel mb-4 text-accent">{ui.footer.links}</p>
              <ul className="space-y-2.5">
                {socials.map((social) => {
                  const glyph = GLYPHS[social.label];
                  return (
                    <li key={social.label}>
                      <a
                        href={social.href}
                        /* CSS uppercase is locale-aware and these pages are
                           lang="tr", so the Turkish rule mapped i to İ and
                           the row rendered GİTHUB and LİNKEDIN. The labels
                           are English brand names; saying so is the fix. */
                        lang="en"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${LINK} group`}
                      >
                        {glyph && (
                          <svg viewBox="0 0 24 24" aria-hidden className="size-3.5 shrink-0 fill-current">
                            <path d={glyph} />
                          </svg>
                        )}
                        {social.label}
                        <span
                          aria-hidden
                          /* `translate`, not `transform`: Tailwind v4's
                             translate-* utilities set the standalone
                             property, so naming `transform` here would
                             transition nothing and the arrow would jump. */
                          className="transition-[translate] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        >
                          ↗
                        </span>
                      </a>
                    </li>
                  );
                })}
                <li>
                  <a href={`mailto:${profile.email}`} className={LINK}>
                    <svg viewBox="0 0 24 24" aria-hidden className="size-3.5 shrink-0 fill-none stroke-current" strokeWidth={2}>
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="m3.5 6.5 8.5 6.5 8.5-6.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {ui.footer.email}
                  </a>
                </li>
                <li>
                  <a
                    href={`/Mert_Ceren_CV.pdf?v=${cvVersion}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={LINK}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden className="size-3.5 shrink-0 fill-none stroke-current" strokeWidth={2}>
                      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" strokeLinejoin="round" />
                      <path d="M14 3v5h5M9 13h6M9 17h4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {ui.footer.cv}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t hairline pt-6">
            <p className="microlabel">
              © {new Date().getFullYear()} {profile.name}
            </p>
            <div className="flex items-center gap-5">
              {/* The chick that went off duty with the header, waiting down
                  here with a balloon. Takes you up with it. */}
              <button
                type="button"
                onClick={rideBalloon}
                aria-label={ui.rewind.chick}
                title={ui.rewind.chick}
                className={`tap-target -my-3 transition-[opacity,scale] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-110 ${
                  chickAway ? "opacity-0" : "animate-[balloon-bob_3.2s_ease-in-out_infinite]"
                }`}
              >
                <BalloonChick />
              </button>
              <button
                type="button"
                onClick={() => startRewind({ source: "button" })}
                className="microlabel tap-target transition-colors duration-300 hover:text-accent"
              >
                {ui.footer.backToTop}
              </button>
            </div>
          </div>

          {/* Cropped wordmark, lit by the pointer. It was 6% ink and purely
              decorative — a whole band of the page doing nothing. A second
              copy on top carries a radial gradient that follows the cursor,
              so the name reads only where the light falls, like a torch on a
              wall. Mouse only: there is no pointer to follow on a phone, and
              the overlay stays at zero there. `--foreground`, not
              `--color-foreground` — @theme inline does not emit the latter. */}
          {/* Clicking it rewinds too, and the name lifts off the bottom of
              the page on its way to the top — where the hero's own name rises
              into place as the reel runs out. Not a button of its own: the
              Rewind button above is the accessible way to the same thing, and
              this stays the decoration it was, with one more thing to find. */}
          <div
            aria-hidden
            onPointerMove={trackLight}
            onPointerLeave={dropLight}
            onClick={() => startRewind({ source: "wordmark" })}
            className={`relative mt-8 cursor-pointer overflow-hidden transition-[translate,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              lifting ? "-translate-y-1/2 opacity-0" : ""
            }`}
          >
            <p className={`${MARK} bg-foreground/[0.06]`}>{profile.name}</p>
            <p
              ref={litRef}
              style={{
                opacity: 0,
                backgroundImage:
                  "radial-gradient(13vw circle at var(--mx, 50%) var(--my, 50%), color-mix(in oklab, var(--foreground) 42%, transparent) 0%, transparent 72%)",
              }}
              className={`${MARK} absolute left-0 top-0 w-full transition-opacity duration-700 ease-out`}
            >
              {profile.name}
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
