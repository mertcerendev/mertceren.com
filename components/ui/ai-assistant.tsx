"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLocale } from "@/components/providers/locale-provider";
import { type ChatMessage, type ActionLink, getLocalAiResponse, MERT_KNOWLEDGE } from "@/lib/ai-knowledge";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Gap left between the panel and the keyboard once it is up. */
const KEYBOARD_GAP = 12;
/** Smaller shifts are the URL bar sliding away, not a keyboard. */
const KEYBOARD_MIN = 80;

/**
 * How much of the screen the on-screen keyboard is covering, and how much is
 * left above it.
 *
 * iOS does not shrink the layout viewport when the keyboard opens, so dvh
 * units never react to it and a panel pinned to the bottom is left underneath.
 * visualViewport is the only thing that reports the covered strip. Android
 * does shrink the layout viewport, so there both numbers move together and
 * this correctly reports nothing to compensate for.
 */
function useKeyboardInset() {
  const [keyboard, setKeyboard] = useState({ inset: 0, available: 0 });

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    // Deliberately not measured on mount: the drawer is opened by tapping a
    // button, so the keyboard is always down by then, and reading it here
    // would mean setting state straight out of an effect.
    const update = () => {
      const covered = window.innerHeight - vv.height - vv.offsetTop;
      setKeyboard({
        inset: covered > KEYBOARD_MIN ? Math.round(covered) : 0,
        available: Math.round(vv.height),
      });
    };

    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  return keyboard;
}

