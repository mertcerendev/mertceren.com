"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "motion/react";
import { usePathname } from "next/navigation";
import { useLenis } from "lenis/react";
import { readMute, readMuteOnServer, subscribeMute } from "@/lib/cursor-mute";

// Kept parallel: index N is the same joke in both languages, so switching
// locale mid-rotation never replays the joke you just saw.
const COPY_MESSAGES_TR = [
  "Hop hemşerim nereye kopyalıyorsun? 🤨 Kaynak göster bari!",
  "Ctrl+C yaptın ama Ctrl+V yaparken vicdanın sızlayacak... 🤫",
  "Kopyala kopyala... Sonra 'Senior Developer'ım dersin 😅",
];

const COPY_MESSAGES_EN = [
  "Hey buddy where are you copying that? 🤨 At least give credit!",
  "Ctrl+C done, but your conscience will hurt on Ctrl+V... 🤫",
  "Copy away... and then call yourself a Senior Dev 😅",
];

/** Distance kept from the edge of the screen when the menu is placed. */
const EDGE = 12;

type MenuItem = {
  id: string;
  icon: string;
  label: string;
  hint?: string;
  run: () => void;
};

/** What was under the pointer when the menu opened. */
type Target = {
  selection: string;
  linkHref: string | null;
  linkIsExternal: boolean;
  imageSrc: string | null;
  sectionId: string | null;
  sectionLabel: string | null;
};

const EMPTY_TARGET: Target = {
  selection: "",
  linkHref: null,
  linkIsExternal: false,
  imageSrc: null,
  sectionId: null,
  sectionLabel: null,
};

/**
 * The section heading's own words, so a menu item can name the place it is
 * about without a second list of section names to keep in step. Same read
 * SectionSpine does.
 */
/**
 * What 'open this image' should actually open.
 *
 * next/image serves through /_next/image, so the src on the page is a
 * resized copy at whatever width this layout asked for; the file itself is
 * sitting in the url parameter. Opening the optimiser URL would hand someone
 * a scaled JPEG of a PNG.
 *
 * Read off the src attribute rather than currentSrc, which is empty until
 * the image has decoded — the menu should not offer the item only for images
 * that happen to have finished loading.
 */
function imageUrlOf(img: HTMLImageElement | null): string | null {
  const raw = img?.getAttribute("src");
  if (!raw) return null;
  let abs: URL;
  try {
    abs = new URL(raw, window.location.href);
  } catch {
    return null;
  }
  const original = abs.searchParams.get("url");
  if (abs.pathname === "/_next/image" && original) {
    try {
      return new URL(original, window.location.origin).href;
    } catch {
      return null;
    }
  }
  // data: and blob: cannot be opened as a page.
  return abs.protocol === "http:" || abs.protocol === "https:" ? abs.href : null;
}

function sectionLabelOf(section: Element): string | null {
  const heading = section.querySelector("h2");
  if (!heading) return null;
  const label = [...heading.childNodes]
    .slice(2)
    .map((node) => node.textContent ?? "")
    .join("")
    .trim();
  return label || null;
}

