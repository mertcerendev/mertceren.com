"use client";

import { useEffect, useState } from "react";

/** Largest first: the first unit the gap is at least one of is the one used. */
const UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ["year", 31_536_000],
  ["month", 2_592_000],
  ["week", 604_800],
  ["day", 86_400],
  ["hour", 3_600],
  ["minute", 60],
];

/**
 * "2 hours ago" / "2 saat önce" for an ISO timestamp, kept current.
 *
 * Empty until mounted, the same as useLocalTime: the page is prerendered and
 * served for up to an hour, so a phrase worked out on the server would be
 * that much out of date by the time anyone read it — and would disagree with
 * the browser's own clock on hydration.
 */
export function useRelativeTime(iso: string | null | undefined, locale: string) {
  const [label, setLabel] = useState("");

  useEffect(() => {
    if (!iso) return;
    const then = new Date(iso).getTime();
    if (Number.isNaN(then)) return;
    const format = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

    const tick = () => {
      // Clamped at zero: a visitor's clock running behind GitHub's would
      // otherwise put the push "in 3 minutes".
      const seconds = Math.min(0, (then - Date.now()) / 1000);
      const match = UNITS.find(([, size]) => -seconds >= size);
      setLabel(
        match
          ? format.format(Math.round(seconds / match[1]), match[0])
          : format.format(0, "second") // "now" / "şimdi"
      );
    };

    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [iso, locale]);

  return label;
}
