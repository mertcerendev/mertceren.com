# Mert Ceren — Portfolio

A cinematic, editorial portfolio built from scratch. Dark-first with a light mode, smooth-scroll storytelling, and a sticky-stacked project showcase. Bilingual: Turkish at the root, English under `/en`.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Motion · Lenis · next-themes

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npx tsc --noEmit # the gate CI runs before the build
```

Pages are prerendered, apart from the 404 catch-all and the two API routes,
which run per request. The home page revalidates hourly so the GitHub figures
stay current.

## Environment

Both keys are read on the server at request time, never during the build, so
the site builds and deploys without them — the two features degrade instead
of breaking.

| Variable | Feature | Without it |
| --- | --- | --- |
| `GROQ_API_KEY` | The AI assistant | Falls back to the scripted answers in `lib/ai-knowledge.ts` |
| `RESEND_API_KEY` | The contact form | The form shows the email address instead |

**Setting up Resend:** sign up with the same address as `profile.email` in
`lib/data.ts`. Until a domain is verified, Resend sends from
`onboarding@resend.dev`, and that sender [may only deliver to the account
holder's own address](https://resend.com/docs/knowledge-base/403-error-resend-dev-domain)
— sign up with anything else and every send is rejected with a 403.

## Editing your content

Content lives in two mirrored files — [`lib/data.ts`](lib/data.ts) is English
and the source of the `Ui` type, [`lib/data.tr.ts`](lib/data.tr.ts) is Turkish
and must satisfy it. Add a key to one and TypeScript will demand it in the
other, which is what keeps the two languages from drifting apart.
[`lib/content.ts`](lib/content.ts) picks between them per locale.

- `profile` — name, role, location, email, availability
- `heroStatement` — the big hero lines and subline
- `projects` — the project cards + case studies (title, description, tags, `palette` colors, screenshot). The palette also colors the generated social card for that project.
- `experience` — the timeline entries in the about section
- `skillTiers` / `techMarquee` — the skills grid and marquee
- `certificates` — the certificate wall; counts derive from the array's length, so nothing needs updating by hand when one is added
- `awards` / `awardsGallery` — the awards section and its photo strip
- `featuredRepos` — the curated fallback shown when the GitHub API cannot be reached
- `socials`, `site` — links and SEO metadata

**Replacing the CV:** drop the new PDF and one preview JPG per page into `public/`, then
bump [`lib/cv-version.ts`](lib/cv-version.ts). That string is both the PDF's
cache-busting query and the JPG's filename suffix; without bumping it, visitors
keep being served the old one from cache.

Facts the AI assistant answers from live separately in
[`lib/ai-knowledge.ts`](lib/ai-knowledge.ts), alongside the system prompt in
[`app/api/chat/route.ts`](app/api/chat/route.ts). Change a fact on the page and
change it there too, or the chatbot will keep telling visitors the old one.

## Design system

Design tokens (colors for both themes, fluid type scale, fonts) are defined in [`app/globals.css`](app/globals.css). Typography: Syne (display) · Inter (body) · JetBrains Mono (labels).

## Structure

```
proxy.ts        maps the locale-less Turkish URLs onto /tr
app/
  [lang]/       layout, home page, case studies, 404
  api/          chat, contact
  opengraph-image.tsx, icon.tsx, sitemap.ts, robots.ts, globals.css
components/
  providers/    theme, locale, Lenis smooth scroll
  layout/       header, footer, theme toggle, language toggle
  sections/     hero, works, about, skills, github, certificates, awards, contact
  ui/           reveal text, magnetic button, project card, marquee, …
lib/            data.ts + data.tr.ts (content), content.ts, ai-knowledge.ts,
                github.ts, og.ts, hooks, utils
```

Turkish has no URL prefix and English sits under `/en`, so `proxy.ts` rewrites
the bare paths onto the `[lang]` segment — a rewrite rather than a redirect, so
the clean URL is what the visitor sees. Turkish used to live under `/tr`, and
those old paths still 308 to the root form so shared links survive.

Animations run for all visitors by design (`prefers-reduced-motion` is intentionally not honored); only `transform`/`opacity` are animated for 60fps.
