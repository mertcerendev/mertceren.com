"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { useContent, useLocale } from "@/components/providers/locale-provider";
import { SectionHeading } from "@/components/ui/section-heading";
import { AskAiButton } from "@/components/ui/ask-ai-button";
import type { Certificate } from "@/lib/data";

const EASE = [0.16, 1, 0.3, 1] as const;

/** How many featured cards show on the main page. */
const FEATURED_COUNT = 10;

const STOPWORDS = new Set(["ve", "and", "of", "the", "for"]);

function initials(issuer: string) {
  const words = issuer
    .replace(/[()]/g, " ")
    .split(/[\s-]+/)
    .filter((word) => /[a-zA-ZçğıöşüÇĞİÖŞÜ]/.test(word));

  const [first] = words;
  if (first && first.length >= 2 && first.length <= 5 && first === first.toLocaleUpperCase("tr")) {
    return first;
  }

  return words
    .filter((word) => !STOPWORDS.has(word.toLocaleLowerCase("tr")))
    .slice(0, 3)
    .map((word) => word[0].toLocaleUpperCase("tr"))
    .join("");
}

type CardProps = {
  certificate: Certificate;
  index: number;
  viewLabel: string;
  onSelect: (cert: Certificate) => void;
};

function CertificateCard({ certificate, index, viewLabel, onSelect }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: EASE }}
      onClick={() => onSelect(certificate)}
      className="group relative flex cursor-pointer flex-col justify-between gap-4 rounded-2xl border hairline bg-surface/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/60 hover:shadow-lg hover:shadow-accent/5"
    >
      <div className="flex items-start gap-4">
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border hairline bg-surface/80 p-2 shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:border-accent/40">
          {certificate.logo ? (
            <Image
              src={certificate.logo}
              alt={certificate.issuer}
              width={48}
              height={48}
              className="h-full w-full rounded-lg object-contain"
            />
          ) : (
            <span
              aria-hidden
              className="font-mono text-xs font-bold tracking-tight text-accent"
            >
              {initials(certificate.issuer)}
            </span>
          )}
        </div>
        <div className="flex-1 space-y-1">
          <h3 className="font-display text-lg font-bold leading-snug group-hover:text-accent transition-colors duration-300">
            {certificate.title}
          </h3>
          <p className="text-sm text-muted">{certificate.issuer}</p>
        </div>
      </div>

      {certificate.image && (
        <div className="relative overflow-hidden rounded-xl border hairline bg-black/40 h-32 w-full mt-1">
          {/* This strip is 128px tall and shows the top slice of a scan that
              can be a 700KB JPEG. `fill` plus a `sizes` hint is what stops it
              downloading the full-resolution file to paint a thumbnail. The
              widths track the band's card widths, not the grid's — asking for
              90vw to fill a 78vw box fetches a larger file for nothing. */}
          <Image
            src={certificate.image}
            alt={certificate.title}
            fill
            loading="lazy"
            sizes="(max-width: 640px) 78vw, (max-width: 1024px) 42vw, (max-width: 1280px) 26vw, 22vw"
            className="object-cover object-top opacity-85 transition-transform duration-500 group-hover:scale-105 group-hover:opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
            <span className="text-xs text-white/90 font-medium flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-full backdrop-blur-md border hairline">
              <svg className="w-3.5 h-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Sertifikayı Gör
            </span>
          </div>
        </div>
      )}

      <div className="microlabel flex items-baseline justify-between gap-3 border-t hairline pt-3 text-xs text-muted">
        <span>{certificate.issued}</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(certificate);
          }}
          className="tap-target inline-flex items-center gap-1 text-foreground transition-colors duration-300 group-hover:text-accent font-semibold"
        >
          {viewLabel}
        </button>
      </div>
    </motion.div>
  );
}

