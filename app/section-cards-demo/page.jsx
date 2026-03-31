"use client"

import ExpandableSectionCards from "@/components/ui/ExpandableSectionCards"

const SECTION_CARD_ITEMS = [
  {
    id: "hero",
    eyebrow: "Introduction",
    title: "Digital Infrastructure",
    description: "A clean section card that expands only for the active section.",
    ctaLabel: "Learn more",
    ctaHref: "#hero",
  },
  {
    id: "platform",
    eyebrow: "Platform",
    title: "Connected Product Layers",
    description: "The floating card updates with each active section while the page scrolls normally.",
    ctaLabel: "View platform",
    ctaHref: "#platform",
  },
  {
    id: "workflow",
    eyebrow: "Workflow",
    title: "Sections With Clear Rhythm",
    description: "Desktop expands automatically after a short delay. Mobile keeps expansion manual and simple.",
    ctaLabel: "See workflow",
    ctaHref: "#workflow",
  },
  {
    id: "results",
    eyebrow: "Results",
    title: "Compact Premium Layer",
    description: "Only one card is active at a time, with subtle motion and a removable implementation.",
    ctaLabel: "See results",
    ctaHref: "#results",
  },
]

const SECTION_STYLES = [
  "bg-[radial-gradient(circle_at_top,_rgba(120,182,255,0.16),_transparent_45%),linear-gradient(180deg,_#071019_0%,_#091724_100%)]",
  "bg-[radial-gradient(circle_at_top_left,_rgba(61,173,140,0.16),_transparent_42%),linear-gradient(180deg,_#0a1514_0%,_#0f1f1d_100%)]",
  "bg-[radial-gradient(circle_at_top_right,_rgba(255,173,92,0.14),_transparent_40%),linear-gradient(180deg,_#17110b_0%,_#201710_100%)]",
  "bg-[radial-gradient(circle_at_top,_rgba(214,120,255,0.14),_transparent_42%),linear-gradient(180deg,_#130d1c_0%,_#1a1226_100%)]",
]

export default function SectionCardsDemoPage() {
  return (
    <main className="relative bg-neutral-950 text-white">
      <ExpandableSectionCards
        items={SECTION_CARD_ITEMS}
        expandDelay={420}
        desktopOnlyAutoExpand
        cardPosition="right"
      />

      {SECTION_CARD_ITEMS.map((item, index) => (
        <section
          key={item.id}
          id={item.id}
          className={`flex min-h-screen items-center justify-center px-6 py-24 text-center ${SECTION_STYLES[index % SECTION_STYLES.length]}`}
        >
          <div className="max-w-4xl">
            <p className="font-accent text-sm uppercase tracking-[0.26em] text-white/55">
              {item.eyebrow}
            </p>
            <h1 className="mt-6 font-accent text-5xl leading-none text-white sm:text-7xl">
              {item.title}
            </h1>
          </div>
        </section>
      ))}
    </main>
  )
}
