/**
 * Works out which page a mistyped address was probably after, for the 404.
 *
 * Every candidate carries the words someone might type for it — the slug or
 * section id, its English name, and its Turkish one — so /iletisim finds the
 * contact section as readily as /contatc does. Comparison is done on a folded
 * form (lowercase, Turkish letters to their ASCII neighbours, separators
 * dropped), because nobody types "ş" into a URL bar on purpose.
 */

export type RouteCandidate = {
  /** Locale-free path, as localePath() expects it. */
  path: string;
  label: string;
  keys: string[];
};

const FOLD: Record<string, string> = {
  ç: "c",
  ğ: "g",
  ı: "i",
  İ: "i",
  ö: "o",
  ş: "s",
  ü: "u",
};

function fold(value: string): string {
  return value
    .toLocaleLowerCase("tr")
    .replace(/[çğıİöşü]/g, (ch) => FOLD[ch] ?? ch)
    .replace(/[^a-z0-9]/g, "");
}

function distance(a: string, b: string): number {
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) {
      row[j] = Math.min(
        prev[j] + 1,
        row[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    prev = row;
  }
  return prev[b.length];
}

/**
 * The best candidate for `pathname`, or null when nothing is close enough to
 * be worth offering — a wrong suggestion on an error page is worse than none.
 *
 * The whole path is tried, and so is its last segment on its own, so
 * /work/smart-road finds the case study through "smart-road". Not the other
 * segments: "work" in that address would match the index page exactly and
 * outrank the case study it was clearly heading for. A typed fragment that a
 * key starts with counts too, because people stop typing early.
 */
export function suggestRoute(
  pathname: string,
  candidates: RouteCandidate[]
): RouteCandidate | null {
  const segments = pathname
    .split("/")
    .map((s) => {
      try {
        return decodeURIComponent(s);
      } catch {
        return s;
      }
    })
    .filter(Boolean);
  // The locale prefix, when there is one, is not part of what was typed for.
  if (segments[0] === "tr" || segments[0] === "en") segments.shift();
  if (!segments.length) return null;

  const queries = [...new Set([segments.join(""), segments.at(-1) ?? ""].map(fold))].filter(
    (q) => q.length >= 2
  );

  let best: { candidate: RouteCandidate; score: number } | null = null;
  for (const candidate of candidates) {
    for (const raw of candidate.keys) {
      const key = fold(raw);
      for (const q of queries) {
        let score: number;
        if (q === key) score = 0;
        else if (q.length >= 3 && key.startsWith(q)) score = 0.1;
        else {
          const d = distance(q, key);
          // About one slip in three letters, and never fewer than one.
          if (d > Math.max(1, Math.floor(key.length / 3))) continue;
          score = d / key.length;
        }
        if (!best || score < best.score) best = { candidate, score };
      }
    }
  }
  return best?.candidate ?? null;
}
