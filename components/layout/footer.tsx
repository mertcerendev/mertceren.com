"use client";

import { useRef } from "react";
import { useLenis } from "lenis/react";
import { socials } from "@/lib/data";
import { useContent } from "@/components/providers/locale-provider";
import { useLocalTime } from "@/lib/hooks/use-local-time";

/* Read off package.json rather than aspiration: next, typescript and
   tailwindcss are dependencies, @vercel/analytics names the host. The line
   sits under the "no template" claim beside it and is the receipt for it. */
const STACK = ["Next.js", "TypeScript", "Tailwind", "Vercel"];

/* Both copies of the wordmark, so the lit one lands exactly over the base. */
const MARK =
  "translate-y-[14%] select-none whitespace-nowrap bg-clip-text text-center font-display text-[15.5vw] font-extrabold uppercase leading-[0.8] tracking-tight text-transparent";

const EASE = "ease-[cubic-bezier(0.16,1,0.3,1)]";

export function Footer() {
  const lenis = useLenis();
  const { profile, ui } = useContent();
  const time = useLocalTime(profile.timezone);
  const litRef = useRef<HTMLParagraphElement>(null);

  const backToTop = () => {
    if (lenis) lenis.scrollTo(0, { duration: 1.4 });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* Written straight onto the node instead of through state: this fires on
     every mousemove and a setState per frame would re-render the whole
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
    <footer className="border-t hairline px-5 pt-10 sm:px-8 lg:px-12">
      {/* The two things worth acting on. Above the meta row and a size up
          from it, because a case study or /work has no contact section of
          its own — before this, the bottom of a shared project link was two
          social links and nothing else. */}
      <div className="flex flex-col gap-5 pb-9 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
        {profile.available && (
          <p className="flex items-center gap-2.5 font-mono text-xs tracking-tight text-foreground sm:text-sm">
            <span className="relative flex size-2 shrink-0">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-accent" />
            </span>
            {profile.availabilityNote}
          </p>
        )}

        <a
          href={`mailto:${profile.email}`}
          className={`tap-target group inline-flex items-center gap-2 self-start font-mono text-sm tracking-tight text-foreground sm:self-auto sm:text-base`}
        >
          {/* 1.5em of headroom, not the 1.15 the social labels use: the
              address has a descending g and a tighter box clipped it. */}
          <span className="relative block h-[1.5em] overflow-hidden">
            <span
              className={`block leading-[1.5] transition-transform duration-500 ${EASE} group-hover:-translate-y-full`}
            >
              {profile.email}
            </span>
            <span
              aria-hidden
              className={`absolute inset-0 block translate-y-full leading-[1.5] text-accent transition-transform duration-500 ${EASE} group-hover:translate-y-0`}
            >
              {profile.email}
            </span>
          </span>
          <span
            aria-hidden
            className={`transition-[translate,color] duration-500 ${EASE} group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent`}
          >
            ↗
          </span>
        </a>
      </div>

      <div className="flex flex-wrap items-baseline justify-between gap-x-10 gap-y-4 border-t hairline pt-7">
        {/* Colophon stacked under the credit rather than added to the row:
            five items in one justify-between line wrap into gaps that read
            as a mistake, and the build note is what it belongs beside. */}
        <div className="flex flex-col gap-1.5">
          <p className="microlabel">
            © {new Date().getFullYear()} {profile.name} — {ui.footer.built}
          </p>
          {/* lang, because CSS uppercase is locale-aware and the page is
              Turkish: without it `i` maps to `İ` and the brands read
              TYPESCRİPT and TAİLWİND. opacity rather than a dimmer text
              colour — .microlabel is unlayered CSS in globals, so a
              text-muted/60 utility loses to it and silently does nothing. */}
          <p lang="en" className="microlabel opacity-60">
            {STACK.join(" · ")}
          </p>
        </div>
        <p className="microlabel tabular-nums" suppressHydrationWarning>
          {profile.location}
          {time ? ` — ${time}` : ""}
        </p>
        <ul className="flex items-center gap-5">
          {socials.map((social) => (
            <li key={social.label}>
              {/* The label rolls over to an accent copy of itself while the
                  arrow steps out after it. Kept to transforms and colour so
                  the row never reflows, and no icons — the footer is a line
                  of microlabels and a mark here would outweigh everything
                  beside it. */}
              <a
                href={social.href}
                lang="en"
                target="_blank"
                rel="noopener noreferrer"
                className="microlabel tap-target group inline-flex items-center gap-1.5"
              >
                <span className="relative block h-[1.15em] overflow-hidden">
                  <span className="block transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-full">
                    {social.label}
                  </span>
                  <span
                    aria-hidden
                    className="absolute inset-0 block translate-y-full text-accent transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0"
                  >
                    {social.label}
                  </span>
                </span>
                <span
                  aria-hidden
                  /* `translate`, not `transform`: Tailwind v4's translate-*
                     utilities set the standalone property, so naming
                     `transform` here transitions nothing and the arrow
                     jumps. `transition-transform` happens to cover both,
                     but this list is explicit and has to say so. */
                  className="transition-[translate,color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent"
                >
                  ↗
                </span>
              </a>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={backToTop}
          className="microlabel tap-target transition-colors duration-300 hover:text-accent"
        >
          {ui.footer.backToTop}
        </button>
      </div>

      {/* Cropped wordmark, lit by the pointer. It was 6% ink and purely
          decorative — a whole band of the page doing nothing. A second copy
          on top carries a radial gradient that follows the cursor, so the
          name reads only where the light falls, like a torch on a wall.
          Mouse only: there is no pointer to follow on a phone, and the
          overlay stays at zero there. `--foreground`, not
          `--color-foreground` — @theme inline does not emit the latter. */}
      <div
        aria-hidden
        onPointerMove={trackLight}
        onPointerLeave={dropLight}
        className="relative mt-8 overflow-hidden"
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
  );
}
