/**
 * "Rewind to the top", as page-wide events.
 *
 * Four things start it — the footer's Rewind button, the footer wordmark,
 * the balloon chick, and the reel button that floats mid-page — and several
 * take part in it: the director that runs the scroll and draws the on-screen
 * display, the hero that replays its opening, the footer that lets go of its
 * name. Events rather than a context, the same way the assistant is opened
 * from anywhere with `mert-ask-ai`: none of these share a parent short of the
 * layout, and threading a provider through it for one gesture would touch
 * every page.
 */

export type RewindSource = "button" | "wordmark" | "chick" | "reel";

export type RewindDetail = {
  source: RewindSource;
  /** Where the gesture started, for the chick to take off from. */
  from?: { x: number; y: number };
};

const START = "mert-rewind";
const END = "mert-rewind-end";
const REPLAY = "mert-hero-replay";

export function startRewind(detail: RewindDetail): void {
  window.dispatchEvent(new CustomEvent<RewindDetail>(START, { detail }));
}

export function onRewind(handler: (detail: RewindDetail) => void): () => void {
  const listener = (e: Event) => handler((e as CustomEvent<RewindDetail>).detail);
  window.addEventListener(START, listener);
  return () => window.removeEventListener(START, listener);
}

export function endRewind(): void {
  window.dispatchEvent(new Event(END));
}

export function onRewindEnd(handler: () => void): () => void {
  window.addEventListener(END, handler);
  return () => window.removeEventListener(END, handler);
}

/** Asks the hero to play its opening again, as the reel reaches the start. */
export function replayHero(): void {
  window.dispatchEvent(new Event(REPLAY));
}

export function onHeroReplay(handler: () => void): () => void {
  window.addEventListener(REPLAY, handler);
  return () => window.removeEventListener(REPLAY, handler);
}
