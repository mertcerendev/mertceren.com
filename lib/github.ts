/**
 * Live figures for the GitHub section.
 *
 * The section has always been headed "live data from @mertcerendev" while the
 * numbers under it were typed by hand. This closes that gap: the language
 * split, the per-repository stack and the counts are read from the public
 * GitHub API at build time and refreshed hourly by ISR.
 *
 * What stays hand-written is the *selection* — which three repositories are
 * featured, and the sentence describing each. Sorting by last push puts
 * scratch repositories on the front page, and most repositories here carry
 * no GitHub description at all, so those two things are editorial by
 * necessity. Everything factual around them is live.
 *
 * Server-only — it runs from a Server Component and is never imported into
 * a client bundle.
 */

import { featuredRepos } from "./data";

const USER = "mertcerendev";
const API = "https://api.github.com";

/**
 * Refreshed hourly, matching the page's ISR window. That window has to be a
 * literal in app/[lang]/page.tsx — Next reads segment config statically —
 * so the two are kept in step by hand.
 */
const GITHUB_REVALIDATE_SECONDS = 3600;

/**
 * Unauthenticated GitHub allows 60 requests an hour per IP and the language
 * breakdown costs one request per repository, so the walk is capped well
 * inside that. Repositories come back sorted by last push, so the cap drops
 * the least active ones — which is what you would drop by hand anyway.
 */
const MAX_REPOS_TO_INSPECT = 12;

/** How many languages the bar chart shows. */
const MAX_LANGUAGES = 4;


/**
 * Presentation for the languages we expect to see. The bar colour and the
 * one-line note are editorial — GitHub only reports byte counts — so a
 * language without an entry here falls back to a neutral bar and its own
 * name.
 */
const LANGUAGE_STYLE: Record<string, { color: string; note: string }> = {
  TypeScript: { color: "bg-amber-400", note: "AI-assisted web development" },
  JavaScript: { color: "bg-yellow-400", note: "Web platforms & tooling" },
  "C#": { color: "bg-blue-500", note: "Object-oriented programming" },
  Python: { color: "bg-accent", note: "YOLOv11, computer vision" },
  HTML: { color: "bg-orange-400", note: "Markup & templating" },
  CSS: { color: "bg-sky-400", note: "Styling & responsive layout" },
  Jupyter: { color: "bg-fuchsia-400", note: "Model training notebooks" },
  Dart: { color: "bg-cyan-400", note: "Flutter mobile interfaces" },
  Kotlin: { color: "bg-violet-400", note: "Android application code" },
  PLpgSQL: { color: "bg-emerald-400", note: "Relational Schemas & Query Optimization" },
};

const FALLBACK_STYLE = { color: "bg-foreground/40", note: "" };

export type LanguageSlice = {
  name: string;
  percentage: number;
  note: string;
  color: string;
};

/** Live facts about one featured repository, keyed by its GitHub name. */
export type RepoFacts = {
  /** Primary language, i.e. the one with the most bytes. */
  badge: string;
  /** Top two languages, joined — "HTML / C#". */
  stack: string;
  url: string;
};

export type GithubStats = {
  languages: LanguageSlice[];
  repoFacts: Record<string, RepoFacts>;
  publicRepos: number;
  /** ISO timestamp of the most recent push across the inspected repos. */
  lastPush: string | null;
  /** The repository that push went to. */
  lastPushRepo: string | null;
};

type ApiRepo = {
  name: string;
  html_url: string;
  fork: boolean;
  archived: boolean;
  pushed_at: string;
  languages_url: string;
};

async function getJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        // GitHub rejects requests without one.
        "User-Agent": "mertceren.com-portfolio",
      },
      next: { revalidate: GITHUB_REVALIDATE_SECONDS },
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    // Rate limit, outage, offline build — every one of them is handled the
    // same way: the caller falls back to the hand-written figures.
    return null;
  }
}

/** Jupyter Notebook is the only name long enough to break the bar layout. */
function shortLanguageName(name: string) {
  return name === "Jupyter Notebook" ? "Jupyter" : name;
}

/**
 * Repository names with no match on GitHub are simply absent from
 * `repoFacts`, and the component keeps its written-in values for those.
 *
 * Returns null whenever the API cannot be reached or answers with nothing
 * usable. Callers must treat null as "show the curated figures instead" — a
 * portfolio that renders an empty chart is worse than one that renders a
 * slightly stale hand-written one.
 */
export async function getGithubStats(): Promise<GithubStats | null> {
  const repos = await getJson<ApiRepo[]>(
    `${API}/users/${USER}/repos?per_page=100&sort=pushed&direction=desc`
  );
  if (!repos?.length) return null;

  const own = repos.filter((repo) => !repo.fork && !repo.archived);
  if (!own.length) return null;

  // Everything the featured cards need, plus the most recently pushed
  // repositories for the chart — deduplicated so a featured repository that
  // is also recent is not fetched twice.
  const wanted = new Map<string, ApiRepo>();
  for (const repo of own.slice(0, MAX_REPOS_TO_INSPECT)) wanted.set(repo.name, repo);
  for (const name of featuredRepos) {
    const match = own.find((repo) => repo.name === name);
    if (match) wanted.set(match.name, match);
  }

  const inspected = [...wanted.values()];
  const byteCounts = await Promise.all(
    inspected.map(async (repo) => ({
      repo,
      counts: await getJson<Record<string, number>>(repo.languages_url),
    }))
  );

  const totals = new Map<string, number>();
  const repoFacts: Record<string, RepoFacts> = {};

  for (const { repo, counts } of byteCounts) {
    if (!counts) continue;

    for (const [language, bytes] of Object.entries(counts)) {
      totals.set(language, (totals.get(language) ?? 0) + bytes);
    }

    if ((featuredRepos as readonly string[]).includes(repo.name)) {
      const ranked = Object.entries(counts)
        .sort(([, a], [, b]) => b - a)
        .map(([name]) => shortLanguageName(name));
      if (ranked.length) {
        repoFacts[repo.name] = {
          badge: ranked[0],
          stack: ranked.slice(0, 2).join(" / "),
          url: repo.html_url,
        };
      }
    }
  }

  const top = [...totals.entries()]
    .sort(([, a], [, b]) => b - a)
    .slice(0, MAX_LANGUAGES);
  if (!top.length) return null;

  // Percentages are taken against the top slice, not the grand total, so the
  // bars add up to 100 and the chart does not silently lose a remainder.
  const shownTotal = top.reduce((sum, [, bytes]) => sum + bytes, 0);

  const languages: LanguageSlice[] = top.map(([name, bytes]) => {
    const short = shortLanguageName(name);
    const style = LANGUAGE_STYLE[short] ?? FALLBACK_STYLE;
    return {
      name: short,
      percentage: Math.round((bytes / shownTotal) * 100),
      note: style.note || short,
      color: style.color,
    };
  });

  return {
    languages,
    repoFacts,
    publicRepos: own.length,
    lastPush: own[0]?.pushed_at ?? null,
    lastPushRepo: own[0]?.name ?? null,
  };
}
