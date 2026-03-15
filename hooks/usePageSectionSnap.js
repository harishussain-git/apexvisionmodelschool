"use client"

import { useEffect, useMemo, useRef } from "react"

import { getLenis, getScrollY, getTargetElement, getTargetY, scrollToY } from "@/components/ui/snap-utils"
import { getActivePageSectionState, normalizePageSections } from "@/lib/page-section-utils"



export default function usePageSectionSnap({ sections = [] }) {
  const normalizedSections = useMemo(() => normalizePageSections(sections), [sections])
  const isSnappingRef = useRef(false)
  const lastSnapAtRef = useRef(0)
  const unlockTimeoutRef = useRef(null)
  const lastScrollYRef = useRef(0)
  const wheelDirectionRef = useRef("idle")
  const triggerStateRef = useRef(new Map())

  useEffect(() => {
    if (typeof window === "undefined" || !normalizedSections.length) {
      return undefined
    }

    const getTriggerState = (target) => {
      // Keep per-section trigger flags so one threshold crossing only snaps once
      // until the user moves back away from that edge.
      if (!triggerStateRef.current.has(target)) {
        triggerStateRef.current.set(target, { up: false, down: false })
      }

      return triggerStateRef.current.get(target)
    }

    const updateSnapState = (scrollYInput) => {
      const currentScrollY = typeof scrollYInput === "number" ? scrollYInput : getScrollY()
      const activeSectionState = getActivePageSectionState(normalizedSections, currentScrollY)

      if (!activeSectionState) {
        return
      }

      const { config, metrics } = activeSectionState
      const triggerState = getTriggerState(config.target)
      const currentDirection = wheelDirectionRef.current

      if (metrics.progress < config.downThreshold) {
        triggerState.down = false
      }

      if (metrics.progress > config.upThreshold) {
        triggerState.up = false
      }

      if (!config.enabled || isSnappingRef.current) {
        return
      }

      const now = Date.now()
      if (now - lastSnapAtRef.current < config.cooldownMs) {
        return
      }

      const shouldSnapDown =
        currentDirection === "down" &&
        config.downTarget &&
        metrics.progress >= config.downThreshold &&
        !triggerState.down

      const shouldSnapUp =
        currentDirection === "up" &&
        config.upTarget &&
        metrics.progress <= config.upThreshold &&
        !triggerState.up

      if (!shouldSnapDown && !shouldSnapUp) {
        return
      }

      const target = shouldSnapDown ? config.downTarget : config.upTarget
      const targetElement = getTargetElement(target)

      if (!targetElement || targetElement === activeSectionState.element) {
        return
      }

      const targetY = getTargetY(target)
      if (typeof targetY !== "number") {
        return
      }

      const didScroll = scrollToY(targetY, {
        lenis: getLenis(),
        lenisOptions: {
          // Locking here prevents wheel spam from fighting the snap animation.
          duration: config.lenisDuration,
          lock: true,
          force: true,
        },
      })

      if (!didScroll) {
        return
      }

      isSnappingRef.current = true
      lastSnapAtRef.current = now

      if (shouldSnapDown) {
        triggerState.down = true
      }

      if (shouldSnapUp) {
        triggerState.up = true
      }

      window.clearTimeout(unlockTimeoutRef.current)
      unlockTimeoutRef.current = window.setTimeout(() => {
        isSnappingRef.current = false
      }, config.cooldownMs)
    }

    const handleWheel = (event) => {
      if (event.deltaY > 0) {
        wheelDirectionRef.current = "down"
      } else if (event.deltaY < 0) {
        wheelDirectionRef.current = "up"
      }

      if (isSnappingRef.current) {
        event.preventDefault()
      }
    }

    const handleScrollSignal = () => {
      const currentScrollY = getScrollY()

      if (currentScrollY > lastScrollYRef.current) {
        wheelDirectionRef.current = "down"
      } else if (currentScrollY < lastScrollYRef.current) {
        wheelDirectionRef.current = "up"
      }

      lastScrollYRef.current = currentScrollY
      updateSnapState(currentScrollY)
    }

    const handleResizeSignal = () => {
      updateSnapState(getScrollY())
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

        lastScrollYRef.current = eventScroll
        updateSnapState(eventScroll)
      }

      lenis.on("scroll", onLenisScroll)
      unsubscribeLenis = () => {
        if (typeof lenis.off === "function") {
          lenis.off("scroll", onLenisScroll)
        }
      }
    }

    lastScrollYRef.current = getScrollY()
    updateSnapState(lastScrollYRef.current)

    window.addEventListener("wheel", handleWheel, { passive: false })
    window.addEventListener("scroll", handleScrollSignal, { passive: true })
    window.addEventListener("resize", handleResizeSignal)
    window.addEventListener("orientationchange", handleResizeSignal)
    window.visualViewport?.addEventListener("resize", handleResizeSignal)

    return () => {
      window.removeEventListener("wheel", handleWheel)
      window.removeEventListener("scroll", handleScrollSignal)
      window.removeEventListener("resize", handleResizeSignal)
      window.removeEventListener("orientationchange", handleResizeSignal)
      window.visualViewport?.removeEventListener("resize", handleResizeSignal)
      window.clearTimeout(unlockTimeoutRef.current)

      if (unsubscribeLenis) {
        unsubscribeLenis()
      }
    }
  }, [normalizedSections])
}



