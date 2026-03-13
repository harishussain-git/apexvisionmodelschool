"use client"

import { useEffect, useRef, useState } from "react"

import {
  getLenis,
  getScrollY,
  getSectionMetrics,
  getTargetElement,
  getTargetY,
  normalizeSnapConfig,
  scrollToY,
} from "@/components/ui/snap-utils"

function createDebugState() {
  return {
    sectionId: "",
    sectionTop: 0,
    sectionHeight: 0,
    viewportHeight: 0,
    maxScrollable: 1,
    scrollY: 0,
    progress: 0,
    direction: "idle",
    isSnapping: false,
    enabled: false,
    upThreshold: 0.08,
    downThreshold: 0.92,
    upTarget: "",
    downTarget: "",
    targetY: null,
    lenisDetected: false,
  }
}

export default function useSectionSnap({ sectionRef, snapConfig, debug = false }) {
  const [debugState, setDebugState] = useState(createDebugState)

  const isSnappingRef = useRef(false)
  const lastSnapAtRef = useRef(0)
  const unlockTimeoutRef = useRef(null)
  const lastScrollYRef = useRef(0)
  const wheelDirectionRef = useRef("idle")
  const downTriggeredRef = useRef(false)
  const upTriggeredRef = useRef(false)

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined
    }

    const updateSnapState = (scrollYInput) => {
      const section = sectionRef?.current
      const normalizedConfig = normalizeSnapConfig(snapConfig)
      const currentScrollY = typeof scrollYInput === "number" ? scrollYInput : getScrollY()

      if (!section) {
        if (debug) {
          setDebugState((previous) => ({
            ...previous,
            enabled: normalizedConfig.enabled,
            upThreshold: normalizedConfig.up.threshold,
            downThreshold: normalizedConfig.down.threshold,
            upTarget: normalizedConfig.up.target,
            downTarget: normalizedConfig.down.target,
            scrollY: currentScrollY,
            isSnapping: isSnappingRef.current,
            lenisDetected: Boolean(getLenis()),
          }))
        }
        return
      }

      const metrics = getSectionMetrics(section, currentScrollY)
      const previousScrollY = lastScrollYRef.current

      let direction = wheelDirectionRef.current
      if (metrics.scrollY > previousScrollY) {
        direction = "down"
      } else if (metrics.scrollY < previousScrollY) {
        direction = "up"
      }

      lastScrollYRef.current = metrics.scrollY

      if (metrics.progress < normalizedConfig.down.threshold) {
        downTriggeredRef.current = false
      }

      if (metrics.progress > normalizedConfig.up.threshold) {
        upTriggeredRef.current = false
      }

      const activeTarget =
        direction === "up" ? normalizedConfig.up.target : normalizedConfig.down.target
      const resolvedTargetY = activeTarget ? getTargetY(activeTarget) : null

      if (debug) {
        setDebugState({
          sectionId: section.id || "",
          sectionTop: metrics.sectionTop,
          sectionHeight: metrics.sectionHeight,
          viewportHeight: metrics.viewportHeight,
          maxScrollable: metrics.maxScrollable,
          scrollY: metrics.scrollY,
          progress: metrics.progress,
          direction,
          isSnapping: isSnappingRef.current,
          enabled: normalizedConfig.enabled,
          upThreshold: normalizedConfig.up.threshold,
          downThreshold: normalizedConfig.down.threshold,
          upTarget: normalizedConfig.up.target,
          downTarget: normalizedConfig.down.target,
          targetY: resolvedTargetY,
          lenisDetected: Boolean(getLenis()),
        })
      }

      if (!normalizedConfig.enabled || isSnappingRef.current) {
        return
      }

      const now = Date.now()
      if (now - lastSnapAtRef.current < normalizedConfig.cooldownMs) {
        return
      }

      const shouldSnapDown =
        direction === "down" &&
        normalizedConfig.down.target &&
        metrics.progress >= normalizedConfig.down.threshold &&
        !downTriggeredRef.current

      const shouldSnapUp =
        direction === "up" &&
        normalizedConfig.up.target &&
        metrics.progress <= normalizedConfig.up.threshold &&
        !upTriggeredRef.current

      if (!shouldSnapDown && !shouldSnapUp) {
        return
      }

      const target = shouldSnapDown ? normalizedConfig.down.target : normalizedConfig.up.target
      const targetElement = getTargetElement(target)
      if (!targetElement || targetElement === section) {
        return
      }

      const targetY = getTargetY(target)
      if (typeof targetY !== "number") {
        return
      }

      const didScroll = scrollToY(targetY, { lenis: getLenis() })
      if (!didScroll) {
        return
      }

      isSnappingRef.current = true
      lastSnapAtRef.current = now

      if (shouldSnapDown) {
        downTriggeredRef.current = true
      }

      if (shouldSnapUp) {
        upTriggeredRef.current = true
      }

      if (debug) {
        setDebugState((previous) => ({
          ...previous,
          targetY,
          isSnapping: true,
        }))
      }

      window.clearTimeout(unlockTimeoutRef.current)
      unlockTimeoutRef.current = window.setTimeout(() => {
        isSnappingRef.current = false

        if (debug) {
          setDebugState((previous) => ({
            ...previous,
            isSnapping: false,
          }))
        }
      }, normalizedConfig.cooldownMs)
    }

    const handleWheel = (event) => {
      if (event.deltaY > 0) {
        wheelDirectionRef.current = "down"
      } else if (event.deltaY < 0) {
        wheelDirectionRef.current = "up"
      }
    }

    const handleScrollSignal = () => {
      updateSnapState(getScrollY())
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

    window.addEventListener("wheel", handleWheel, { passive: true })
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
  }, [debug, sectionRef, snapConfig])

  return { debugState }
}
