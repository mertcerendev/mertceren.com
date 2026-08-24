"use client";

import { useRef } from "react";
import { useLenis } from "lenis/react";
import { socials } from "@/lib/data";
import { useContent } from "@/components/providers/locale-provider";
import { useLocalTime } from "@/lib/hooks/use-local-time";

/* Shared by both copies of the wordmark so the lit one lands exactly over
   the base — they differ only in what fills the clipped text. */
const MARK =
  "translate-y-[14%] select-none whitespace-nowrap bg-clip-text text-center font-display text-[15.5vw] font-extrabold uppercase leading-[0.8] tracking-tight text-transparent";

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
    <footer className="border-t hairline px-5 pt-10 sm:px-8 lg:px-12">
      <div className="flex flex-wrap items-baseline justify-between gap-x-10 gap-y-4">
        <p className="microlabel">
          © {new Date().getFullYear()} {profile.name} — {ui.footer.built}
        </p>
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