export function Certificates() {
  const { certificates, ui } = useContent();
  const locale = useLocale();
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [isAllModalOpen, setIsAllModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selectedCert) {
          setSelectedCert(null);
        } else if (isAllModalOpen) {
          setIsAllModalOpen(false);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCert, isAllModalOpen]);

  useEffect(() => {
    if (isAllModalOpen || selectedCert) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [isAllModalOpen, selectedCert]);

  const bandOuterRef = useRef<HTMLDivElement>(null);
  const bandRowRef = useRef<HTMLUListElement>(null);
  const bandBarRef = useRef<HTMLDivElement>(null);

  /**
   * Turns downward scroll into sideways travel while the band is pinned.
   *
   * The wrapper's height is measured rather than fixed: viewport plus exactly
   * the distance the row has to cover, so one pixel down is one pixel across.
   * A hard 300vh would have tied the speed to however many cards happened to
   * be in the row, and to the width of the screen reading it.
   */
  useEffect(() => {
    const outer = bandOuterRef.current;
    const row = bandRowRef.current;
    if (!outer || !row) return;

    let frame = 0;
    let travel = 0;

    const measure = () => {
      travel = Math.max(0, row.scrollWidth - window.innerWidth);
      outer.style.height = `${window.innerHeight + travel}px`;
      paint();
    };

    function paint() {
      const o = bandOuterRef.current;
      const r = bandRowRef.current;
      if (!o || !r) return;
      const box = o.getBoundingClientRect();
      const span = box.height - window.innerHeight;
      const progress = span > 0 ? Math.min(1, Math.max(0, -box.top / span)) : 0;
      r.style.transform = `translate3d(${(-progress * travel).toFixed(1)}px,0,0)`;
      if (bandBarRef.current) {
        bandBarRef.current.style.width = `${(progress * 100).toFixed(1)}%`;
      }
      frame = 0;
    }

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };

    // The cards carry lazy images, so the row's width settles after they land.
    const observer = new ResizeObserver(measure);
    observer.observe(row);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure, { passive: true });
    measure();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      if (frame) cancelAnimationFrame(frame);
      outer.style.height = "";
    };
  }, []);

  const filteredCertificates = useMemo(() => {
    if (!searchQuery.trim()) return certificates;
    const query = searchQuery.toLowerCase().trim();
    return certificates.filter(
      (cert) =>
        cert.title.toLowerCase().includes(query) ||
        cert.issuer.toLowerCase().includes(query) ||
        cert.issued.toLowerCase().includes(query)
    );
  }, [certificates, searchQuery]);

  if (!certificates.length) return null;

  const copy = ui.sections.certificates;
  const featured = certificates.slice(0, FEATURED_COUNT);

  return (
    <section id="certificates" className="px-5 py-24 sm:px-8 sm:py-32 lg:px-12">
      <SectionHeading index="05" label={copy.label} meta={copy.meta} />

      {/* Under the heading's meta, the way About and Skills carry theirs.
          Right-aligned even below sm, where the meta itself is hidden: it
          still balances the index and label above it. */}
      <div className="mt-4 flex justify-end">
        <AskAiButton
          prompt={
            locale === "tr"
              ? "Mert'in BTK Akademi, edX HP ve yapay zekâ sertifikaları hakkında özet bilgi verir misin?"
              : "Can you summarize Mert's credentials from BTK Akademi, edX HP, and AI programs?"
          }
          label={locale === "tr" ? "Sertifikaları Asistana Sor" : "Ask AI about Credentials"}
          size="sm"
          variant="subtle"
        />
      </div>

      {/* The band travels sideways as the page scrolls down. The wrapper's
          height is set in JS to the viewport plus exactly the distance the
          row has to cover, so a pixel of vertical scroll is a pixel of
          horizontal travel — a fixed 300vh would have made the speed depend
          on how many cards there happened to be.

          It replaced a grid. Ten cards stacked one per row on a phone is ten
          screens of the same card, which is the repetition the owner kept
          seeing; sideways they pass in a single gesture, and the row is
          shorter than the column it replaced. */}
      <div ref={bandOuterRef} className="relative -mx-5 mt-10 sm:-mx-8 lg:-mx-12">
        <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden">
          {/* Five on a phone, all ten from sm. A phone card is 293px wide, so
              ten of them ask for 2788px of scroll to get past — longer than
              the section has any right to be. Hidden in CSS rather than
              sliced in JS so the server and the client render the same list,
              and scrollWidth then measures only what is actually shown. */}
          <ul
            ref={bandRowRef}
            className="flex gap-6 px-5 [&>*:nth-child(n+6)]:hidden sm:px-8 sm:[&>*:nth-child(n+6)]:flex lg:px-12"
          >
            {featured.map((certificate, i) => (
              <li
                key={`${certificate.issued}-${certificate.title}`}
                className="flex w-[78vw] shrink-0 sm:w-[42vw] lg:w-[26vw] xl:w-[22vw]"
              >
                <CertificateCard
                  certificate={certificate}
                  index={i}
                  viewLabel={copy.view}
                  onSelect={setSelectedCert}
                />
              </li>
            ))}
          </ul>

          {/* How far through the band you are. The section is taller than a
              screen and pinned, so without this there is no cue that the
              page is still moving. */}
          <div className="mx-5 mt-8 h-px bg-line sm:mx-8 lg:mx-12">
            <div ref={bandBarRef} className="h-px w-0 bg-accent" />
          </div>
        </div>
      </div>

      <div className="mt-10 flex justify-center">
        {certificates.length > FEATURED_COUNT && (
          <button
            type="button"
            onClick={() => setIsAllModalOpen(true)}
            className="microlabel group relative inline-flex items-center gap-2 rounded-full border hairline px-8 py-3.5 text-sm font-semibold text-foreground transition-all duration-300 hover:border-accent hover:bg-accent hover:text-accent-ink hover:shadow-lg hover:shadow-accent/10 cursor-pointer"
          >
            <span>
              {locale === "tr"
                ? `Tüm Sertifikaları İncele (${certificates.length})`
                : `Explore All Credentials (${certificates.length})`}
            </span>
            <svg
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        )}
      </div>

      {/* ALL CERTIFICATES MODAL */}
      <AnimatePresence>
        {isAllModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAllModalOpen(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            {/* Main Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ duration: 0.3, ease: EASE }}
              /* dvh, not vh: on phones vh is the URL-bar-hidden height, so a
                 vh-sized dialog hangs below the visible area and takes its
                 footer with it. */
              className="relative z-10 flex h-[90dvh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border hairline bg-surface/95 shadow-2xl backdrop-blur-xl"
            >
              {/* Modal Header */}
              <div className="flex flex-col gap-4 border-b hairline p-5 sm:p-6 bg-surface/80">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="font-display text-2xl font-bold sm:text-3xl">
                      Tüm Sertifikalar & Uzmanlık Belgeleri
                    </h2>
                    <p className="mt-1 text-sm text-muted">
                      Toplam {certificates.length} adet onaylı sertifika ve başarı belgesi
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAllModalOpen(false)}
                    className="tap-target flex h-10 w-10 shrink-0 items-center justify-center rounded-full border hairline bg-surface/90 text-foreground transition-colors hover:border-accent hover:text-accent"
                    aria-label="Kapat"
                  >
                    ✕
                  </button>
                </div>

                {/* Search Bar */}
                <div className="relative mt-1">
                  <svg
                    className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Sertifika veya kurum adı ile filtrele (örn. BTK Akademi, C#, Claude, edX, Python...)"
                    /* 16px on mobile so iOS Safari does not zoom the page in
                       when the field takes focus. */
                    className="w-full rounded-2xl border hairline bg-surface/60 py-3 pl-11 pr-4 text-base text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:text-sm"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-foreground"
                    >
                      Temizle
                    </button>
                  )}
                </div>
              </div>

              {/* Modal Body - Scrollable Certificate Grid */}
              <div className="flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6 md:p-8">
                {filteredCertificates.length > 0 ? (
                  <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredCertificates.map((certificate, i) => (
                      <CertificateCard
                        key={`all-${certificate.issued}-${certificate.title}`}
                        certificate={certificate}
                        index={i % 6}
                        viewLabel={copy.view}
                        onSelect={setSelectedCert}
                      />
                    ))}
                  </ul>
                ) : (
                  <div className="flex h-64 flex-col items-center justify-center text-center">
                    <p className="text-lg font-semibold text-muted">Aramanızla eşleşen sertifika bulunamadı</p>
                    <p className="mt-1 text-sm text-muted">Farklı bir arama terimi deneyebilirsiniz.</p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between border-t hairline px-6 py-4 bg-surface/80 text-xs text-muted">
                <span>ESC tuşuna basarak veya dışarıya tıklayarak kapatabilirsiniz</span>
                <button
                  type="button"
                  onClick={() => setIsAllModalOpen(false)}
                  className="microlabel rounded-full border hairline px-5 py-2 text-foreground transition-colors hover:border-accent hover:text-accent"
                >
                  Kapat
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SINGLE CERTIFICATE DETAIL PREVIEW MODAL */}
      <AnimatePresence>
        {selectedCert && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 md:p-10"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCert(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="relative z-10 flex max-h-[90dvh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border hairline bg-surface/95 p-4 shadow-2xl backdrop-blur-xl sm:p-6"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 border-b hairline pb-4">
                <div>
                  <h3 className="font-display text-xl font-bold sm:text-2xl">
                    {selectedCert.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted">
                    {selectedCert.issuer} · {selectedCert.issued}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCert(null)}
                  className="tap-target flex h-9 w-9 shrink-0 items-center justify-center rounded-full border hairline bg-surface/80 text-foreground transition-colors hover:border-accent hover:text-accent"
                  aria-label="Kapat"
                >
                  ✕
                </button>
              </div>

              {/* Certificate Image View */}
              <div className="my-4 flex-1 overflow-auto rounded-2xl border hairline bg-black/60 p-2 flex items-center justify-center min-h-[180px] sm:min-h-[300px]">
                {selectedCert.image ? (
                  /* `fill` needs a positioned box of its own here: putting it
                      on the padded parent would let the scan sit under the
                      p-2 and touch the border. The dialog caps at max-w-4xl,
                      so 896px is as large as this ever needs to be served.

                      self-stretch, not h-full: the parent centres its items,
                      so this box was sized by its content — and its only
                      content is the absolutely positioned image, which
                      contributes none. It measured 0 tall and the panel was
                      a black rectangle. Stretching takes the height from the
                      row instead, and h-full has to go with it or the
                      explicit height cancels the stretch. */
                  <div className="relative w-full self-stretch">
                    <Image
                      src={selectedCert.image}
                      alt={selectedCert.title}
                      fill
                      sizes="(max-width: 896px) 100vw, 896px"
                      className="object-contain rounded-lg shadow-lg"
                    />
                  </div>
                ) : (
                  <p className="text-muted text-sm">Sertifika görseli yükleniyor...</p>
                )}
              </div>

              {/* Footer Actions */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t hairline pt-4">
                <span className="text-xs text-muted text-center sm:text-left">ESC veya dokunarak kapatabilirsiniz</span>
                <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
                  {selectedCert.href && selectedCert.href !== "#" && (
                    <a
                      href={selectedCert.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="microlabel tap-target inline-flex items-center gap-2 rounded-full border hairline px-4 py-3 text-[0.7rem] text-foreground transition-colors hover:border-accent hover:bg-accent hover:text-accent-ink sm:py-2"
                    >
                      Resmi Doğrulama Bağlantısı ↗
                    </a>
                  )}
                  {selectedCert.image && (
                    <a
                      href={selectedCert.image}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="microlabel tap-target inline-flex items-center gap-2 rounded-full bg-accent px-4 py-3 text-[0.7rem] text-accent-ink transition-opacity hover:opacity-90 font-semibold sm:py-2"
                    >
                      Tam Boyut İncele ↗
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}


