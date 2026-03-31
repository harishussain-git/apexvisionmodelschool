"use client"

import { useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

import useActiveSection from "@/components/ui/useActiveSection"

const DESKTOP_QUERY = "(min-width: 1024px)"

export default function ExpandableSectionCards({
  items = [],
  expandDelay = 400,
  desktopOnlyAutoExpand = true,
  cardPosition = "right",
  className = "",
}) {
  const sectionIds = useMemo(() => items.map((item) => item.id), [items])
  const activeSectionId = useActiveSection(sectionIds)
  const activeItem = items.find((item) => item.id === activeSectionId) ?? items[0] ?? null

  const [isDesktop, setIsDesktop] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined
    }

    const mediaQuery = window.matchMedia(DESKTOP_QUERY)

    const updateDesktopState = () => {
      setIsDesktop(mediaQuery.matches)
    }

    updateDesktopState()
    mediaQuery.addEventListener("change", updateDesktopState)

    return () => {
      mediaQuery.removeEventListener("change", updateDesktopState)
    }
  }, [])

  useEffect(() => {
    if (!activeItem) {
      return undefined
    }

    const collapseFrameId = window.requestAnimationFrame(() => {
      setIsExpanded(false)
    })

    const shouldAutoExpand = desktopOnlyAutoExpand ? isDesktop : true
    if (!shouldAutoExpand) {
      return () => {
        window.cancelAnimationFrame(collapseFrameId)
      }
    }

    const timerId = window.setTimeout(() => {
      setIsExpanded(true)
    }, expandDelay)

    return () => {
      window.cancelAnimationFrame(collapseFrameId)
      window.clearTimeout(timerId)
    }
  }, [activeItem, desktopOnlyAutoExpand, expandDelay, isDesktop])

  if (!activeItem) {
    return null
  }

  const isMobileManual = desktopOnlyAutoExpand && !isDesktop
  const positionClass = cardPosition === "left" ? "left-4 lg:left-8" : "right-4 lg:right-8"

  return (
    <div className={`pointer-events-none fixed bottom-4 z-40 ${positionClass} ${className}`}>
      <motion.div
        layout
        initial={false}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-auto w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-white/15 bg-black/50 p-4 text-white shadow-[0_16px_48px_rgba(0,0,0,0.28)] backdrop-blur-xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-accent text-[11px] uppercase tracking-[0.22em] text-white/55">
              {activeItem.eyebrow}
            </p>
            <h2 className="mt-2 font-accent text-xl leading-tight text-white">
              {activeItem.title}
            </h2>
          </div>

          {isMobileManual && (
            <button
              type="button"
              onClick={() => setIsExpanded((currentState) => !currentState)}
              className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/15"
            >
              {isExpanded ? "Less" : "Expand"}
            </button>
          )}
        </div>

        <AnimatePresence initial={false} mode="wait">
          {isExpanded && (
            <motion.div
              key={activeItem.id}
              initial={{ opacity: 0, y: 10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: 8, height: 0 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <p className="mt-4 text-sm leading-6 text-white/75">
                {activeItem.description}
              </p>

              {activeItem.ctaLabel && activeItem.ctaHref && (
                <motion.a
                  href={activeItem.ctaHref}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.22, delay: 0.04 }}
                  className="mt-4 inline-flex items-center rounded-full border border-white/15 bg-white px-4 py-2 text-sm font-medium text-neutral-950"
                >
                  {activeItem.ctaLabel}
                </motion.a>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
