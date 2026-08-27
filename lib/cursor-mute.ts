/**
 * The "do not disturb" flag, as one external store.
 *
 * Four components care about it: the cursor that stops talking, the toggle in
 * the header and the mobile menu, the idle overlay, and the header chick. They
 * were all reading the same localStorage key and listening to the same custom
 * event, each with its own copy of the try/catch and its own idea of what the
 * key is called — and two of them read it into React state inside an effect
 * body, which is a render cascading out of a render.
 *
 * These three functions are the shape useSyncExternalStore wants, which is
 * what idle-mode.tsx already used; this is that pair lifted out so the others
 * can stop hand-rolling it.
 */

const KEY = "mert_cursor_muted";
const EVENT = "mert-cursor-mute-changed";

/** Reads the flag. Storage can throw — a locked-down browser, private mode. */
export function readMute(): boolean {
  try {
    return localStorage.getItem(KEY) === "true";
  } catch {
    return false;
  }
}

/**
 * Never true on the server: localStorage does not exist there, and claiming
 * muted would render the quiet version and then swap it on hydration.
 */
export function readMuteOnServer(): boolean {
  return false;
}

export function subscribeMute(onChange: () => void): () => void {
  window.addEventListener(EVENT, onChange);
  return () => window.removeEventListener(EVENT, onChange);
}

/**
 * The only writer. Stores the flag and announces it in one go, so a caller
 * cannot save without telling anyone or tell everyone without saving.
 */
export function writeMute(muted: boolean): void {
  try {
    localStorage.setItem(KEY, muted ? "true" : "false");
  } catch {
    // A visitor who cannot persist it still gets it for this page.
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { muted } }));
}
