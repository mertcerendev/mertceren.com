"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { useContent, useLocale } from "@/components/providers/locale-provider";
import { localePath } from "@/lib/content";
import { suggestRoute, type RouteCandidate } from "@/lib/suggest-route";

// not-found receives no params, so the locale comes from the provider the
// layout already feeds with params.lang — right on the server render, with no
// flash. Reading it from the request headers instead opts every route under
// app/[lang] into dynamic rendering, which costs the whole site its
// prerendered HTML for the sake of one error page.
export default function NotFound() {
  const locale = useLocale();
  const pathname = usePathname();
  const { ui, projects } = useContent();

  /* Everything an address on this site can lead to: the index, each case
     study, and the home page's sections — which have no address of their
     own but are what someone typing /contact or /iletisim is after. The
     labels are the ones the page itself prints, so the suggestion reads the
     way the destination does. */
  const s = ui.sections;
  const candidates: RouteCandidate[] = [
    { path: "/work", label: s.work.label, keys: ["work", "works", "projects", "projeler", "portfolio"] },
    ...projects.map((p) => ({
      path: `/work/${p.slug}`,
      label: p.title,
      keys: [p.slug, `work/${p.slug}`, p.title],
    })),
    { path: "/#about", label: s.about.label, keys: ["about", "hakkimda", "experience", "deneyim"] },
    { path: "/#skills", label: s.skills.label, keys: ["skills", "yetenekler", "stack"] },
    { path: "/#awards", label: s.awards.label, keys: ["awards", "oduller", "teknofest"] },
    { path: "/#certificates", label: s.certificates.label, keys: ["certificates", "sertifikalar", "certs"] },
    { path: "/#github", label: s.github.label, keys: ["github", "code", "repos"] },
    { path: "/#contact", label: s.contact.label, keys: ["contact", "iletisim", "mail", "email", "hire", "cv", "resume", "ozgecmis"] },
  ];
  const suggestion = pathname ? suggestRoute(pathname, candidates) : null;
  // localePath on the path alone, with the fragment put back after: for
  // English it would otherwise produce /en/#contact rather than /en#contact.
  const [suggestionPath, suggestionHash] = suggestion?.path.split("#") ?? [];
  const suggestionHref = suggestion
    ? `${localePath(locale, suggestionPath)}${suggestionHash ? `#${suggestionHash}` : ""}`
    : null;

  return (
    <>
      <Header />
      <main
        id="main"
        className="flex min-h-svh flex-col items-center justify-center px-5 text-center"
      >
        <p className="microlabel">
          404
          <span className="mx-3 select-none" aria-hidden>
            —
          </span>
          {ui.notFound.kicker}
        </p>
        <h1 className="mt-6 font-display text-display-xl font-extrabold uppercase leading-[0.95] tracking-tight">
          {ui.notFound.titleA}
          <br />
          {ui.notFound.titleB}<span className="text-accent">.</span>
        </h1>
        <p className="mt-6 max-w-md text-sm leading-relaxed text-muted sm:text-base">
          {ui.notFound.body}
        </p>

        {suggestion && suggestionHref && (
          <div className="mt-10 flex flex-col items-center gap-3">
            <p className="microlabel">{ui.notFound.suggest}</p>
            <Link
              href={suggestionHref}
              className="group inline-flex items-baseline gap-3 rounded-full border border-accent px-6 py-3 transition-colors duration-300 hover:bg-accent hover:text-accent-ink"
            >
              <span className="font-display text-base font-bold">{suggestion.label}</span>
              <span className="font-mono text-[0.6875rem] text-muted transition-colors duration-300 group-hover:text-accent-ink">
                {suggestionHref}
              </span>
            </Link>
          </div>
        )}

        <Link
          href={localePath(locale, "/")}
          className={`${suggestion ? "mt-6" : "mt-10"} inline-flex items-center gap-2 rounded-full border hairline px-6 py-3 font-mono text-[0.6875rem] uppercase tracking-[0.14em] transition-colors duration-300 hover:border-accent hover:bg-accent hover:text-accent-ink`}
        >
          {ui.notFound.cta}
        </Link>
      </main>
    </>
  );
}
