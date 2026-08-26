"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { cvVersion } from "@/lib/cv-version";
import { useContent, useLocale } from "@/components/providers/locale-provider";
import { SectionHeading } from "@/components/ui/section-heading";
import { RevealText } from "@/components/ui/reveal-text";
import { CopyEmailButton } from "@/components/ui/copy-email-button";
import { ContactForm } from "@/components/ui/contact-form";
import { SocialLinks } from "@/components/ui/social-links";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Contact() {
  const { profile, ui } = useContent();
  const locale = useLocale();
  const isTr = locale === "tr";
  const [isCvModalOpen, setIsCvModalOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isCvModalOpen) {
        setIsCvModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCvModalOpen]);

  useEffect(() => {
    if (isCvModalOpen) {
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
  }, [isCvModalOpen]);

  /* Same rhythm as every other section. This one carried py-28/py-40 against
     their py-24/py-32, which put 32px of extra nothing above the heading —
     and since the nav drops the section's top edge at the top of the
     viewport, that dead space came straight off the bottom: on a 720px
     window the address button ended 641px down, right on the edge, and on a
     shorter laptop it fell off it. */
  return (
    <section id="contact" className="px-5 py-24 sm:px-8 sm:py-32 lg:px-12">
      <SectionHeading
        index="07"
        label={ui.sections.contact.label}
        meta={ui.sections.contact.meta}
      />

      <div className="mt-20 flex flex-col items-center text-center">
        <RevealText
          as="h2"
          lines={ui.sections.contact.lines}
          className="font-display text-display-xl font-extrabold uppercase leading-[0.95] tracking-tight"
        />

        {/* One column for the address, the CV and the form. They used to be
            three centred blocks of three different widths — 374, 350 and
            545 — so nothing shared an edge and the stack read as a tree.
            Sharing `max-w-xl` and stretching to it gives them one left and
            one right, which is the whole of the fix. */}
        <div className="mt-12 w-full max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
            className="flex flex-col gap-4"
          >
            <CopyEmailButton />

            {/* The `mailto:` link used to sit here. It now names the form
                below instead of opening a mail client — the address above is
                already one tap from the clipboard, and on a phone without a
                configured client the link did nothing at all. */}

            {/* CV PREVIEW & DOWNLOAD BUTTON */}
            <button
              type="button"
              onClick={() => setIsCvModalOpen(true)}
              /* Sized to its label and centred, unlike the address and the
                 fields that bracket it. Stretching it to the column made
                 it the widest, loudest thing in the section; a CTA that
                 reads as a button wants to look like one. `max-w-full` is
                 the only guard it needs — the column already keeps it
                 inside the padding. */
              className="group relative mt-1 inline-flex w-auto max-w-full self-center items-center justify-center gap-2.5 rounded-full border border-accent/60 bg-accent/10 px-6 py-3.5 font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-foreground transition-all duration-300 hover:border-accent hover:bg-accent hover:text-accent-ink hover:shadow-lg hover:shadow-accent/20 cursor-pointer sm:px-7 sm:text-xs"
            >
              <svg
                className="h-4 w-4 shrink-0 text-accent group-hover:text-accent-ink transition-colors duration-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>{isTr ? "Özgeçmişi İncele & İndir (PDF)" : "Preview & Download Resume (PDF)"}</span>
            </button>
          </motion.div>

          <ContactForm />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-5% 0px" }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="mt-20"
        >
          <SocialLinks />
        </motion.div>
      </div>

      {/* FULL-SCREEN CV PREVIEW MODAL */}
      <AnimatePresence>
        {isCvModalOpen && (
          <motion.div
            key="cv-modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCvModalOpen(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            {/* Modal Dialog Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ duration: 0.3, ease: EASE }}
              /* dvh, not vh: vh is the URL-bar-hidden height on phones, which
                 pushes the download buttons below the visible area. */
              className="relative z-10 flex h-[92dvh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border hairline bg-surface/95 shadow-2xl backdrop-blur-xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b hairline p-5 sm:p-6 bg-surface/80">
                <div>
                  <h3 className="font-display text-xl font-bold sm:text-2xl">
                    {profile.name} — {isTr ? "Özgeçmiş (CV)" : "Curriculum Vitae"}
                  </h3>
                  <p className="mt-1 text-xs text-muted font-mono">
                    {profile.role} · {profile.location}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCvModalOpen(false)}
                  className="tap-target flex h-10 w-10 shrink-0 items-center justify-center rounded-full border hairline bg-surface/90 text-foreground transition-colors hover:border-accent hover:text-accent"
                  aria-label="Kapat"
                >
                  ✕
                </button>
              </div>

              {/* CV Preview Document View */}
              <div className="my-2 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 bg-black/60 flex items-center justify-center">
                {/* A single known file, so its intrinsic size can be stated
                    outright — that keeps `w-auto` working and the border
                    hugging the page instead of the box. Opened deliberately
                    and read rather than glanced at, so it is served
                    generously; AVIF still lands far under the raw JPEG. */}
                <Image
                  src={`/Mert_Ceren_CV-${cvVersion}.jpg`}
                  alt={`${profile.name} Özgeçmiş CV`}
                  width={1653}
                  height={2339}
                  sizes="(max-width: 1024px) 100vw, 1024px"
                  className="max-h-full w-auto max-w-full object-contain rounded-xl shadow-2xl border hairline"
                />
              </div>

              {/* Footer Actions */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t hairline p-4 sm:px-6 bg-surface/80">
                <span className="text-xs text-muted text-center sm:text-left font-mono">
                  {isTr ? "ESC veya dokunarak kapatabilirsiniz" : "Press ESC or click outside to close"}
                </span>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <a
                    href={`/Mert_Ceren_CV.pdf?v=${cvVersion}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="microlabel tap-target inline-flex items-center gap-2 rounded-full border hairline px-5 py-3 text-xs text-foreground transition-colors hover:border-accent hover:text-accent sm:py-2.5"
                  >
                    <span>{isTr ? "Yeni Sekmede Aç ↗" : "Open in New Tab ↗"}</span>
                  </a>
                  
                  <a
                    href={`/Mert_Ceren_CV.pdf?v=${cvVersion}`}
                    download="Mert_Ceren_CV.pdf"
                    className="microlabel tap-target inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-accent-ink transition-opacity hover:opacity-90 shadow-md shadow-accent/20 sm:py-2.5"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>{isTr ? "PDF İndir 📥" : "Download PDF 📥"}</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
