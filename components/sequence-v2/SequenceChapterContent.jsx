"use client"

import CloudTextSection from "@/components/home/CloudTextSection"
import HeroSection from "@/components/home/HeroSection"
import SchoolFrontSection from "@/components/home/SchoolFrontSection"

function FeatureCard({ item }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/8 p-4 backdrop-blur-sm">
      <p className="text-sm font-medium text-white/90">{item}</p>
    </div>
  )
}

function FeatureChapterContent({ content = {} }) {
  return (
    <div className="flex h-full items-center px-6 py-10 sm:px-10 lg:px-16">
      <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,360px)] lg:items-end">
        <div className="max-w-2xl">
          {content.eyebrow && (
            <p className="mb-4 text-xs uppercase tracking-[0.24em] text-white/70 sm:text-sm">
              {content.eyebrow}
            </p>
          )}

          <h2 className="text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
            {content.title}
          </h2>

          {content.description && (
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/82 sm:text-lg">
              {content.description}
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-4">
            {content.buttonText && (
              <a
                href={content.buttonHref || "#"}
                className="inline-flex min-h-11 items-center rounded-full bg-white px-6 py-3 text-sm font-medium text-neutral-950 transition hover:bg-white/90"
              >
                {content.buttonText}
              </a>
            )}
          </div>
        </div>

        <div className="grid gap-3">
          {content.items?.map((item) => (
            <FeatureCard key={item} item={item} />
          ))}
        </div>
      </div>
    </div>
  )
}

function renderAnchorContent(anchor) {
  if (!anchor) {
    return null
  }

  if (anchor.type === "feature" || anchor.contentType === "feature") {
    return <FeatureChapterContent content={anchor.content} />
  }

  if (anchor.contentType === "hero") {
    return <HeroSection overlay content={anchor.content} />
  }

  if (anchor.contentType === "cloudtext") {
    return <CloudTextSection overlay content={anchor.content} />
  }

  if (anchor.contentType === "school-front") {
    return <SchoolFrontSection overlay content={anchor.content} />
  }

  return null
}

function AnchorsChapterContent({ anchors = [], activeBeatId }) {
  return (
    <div className="relative h-full min-h-screen">
      {anchors.map((anchor) => (
        <div
          key={anchor.id}
          className={`absolute inset-0 transition-all duration-500 ease-out ${
            activeBeatId === anchor.id
              ? "pointer-events-auto opacity-100 translate-y-0"
              : "pointer-events-none opacity-0 translate-y-4"
          }`}
        >
          {renderAnchorContent(anchor)}
        </div>
      ))}
    </div>
  )
}

export default function SequenceChapterContent({ chapter, activeBeatId }) {
  if (!chapter) {
    return null
  }

  if (chapter.anchors?.length) {
    return (
      <div className="h-full">
        <div className="mx-auto h-full max-w-7xl">
          <AnchorsChapterContent anchors={chapter.anchors} activeBeatId={activeBeatId} />
        </div>
      </div>
    )
  }

  return renderAnchorContent(chapter)
}