function TypewriterText({
  text,
  speed = 14,
  isTyping,
  onComplete,
}: {
  text: string;
  speed?: number;
  isTyping: boolean;
  onComplete?: () => void;
}) {
  const [displayed, setDisplayed] = useState(isTyping ? "" : text);

  useEffect(() => {
    if (!isTyping) {
      setDisplayed(text);
      return;
    }
    let idx = 0;
    setDisplayed("");
    const interval = setInterval(() => {
      idx += 1;
      if (idx <= text.length) {
        setDisplayed(text.slice(0, idx));
      } else {
        clearInterval(interval);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, isTyping]);

  return <p className="whitespace-pre-wrap">{displayed}</p>;
}

export function AiAssistant() {
  const locale = useLocale();
  const isTr = locale === "tr";
  const keyboard = useKeyboardInset();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  const initialWelcomeText = isTr
    ? "Selam! 👋 Ben Mert Ceren'in yapay zekâ asistanıyım, hoş geldin! 😄☕\n\nMert'in TEKNOFEST 2026 5Genç projesini, yeteneklerini, 22 onaylı sertifikasını veya BANÜ Yazılım Mühendisliği eğitimini mi merak ediyorsun? Sor bakalım, sana seve seve yardımcı olurum! ✨"
    : "Hello! 👋 I'm Mert Ceren's AI Assistant, welcome! 😄☕\n\nCurious about Mert's TEKNOFEST 2026 project, skills, 22 certificates, or BANÜ Software Engineering degree? Ask away, I'm happy to help! ✨";

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "assistant",
      text: initialWelcomeText,
      actionLinks: [
        { label: isTr ? "Seçilmiş Projeler 🚀" : "Featured Projects 🚀", href: "#work", isAnchor: true },
        { label: isTr ? "Sertifikaları Gör 📜" : "View Certificates 📜", href: "#certificates", isAnchor: true },
        { label: isTr ? "İletişime Geç ✉️" : "Contact Mert ✉️", href: "#contact", isAnchor: true },
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [typingMsgId, setTypingMsgId] = useState<string | null>(null);
  /**
   * Which ends of the quick-prompt row carry on past the panel. A row clipped
   * flat at the edge reads as a chip the panel happened to cut off, not as
   * something that scrolls, so both the soft edge and the arrow hang off this.
   */
  const [chipOverflow, setChipOverflow] = useState({ start: false, end: false });
  const chipRowRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isUserInteractingRef = useRef(false);
  const touchStartPosRef = useRef<number | null>(null);

  const scrollToBottom = (instant = false) => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: instant ? "instant" : "smooth",
      });
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: instant ? "instant" : "smooth" });
    }
  };

  /**
   * Keeps the body settled on its newest content the way any chat does, but
   * eased: each frame closes a fraction of the remaining distance, so the view
   * drifts down with the line being written instead of jumping. It idles at no
   * cost once caught up, and gives way the moment the visitor scrolls.
   *
   * A per-frame ease rather than scrollTo({behavior:"smooth"}): that restarts
   * its animation on every call, which against a constantly moving target
   * reads as a series of jumps.
   *
   * This can chase the true bottom because action buttons are held back until
   * the reply has finished typing — otherwise their block, taller than the
   * body itself, would sit under a half-written answer and drag the view off
   * the text.
   */
  useEffect(() => {
    if (!isOpen) return;

    let frame = requestAnimationFrame(function step() {
      const container = messagesContainerRef.current;
      if (container && !isUserInteractingRef.current) {
        const distance =
          container.scrollHeight - container.clientHeight - container.scrollTop;
        if (distance > 0.5) {
          // Floor keeps the last pixels from crawling; cap stops an overshoot.
          container.scrollTop += Math.min(distance, Math.max(distance * 0.08, 0.5));
        }
      }
      frame = requestAnimationFrame(step);
    });

    return () => cancelAnimationFrame(frame);
  }, [isOpen]);

  /**
   * Watches the chip row's scroll position.
   *
   * The first reading goes through a microtask, not the ResizeObserver that
   * follows it: observer callbacks are delivered with the browser's rendering
   * steps, so a panel opening in a tab that is not painting would sit there
   * with no hint on it at all. A microtask runs either way, and reading
   * scrollWidth flushes the layout it needs.
   */
  useEffect(() => {
    const row = chipRowRef.current;
    if (!row) return;

    const update = () => {
      const remaining = row.scrollWidth - row.clientWidth - row.scrollLeft;
      setChipOverflow((prev) => {
        // A pixel of slack: sub-pixel widths never settle on an exact end.
        const start = row.scrollLeft > 1;
        const end = remaining > 1;
        return prev.start === start && prev.end === end ? prev : { start, end };
      });
    };

    queueMicrotask(update);

    // Keeps up with a rotation or a resized window afterwards.
    const observer = new ResizeObserver(update);
    observer.observe(row);
    row.addEventListener("scroll", update, { passive: true });

    return () => {
      observer.disconnect();
      row.removeEventListener("scroll", update);
    };
  }, [isOpen]);

  /** Fades whichever end the row continues past, and nothing when it fits. */
  const chipMask = `linear-gradient(to right, ${
    chipOverflow.start ? "transparent, #000 2rem" : "#000"
  }, ${chipOverflow.end ? "#000 calc(100% - 2.5rem), transparent" : "#000"})`;

  const handleWheelOrScroll = () => {
    isUserInteractingRef.current = true;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartPosRef.current = e.touches[0]?.clientY ?? null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartPosRef.current !== null) {
      const currentY = e.touches[0]?.clientY ?? 0;
      const diff = Math.abs(currentY - touchStartPosRef.current);
      // Only set user interacting if user actually dragged/swiped more than 10px
      if (diff > 10) {
        isUserInteractingRef.current = true;
      }
    }
  };

  // Scroll to bottom when drawer opens so user sees where they left off
  useEffect(() => {
    if (isOpen) {
      const t1 = setTimeout(() => scrollToBottom(true), 10);
      const t2 = setTimeout(() => scrollToBottom(true), 150);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [isOpen]);

  // Load chat history from sessionStorage on mount
  useEffect(() => {
    try {
      const savedMessages = sessionStorage.getItem("mert_ai_chat_history");
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Save chat history to sessionStorage on update
  useEffect(() => {
    try {
      if (messages.length > 0) {
        sessionStorage.setItem("mert_ai_chat_history", JSON.stringify(messages));
      }
    } catch {
      // ignore
    }
  }, [messages]);

  const updateIsOpen = (val: boolean) => {
    setIsOpen(val);
  };

  const handleSendRef = useRef<((textToSend?: string) => Promise<void>) | null>(null);

  // Handle ESC key close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        updateIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Handle external contextual copilot requests ("mert-ask-ai")
  useEffect(() => {
    const handleAskAiEvent = (e: Event) => {
      const customEvt = e as CustomEvent<{ prompt: string; autoSend?: boolean }>;
      const prompt = customEvt.detail?.prompt;
      if (!prompt) return;

      setIsOpen(true);
      setHasUnread(false);

      // Short timeout to let the drawer animate in and ref initialize
      setTimeout(() => {
        if (handleSendRef.current) {
          handleSendRef.current(prompt);
        }
      }, 150);
    };

    window.addEventListener("mert-ask-ai", handleAskAiEvent);
    return () => window.removeEventListener("mert-ask-ai", handleAskAiEvent);
  }, []);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input.trim();
    if (!query || loading) return;

    setInput("");
    setHasUnread(false);
    isUserInteractingRef.current = false; // Reset scroll override for new streaming response

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          locale,
          // `messages` here is the pre-send closure state, so it holds the
          // conversation up to (not including) the message being sent — the
          // model uses it to vary its openers instead of cold-starting.
          history: messages.slice(-8).map((m) => ({
            role: m.sender === "user" ? "user" : "assistant",
            content: m.text,
          })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const botMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          sender: "assistant",
          text: data.text || "Yanıt oluşturulamadı.",
          actionLinks: data.actionLinks,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, botMsg]);
        setTypingMsgId(botMsg.id);
        isUserInteractingRef.current = false;
      } else {
        throw new Error("API error");
      }
    } catch {
      // Local Fallback if API fails
      const fallback = getLocalAiResponse(query, isTr ? "tr" : "en");
      const botMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: "assistant",
        text: fallback.text,
        actionLinks: fallback.actionLinks,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMsg]);
      setTypingMsgId(botMsg.id);
      isUserInteractingRef.current = false;
    } finally {
      setLoading(false);
    }
  };

  handleSendRef.current = handleSend;

  const handleActionClick = (link: ActionLink) => {
    // 1. Immediately close the chatbot drawer
    setIsOpen(false);

    // 2. Handle scroll or navigation
    if (link.isAnchor || link.href.startsWith("#")) {
      const targetId = link.href.startsWith("#") ? link.href : `#${link.href}`;
      const element = document.querySelector(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      } else {
        window.location.href = `/${locale}${targetId}`;
      }
    } else if (link.href.startsWith("http")) {
      window.open(link.href, "_blank", "noopener,noreferrer");
    } else {
      const targetId = "#work";
      const element = document.querySelector(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      } else {
        window.location.href = `/${locale}${targetId}`;
      }
    }
  };

  const quickPrompts = isTr
    ? [
        { emoji: "🚀", text: "TEKNOFEST Projesi" },
        { emoji: "💻", text: "Teknolojiler & Stack" },
        { emoji: "📜", text: `${MERT_KNOWLEDGE.certificatesCount} Sertifikası` },
        { emoji: "✉️", text: "Staj / İletişim" },
      ]
    : [
        { emoji: "🚀", text: "TEKNOFEST Project" },
        { emoji: "💻", text: "Tech Stack & Skills" },
        { emoji: "📜", text: "Certifications" },
        { emoji: "✉️", text: "Contact Details" },
      ];

  return (
    <>
      {/* FLOATING CHATBOT BUTTON */}
      <div className="fixed bottom-6 right-6 z-40">
        <motion.button
          type="button"
          onClick={() => {
            updateIsOpen(!isOpen);
            setHasUnread(false);
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative flex h-14 w-14 items-center justify-center rounded-full border border-accent/60 bg-surface/90 text-accent shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-accent hover:bg-accent hover:text-accent-ink cursor-pointer"
          aria-label="AI Asistan ile Konuş"
        >
          {/* Glowing Aura Effect */}
          {/* group-hover:opacity-100 and its transition are gone: the button
              is not a `group` and this had no opacity-0 to rise from, so the
              pair never did anything on any device. The glow was always on,
              and still is. */}
          <span className="absolute -inset-1 rounded-full bg-accent/20 blur-md" />
          
          {isOpen ? (
            <svg className="h-6 w-6 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <div className="relative z-10 flex items-center justify-center">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              {hasUnread && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-accent"></span>
                </span>
              )}
            </div>
          )}
        </motion.button>
      </div>

      {/* CHAT DRAWER PANEL */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ duration: 0.3, ease: EASE }}
            data-lenis-prevent
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            /* Pinned by insets rather than a 100vw width: 100vw counts the
               scrollbar, which pushed the panel off-centre. dvh covers the
               browsers that shrink the layout viewport for the keyboard; the
               inline style below covers iOS, which does not.

               On a phone the height fills what is actually free: everything
               but the 6rem it floats above the button, the site header it
               must stay clear of, and a little air between the two. A flat
               540px left 103px of the screen unused above it. Height, not a
               top inset — setting both top and bottom would over-constrain
               the box and make the keyboard's inline max-height grow it
               downwards, back under the keyboard. */
            style={
              keyboard.inset > 0
                ? {
                    bottom: keyboard.inset + KEYBOARD_GAP,
                    maxHeight: keyboard.available - KEYBOARD_GAP * 2,
                  }
                : undefined
            }
            className="fixed bottom-24 inset-x-4 z-40 flex h-[calc(100dvh-11.5rem)] flex-col overflow-hidden rounded-3xl border hairline bg-surface/95 shadow-2xl backdrop-blur-2xl sm:inset-x-auto sm:right-6 sm:h-[540px] sm:w-[420px] sm:max-h-[80vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b hairline px-5 py-4 bg-surface/90">
              <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-accent font-bold font-mono text-sm border border-accent/40">
                  MC
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-surface" />
                </div>
                <div>
                  <h4 className="font-display text-sm font-bold text-foreground leading-snug">
                    Mert Ceren AI Asistan
                  </h4>
                  <p className="text-[0.6875rem] font-mono text-muted flex items-center gap-1.5">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {isTr ? "Sorularınız için hazır" : "Ready to answer"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    try {
                      sessionStorage.removeItem("mert_ai_chat_history");
                    } catch {
                      // ignore
                    }
                    setMessages([
                      {
                        id: "welcome-1",
                        sender: "assistant",
                        text: initialWelcomeText,
                        actionLinks: [
                          { label: isTr ? "TEKNOFEST Projesi 🚀" : "TEKNOFEST Project 🚀", href: "/work/smart-road-safety" },
                          { label: isTr ? "Sertifikaları Gör 📜" : "View Certificates 📜", href: "#certificates", isAnchor: true },
                          { label: isTr ? "İletişime Geç ✉️" : "Contact Mert ✉️", href: "#contact", isAnchor: true },
                        ],
                        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                      },
                    ]);
                  }}
                  className="tap-target flex size-9 items-center justify-center rounded-full text-muted hover:text-foreground transition-colors cursor-pointer sm:size-8"
                  /* aria-label as well as the tooltip. title never opens on
                     a touch screen, so on a phone this was an unlabelled bin
                     icon - and the close button beside it already carried
                     one. */
                  aria-label={isTr ? "Sohbeti temizle" : "Clear chat"}
                  title={isTr ? "Sohbeti Temizle" : "Clear Chat"}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => updateIsOpen(false)}
                  aria-label={isTr ? "Sohbeti kapat" : "Close chat"}
                  className="tap-target flex size-9 items-center justify-center rounded-full text-muted hover:text-foreground transition-colors cursor-pointer sm:size-8"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Messages Body */}
            <div
              ref={messagesContainerRef}
              data-lenis-prevent
              onWheel={handleWheelOrScroll}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4 font-sans text-sm"
            >
              {messages.map((msg) => {
                const isUser = msg.sender === "user";
                const isTypingThisMsg = typingMsgId === msg.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        isUser
                          ? "bg-accent text-accent-ink font-medium rounded-br-none"
                          : "bg-surface-elevated/80 border hairline text-foreground rounded-bl-none shadow-sm"
                      }`}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      ) : (
                        <TypewriterText
                          text={msg.text}
                          speed={14}
                          isTyping={isTypingThisMsg}
                          onComplete={() => setTypingMsgId(null)}
                        />
                      )}

                      {/* Action links — held back until the reply has finished
                          typing, the way every chat assistant reveals its
                          suggestions. Shown alongside a half-written answer
                          their block is taller than the message body itself,
                          which pushed the text being written out of view. */}
                      {!isTypingThisMsg && msg.actionLinks && msg.actionLinks.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-foreground/10">
                          {msg.actionLinks.map((link, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleActionClick(link);
                              }}
                              className="rounded-full bg-accent/15 px-3 py-2.5 font-mono text-[0.6875rem] font-semibold text-accent border border-accent/30 transition-all hover:bg-accent hover:text-accent-ink hover:border-accent cursor-pointer sm:py-1.5"
                            >
                              {link.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="mt-1 px-1 text-[0.625rem] font-mono text-muted">
                      {msg.timestamp}
                    </span>
                  </div>
                );
              })}

              {/* Loading Dots Indicator */}
              {loading && (
                <div className="flex items-center gap-1.5 text-muted bg-surface-elevated/60 border hairline rounded-2xl px-4 py-3 w-max rounded-bl-none">
                  <span className="h-2 w-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-2 w-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="h-2 w-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts Bar. Two different problems above and below sm,
                so two different layouts.

                On a phone the panel is as tall as the viewport allows and
                every pixel the chips take is a pixel off the conversation:
                wrapped, these four ran to three lines and left the thread
                240px. So they stay on one sideways-scrolling row there, with
                the scrollbar hidden — the panel cannot spare its height — and
                a soft edge plus an arrow to say the row continues.

                From sm the panel is a fixed 420x540 box that is not competing
                with anything, and hiding half the options behind a scroll
                nobody asked for is the worse trade. They wrap.

                The mask and the arrow need no breakpoint of their own: once
                the row wraps there is no horizontal overflow, so the effect
                collapses to a plain opaque gradient and the arrow unmounts.

                The border and background sit on the outer element so the mask
                only ever fades the chips — masking the whole bar would take
                the separator line away with them. */}
            <div className="relative border-t hairline bg-surface/50 p-3">
              <div
                ref={chipRowRef}
                style={{ maskImage: chipMask, WebkitMaskImage: chipMask }}
                className="flex gap-2 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:overflow-x-visible"
              >
                {quickPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSend(prompt.text)}
                    className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border hairline bg-surface/90 px-3 py-2.5 font-mono text-[0.6875rem] text-muted hover:border-accent/60 hover:text-foreground transition-colors cursor-pointer sm:py-1.5"
                  >
                    <span>{prompt.emoji}</span>
                    <span>{prompt.text}</span>
                  </button>
                ))}
              </div>

              {chipOverflow.end && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 right-1.5 flex items-center text-muted"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              )}
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="border-t hairline p-3 bg-surface/90 flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isTr ? "Bir şey sorun..." : "Ask a question..."}
                /* 16px on mobile: iOS Safari zooms the whole page in when a
                   focused input's type is smaller than that. */
                className="min-w-0 flex-1 rounded-full border hairline bg-surface-elevated px-4 py-2.5 text-base text-foreground placeholder:text-muted focus:border-accent focus:outline-none transition-colors sm:text-sm"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-accent-ink disabled:opacity-40 transition-all hover:scale-105 active:scale-95 cursor-pointer sm:h-10 sm:w-10"
                aria-label="Gönder"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