export function ContextMenu() {
  const pathname = usePathname() ?? "/";
  const isEnglish = pathname === "/en" || pathname.startsWith("/en/");
  const lenis = useLenis();

  const [isOpen, setIsOpen] = useState(false);
  const [target, setTarget] = useState<Target>(EMPTY_TARGET);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isMuted = useSyncExternalStore(subscribeMute, readMute, readMuteOnServer);

  const menuRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef({ x: 0, y: 0 });
  const openerRef = useRef<Element | null>(null);
  const copyQueueRef = useRef<number[]>([]);
  const lastCopyIndexRef = useRef<number>(-1);

  const t = useCallback(
    (tr: string, en: string) => (isEnglish ? en : tr),
    [isEnglish]
  );

  const toast = useCallback((msg: string) => {
    setToastMessage(msg);
    setIsOpen(false);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  }, []);

  const copyToClipboard = useCallback(
    async (text: string, success: string) => {
      try {
        await navigator.clipboard.writeText(text);
        toast(success);
      } catch {
        // Insecure context, or the permission was refused.
        toast(t("😬 Tarayıcı panoya izin vermedi — Ctrl+C dene!", "😬 The browser blocked the clipboard — try Ctrl+C!"));
      }
    },
    [toast, t]
  );

  /* Built fresh on every open rather than kept in a constant, because what
     belongs in it depends entirely on what was under the pointer. A menu that
     offers "copy link address" over a paragraph is the thing that makes these
     feel fake. */
  const items: MenuItem[] = [];

  if (target.selection) {
    const short =
      target.selection.length > 60 ? `${target.selection.slice(0, 60)}…` : target.selection;
    items.push({
      id: "copy-selection",
      icon: "📋",
      label: t("Seçimi kopyala", "Copy selection"),
      hint: "Ctrl+C",
      run: () =>
        copyToClipboard(
          target.selection,
          t("🤫 Kopyaladın bile. Kaynak göster bari: @mertcerendev!", "🤫 Copied. At least give credit: @mertcerendev!")
        ),
    });
    items.push({
      id: "ask-selection",
      icon: "✨",
      label: t("Seçimi asistana sor", "Ask the assistant"),
      run: () => {
        window.dispatchEvent(
          new CustomEvent("mert-ask-ai", {
            detail: {
              prompt: t(
                `Sayfada şunu seçtim: "${short}" — bunu açıklar mısın?`,
                `I selected this on the page: "${short}" — can you explain it?`
              ),
            },
          })
        );
        setIsOpen(false);
      },
    });
  }

  if (target.linkHref) {
    items.push({
      id: "open-link",
      icon: "↗",
      label: t("Bağlantıyı yeni sekmede aç", "Open link in new tab"),
      run: () => {
        window.open(target.linkHref!, "_blank", "noopener,noreferrer");
        setIsOpen(false);
      },
    });
    items.push({
      id: "copy-link",
      icon: "🔗",
      label: t("Bağlantı adresini kopyala", "Copy link address"),
      run: () =>
        copyToClipboard(
          target.linkHref!,
          t("🔗 Bağlantı panoda.", "🔗 Link copied.")
        ),
    });
  }

  if (target.imageSrc) {
    items.push({
      id: "open-image",
      icon: "🖼️",
      label: t("Görseli yeni sekmede aç", "Open image in new tab"),
      run: () => {
        window.open(target.imageSrc!, "_blank", "noopener,noreferrer");
        setIsOpen(false);
      },
    });
  }

  items.push({
    id: "copy-here",
    icon: "🧭",
    label: target.sectionLabel
      ? t(`"${target.sectionLabel}" bağlantısını kopyala`, `Copy link to "${target.sectionLabel}"`)
      : t("Sayfa bağlantısını kopyala", "Copy page link"),
    run: () => {
      const url = `${window.location.origin}${window.location.pathname}${
        target.sectionId ? `#${target.sectionId}` : ""
      }`;
      copyToClipboard(url, t("🧭 Bağlantı panoda — paylaşabilirsin.", "🧭 Link copied — go ahead and share it."));
    },
  });

  items.push({
    id: "top",
    icon: "↑",
    label: t("En başa dön", "Back to top"),
    run: () => {
      // Through Lenis, which owns the scroll position: a native scrollTo is
      // overwritten on the next frame, which is why this item did nothing.
      if (lenis) lenis.scrollTo(0, { duration: 1.4 });
      else window.scrollTo({ top: 0, behavior: "smooth" });
      setIsOpen(false);
    },
  });

  items.push({
    id: "dnd",
    icon: isMuted ? "🔔" : "🤐",
    label: isMuted
      ? t("Rahatsız etmeyi kapat", "Turn off do not disturb")
      : t("Rahatsız etme", "Do not disturb"),
    run: () => {
      window.dispatchEvent(new CustomEvent("mert-toggle-cursor-mute"));
      setIsOpen(false);
    },
  });

  /* The keyboard handler below reaches the list through this rather than
     closing over it, so it does not have to re-subscribe every time the list
     is rebuilt. Assigned in an effect, not during render: a ref written while
     rendering is read before it is set on the very first pass. */
  const itemsRef = useRef(items);
  const activeIndexRef = useRef(activeIndex);
  useEffect(() => {
    itemsRef.current = items;
    activeIndexRef.current = activeIndex;
  });

  // Right-click: read what is under the pointer, then open.
  useEffect(() => {
    const onContextMenu = (e: MouseEvent) => {
      // Shift is the way back to the browser's own menu.
      if (e.shiftKey) return;
      /* Touch keeps its native long-press. What it opens there — selection
         handles, link previews, save-image — is better than anything this can
         offer, and taking it away to show a mouse-shaped panel is a loss. */
      if (!window.matchMedia("(pointer: fine)").matches) return;

      e.preventDefault();

      const el = e.target as Element | null;
      const link = el?.closest?.("a[href]") as HTMLAnchorElement | null;
      const img = el?.closest?.("img") as HTMLImageElement | null;
      const section = el?.closest?.("section[id]") ?? null;
      const href = link?.href ?? null;

      openerRef.current = document.activeElement;
      anchorRef.current = { x: e.clientX, y: e.clientY };
      setTarget({
        selection: window.getSelection()?.toString().trim() ?? "",
        linkHref: href,
        linkIsExternal: Boolean(href && !href.startsWith(window.location.origin)),
        imageSrc: imageUrlOf(img),
        sectionId: section?.id ?? null,
        sectionLabel: section ? sectionLabelOf(section) : null,
      });
      setActiveIndex(-1);
      setIsOpen(true);
    };

    document.addEventListener("contextmenu", onContextMenu, true);
    return () => document.removeEventListener("contextmenu", onContextMenu, true);
  }, []);

  // Everything that dismisses it.
  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (e: PointerEvent) => {
      if (e.button === 2) return; // the right-click that opened it
      if (menuRef.current?.contains(e.target as Node)) return;
      setIsOpen(false);
    };
    const close = () => setIsOpen(false);

    const onKeyDown = (e: KeyboardEvent) => {
      const count = itemsRef.current.length;
      if (e.key === "Escape") {
        e.preventDefault();
        setIsOpen(false);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % count);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => (i <= 0 ? count - 1 : i - 1));
      } else if (e.key === "Home") {
        e.preventDefault();
        setActiveIndex(0);
      } else if (e.key === "End") {
        e.preventDefault();
        setActiveIndex(count - 1);
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        /* Read from the ref rather than reaching for the index inside a
           setState updater. An updater has to be pure, and React calls it
           twice in development to prove it — which ran the highlighted item
           twice, so Enter on the mute toggle muted and unmuted in one press. */
        itemsRef.current[activeIndexRef.current]?.run();
      }
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", close, { passive: true });
    window.addEventListener("resize", close);
    window.addEventListener("blur", close);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", close);
      window.removeEventListener("resize", close);
      window.removeEventListener("blur", close);
    };
  }, [isOpen]);

  /**
   * Placed against its measured size, not a guess at it.
   *
   * The old version subtracted a hardcoded 270 and 300 from the viewport,
   * which is wrong twice over: the menu's height depends on how many items
   * the context produced, and clamping only the far edge lets a click near
   * the top-left push it off those sides instead. Written straight to the
   * node in a layout effect so the correction lands before the first paint
   * rather than as a second render.
   */
  useLayoutEffect(() => {
    const el = menuRef.current;
    if (!isOpen || !el) return;
    /* offsetWidth, not getBoundingClientRect: this runs while the open
       animation still has scale(0.92) on the element, and the rect reports
       the transformed box — 265px for a menu that lays out at 288. Clamping
       against the smaller figure lets it settle 11px past the right edge
       once it grows. The offset properties ignore transforms, which is the
       size the menu will actually occupy. */
    const width = el.offsetWidth;
    const height = el.offsetHeight;
    const { x, y } = anchorRef.current;
    const left = Math.max(EDGE, Math.min(x, window.innerWidth - width - EDGE));
    const top = Math.max(EDGE, Math.min(y, window.innerHeight - height - EDGE));
    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
  }, [isOpen, target]);

  // Focus goes into the menu on open and back where it came from on close,
  // so a keyboard visitor is not dropped at the top of the document.
  useEffect(() => {
    if (isOpen) {
      menuRef.current?.focus();
      return;
    }
    const opener = openerRef.current;
    if (opener instanceof HTMLElement) opener.focus();
  }, [isOpen]);

  // The joke that plays on a real Ctrl+C.
  useEffect(() => {
    const messages = isEnglish ? COPY_MESSAGES_EN : COPY_MESSAGES_TR;

    // Shuffled deck instead of a plain random pick: every message plays once
    // before any of them repeats, and a fresh shuffle never leads with the
    // message that just played — so you never see the same one twice in a row.
    const nextMessage = () => {
      if (copyQueueRef.current.length === 0) {
        const deck = Array.from({ length: messages.length }, (_, i) => i);
        for (let i = deck.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        // Cards are drawn off the end, so guard the last slot, not the first.
        if (deck[deck.length - 1] === lastCopyIndexRef.current && deck.length > 1) {
          [deck[deck.length - 1], deck[0]] = [deck[0], deck[deck.length - 1]];
        }
        copyQueueRef.current = deck;
      }
      const index = copyQueueRef.current.pop()!;
      lastCopyIndexRef.current = index;
      return messages[index];
    };

    const handleCopy = () => {
      const msg = nextMessage();
      setToastMessage(msg);
      setTimeout(() => {
        setToastMessage((prev) => (prev === msg ? null : prev));
      }, 3200);
    };

    window.addEventListener("copy", handleCopy);
    return () => window.removeEventListener("copy", handleCopy);
  }, [isEnglish]);

  return (
    <>
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="fixed top-6 left-1/2 z-[100000] flex max-w-[90vw] -translate-x-1/2 items-center gap-3 rounded-full border-2 border-accent bg-surface-elevated/95 px-6 py-3 text-center font-mono text-xs font-extrabold text-foreground shadow-[0_15px_40px_rgba(0,0,0,0.8)] ring-4 ring-accent/20 backdrop-blur-2xl sm:text-sm"
          >
            <span className="inline-block size-2 shrink-0 rounded-full bg-accent animate-pulse" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            role="menu"
            tabIndex={-1}
            aria-label={t("Sayfa menüsü", "Page menu")}
            initial={{ opacity: 0, scale: 0.92, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -5 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed z-[99998] w-72 rounded-2xl border border-accent/30 bg-surface-elevated/95 p-2 font-mono text-xs text-foreground shadow-[0_20px_50px_rgba(0,0,0,0.9)] outline-none backdrop-blur-2xl"
          >
            {/* Says where you clicked, which is also what the link item copies,
                rather than a version number nothing versions. */}
            <div className="flex items-baseline justify-between gap-3 border-b hairline px-3 py-2 text-[0.6875rem] text-muted">
              <span className="truncate font-bold text-accent">
                {target.sectionLabel ?? "mertceren.com"}
              </span>
              <span className="shrink-0 text-[0.625rem] text-muted/60">
                {t("Shift + sağ tık", "Shift + right-click")}
              </span>
            </div>

            <div className="mt-1 space-y-0.5">
              {items.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  role="menuitem"
                  tabIndex={-1}
                  onClick={item.run}
                  onPointerEnter={() => setActiveIndex(i)}
                  className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                    i === activeIndex ? "bg-accent/15 text-accent" : "hover:bg-accent/15 hover:text-accent"
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span aria-hidden className="w-4 shrink-0 text-center text-sm">
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </span>
                  {item.hint && (
                    <span
                      aria-hidden
                      className={`shrink-0 text-[0.625rem] ${
                        i === activeIndex ? "text-accent" : "text-muted"
                      }`}
                    >
                      {item.hint}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
