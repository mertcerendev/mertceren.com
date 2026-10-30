"use client";

import Link from "next/link";
import { useContent, useLocale } from "@/components/providers/locale-provider";
import { localePath } from "@/lib/content";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProjectCard } from "@/components/ui/project-card";
import { Magnetic } from "@/components/ui/magnetic-button";

export function Works() {
  const locale = useLocale();
  const { projects, ui } = useContent();

  return (
    <section id="work" className="px-5 py-24 sm:px-8 sm:py-32 lg:px-12">
      <SectionHeading
        index="01"
        label={ui.sections.work.label}
        meta={`${projects.length} ${ui.sections.work.metaSuffix}`}
      />

      <div className="mt-8">
        {projects.map((project, i) => (
          <ProjectCard key={project.slug} project={project} index={i} />
        ))}
      </div>

      {/* The way out of the stack — /work was reachable only by typing the
          URL before this.

          Pulled up into dead space rather than pushed down. Each card is
          80svh centred in a full-viewport sticky wrapper, so the last
          wrapper ends in an empty band the link was sitting below:

            band = (H − max(0.8H, 520)) / 2 + 0.04H − 52

          (the last two terms are the card's own `top: calc(-4svh +
          index*26px)` nudge). That grows with H — 62px at 812 tall, 130 at
          1300 — and a pull sized as a flat fraction of svh grows with it
          only a little slower, so on a large monitor the gap this used to
          leave was still large: a 3svh pull at 1300 tall left ~100px above
          the link on top of the fixed 256px below it, which is most of a
          screenshot's worth of empty black.

          Solved for directly instead of approximated: this margin cancels
          `band(H)` exactly and adds back a flat 64px, so the gap above the
          link is 64px at *every* height from here up — 720, 812, 1300,
          whatever a 4K monitor reports — rather than a fraction that keeps
          growing. Below 720px tall the band itself is already small
          (12–49px) and closer to the floor a 64px target would have to
          push through, so that range keeps the plain 8px margin instead.

          No rule above it either, which would have separated it from the
          work it belongs to and put a second horizontal line a short way
          above the one the next section's heading opens with. */}
      <div className="mt-2 flex justify-center [@media(min-height:720px)]:mt-[calc(116px_-_14svh)]">
        <Magnetic strength={0.35}>
          <Link
            href={localePath(locale, "/work")}
            className="group inline-flex items-baseline gap-4 font-display text-display-md font-extrabold uppercase leading-none tracking-tight transition-colors duration-300 hover:text-accent"
          >
            {ui.workIndex.allProjects}
            <span
              aria-hidden
              className="text-2xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-2"
            >
              →
            </span>
          </Link>
        </Magnetic>
      </div>
    </section>
  );
}
