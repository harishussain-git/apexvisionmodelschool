"use client"

import { useEffect, useMemo, useState } from "react"

import ScrollBtn from "@/components/ui/ScrollBtn"
import { getLenis, getScrollY, getTargetY, scrollToY } from "@/components/ui/snap-utils"
import { getActivePageSectionState, normalizePageSections } from "@/lib/page-section-utils"

export default function PageSectionControls({ sections = [], showIn = "" }) {
  const normalizedSections = useMemo(() => normalizePageSections(sections), [sections])
  const [activeTarget, setActiveTarget] = useState(normalizedSections[0]?.target ?? "")

  useEffect(() => {
    if (typeof window === "undefined" || !normalizedSections.length) {
      return undefined
    }

    const updateActiveSection = (scrollYInput) => {
      const currentScrollY = typeof scrollYInput === "number" ? scrollYInput : getScrollY()
      const activeState = getActivePageSectionState(normalizedSections, currentScrollY)
      setActiveTarget(activeState?.config?.target ?? "")
    }

    const handleScroll = () => {
      updateActiveSection(getScrollY())
    }

    const handleResize = () => {
      updateActiveSection(getScrollY())
    }

    const lenis = getLenis()
    let unsubscribeLenis = null

    if (lenis && typeof lenis.on === "function") {
      const onLenisScroll = (event) => {
        const eventScroll =
          typeof event?.animatedScroll === "number"
            ? event.animatedScroll
            : typeof event?.scroll === "number"
              ? event.scroll
              : getScrollY()

        updateActiveSection(eventScroll)
      }

      lenis.on("scroll", onLenisScroll)
      unsubscribeLenis = () => {
        if (typeof lenis.off === "function") {
          lenis.off("scroll", onLenisScroll)
        }
      }
    }

    updateActiveSection(getScrollY())
    window.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("resize", handleResize)
    window.addEventListener("orientationchange", handleResize)
    window.visualViewport?.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("orientationchange", handleResize)
      window.visualViewport?.removeEventListener("resize", handleResize)

      if (unsubscribeLenis) {
        unsubscribeLenis()
      }
    }
  }, [normalizedSections])

  const activeIndex = normalizedSections.findIndex((section) => section.target === activeTarget)
  const activeSection = activeIndex >= 0 ? normalizedSections[activeIndex] : normalizedSections[0]
  const previousSection = activeIndex > 0 ? normalizedSections[activeIndex - 1] : null
  const nextSection =
    activeIndex >= 0 && activeIndex < normalizedSections.length - 1
      ? normalizedSections[activeIndex + 1]
      : null

  const goToSection = (section) => {
    if (!section) {
      return
    }

    const targetY = getTargetY(section.target)
    if (typeof targetY !== "number") {
      return
    }

    scrollToY(targetY, {
      lenis: getLenis(),
      lenisOptions: {
        duration: section.lenisDuration,
        lock: true,
        force: true,
      },
    })
  }

  return (
    <ScrollBtn
      showIn={showIn}
      label={activeSection?.label || "Scroll"}
      onScrollUp={() => goToSection(previousSection)}
      onScrollDown={() => goToSection(nextSection)}
      disableUp={!previousSection}
      disableDown={!nextSection}
    />
  )
}
