/**
 * CSS `text-transform: uppercase` is locale-aware, and these pages are
 * `lang="tr"`. The Turkish rule maps `i` to `İ` — right for Turkish words
 * (SERTİFİKALAR, İLETİŞİM, GELİŞTİRME) and wrong for every English one, which
 * is how the site came to render GİTHUB, LİNKEDIN, TOOLİNG and POWERPOİNT.
 *
 * The fix is to say which runs are not Turkish. Where a whole element holds
 * English — the discipline chips, the tech marquee — put `lang="en"` on it
 * directly and skip this file. These helpers are for the cases where English
 * sits inside Turkish: a brand in a sentence, or one English entry in a list
 * of Turkish ones.
 */

/* The terms that actually appear inside Turkish content, longest first so
   GitHub is matched before Git. Only terms carrying a lowercase `i` can
   render wrong, but a few neighbours are listed for consistency. */
const FOREIGN_TERMS = [
  "AI-Assisted Development",
  "Photo Sphere Viewer",
  "Prompt Engineering",
  "Object Detection",
  "Computer Vision",
  "Professional",
  "PowerPoint",
  "LinkedIn",
  "Tooling",
  "GitHub",
  "Gemini",
  "public",
  "Git",
];

const PATTERN = new RegExp(`(${FOREIGN_TERMS.join("|")})`, "g");

/**
 * `lang` for an element whose entire label is one English term, `undefined`
 * for anything else. For lists that mix the two — nav items, project tags —
 * where each entry already has an element of its own.
 */
export function foreignLang(text: string): "en" | undefined {
  return FOREIGN_TERMS.includes(text.trim()) ? "en" : undefined;
}

/**
 * Marks the English runs inside a Turkish string. Note that each match
 * becomes an element: inside a flex container the parts would turn into
 * separate flex items and the whitespace between them would be dropped, so
 * wrap this in a single span when the parent is a flex row.
 */
export function Foreign({ text }: { text: string }) {
  const parts = text.split(PATTERN);
  if (parts.length === 1) return <>{text}</>;

  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} lang="en">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
}
