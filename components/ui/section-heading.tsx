"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

/* label and meta take nodes, not just strings: this header is uppercased by
   CSS, which applies the Turkish rule on these pages, so a heading holding an
   English brand needs that run wrapped in lang="en". See lib/foreign. */
type SectionHeadingProps = {
  index: string;
  label: ReactNode;
  meta?: ReactNode;
  className?: string;
};

/**
 * Editorial section header: hairline rule, mono index + label,
 * optional right-aligned meta.
 */
export function SectionHeading({ index, label, meta, className }: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.8 }}
      className={cn("border-t hairline pt-4", className)}
    >
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="microlabel">
          <span className="text-accent">{index}</span>
          <span className="mx-3 select-none" aria-hidden>
            —
          </span>
          {label}
        </h2>
        {meta && <p className="microlabel hidden sm:block">{meta}</p>}
      </div>
    </motion.div>
  );
}
