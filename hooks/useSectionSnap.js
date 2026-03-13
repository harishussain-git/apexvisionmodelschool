"use client"

import { useEffect, useRef } from "react"

import {
  clamp01,
  getLenisInstance,
  getLenisScrollY,
  normalizeSectionSelector,
  scrollToTarget,
} from "@/lib/sectionSnap"

function readSourceValue(source, fallback = 0) {
  if (typeof source === "function") {
    const value = source()
    return typeof value === "number" ? value : fallback
  }

  if (source && typeof source === "object" && "current" in source) {
    return typeof source.current === "number" ? source.current : fallback
  }

  return typeof source === "number" ? source : fallback
}

export default function useSectionSnap({
  sectionRef,
  snapConfig,
  progress,
  scrollY,
  offset = 0,
}) {
  const isSnappingRef = useRef(false)
  const lastSnapTimeRef = useRef(0)
  const previousScrollYRef = useRef(0)
  const timeoutRef = useRef(null)
  const downTriggeredRef = useRef(false)
  const upTriggeredRef = useRef(false)

  useEffect(() => {
    const enabled = Boolean(snapConfig?.enabled)
    if (!enabled) return

    const cooldownMs = Math.max(0, snapConfig?.cooldownMs ?? 900)
    const downThreshold = clamp01(snapConfig?.down?.threshold ?? 1)
    const upThreshold = clamp01(snapConfig?.up?.threshold ?? 0)

    previousScrollYRef.current = readSourceValue(scrollY, getLenisScrollY())

    const checkSnap = () => {
      const section = sectionRef?.current
      if (!section) return

      const currentProgress = clamp01(readSourceValue(progress, 0))
      const currentScrollY = readSourceValue(scrollY, getLenisScrollY())
      const previousScrollY = previousScrollYRef.current

      let direction = null
      if (currentScrollY > previousScrollY) direction = "down"
      if (currentScrollY < previousScrollY) direction = "up"

      previousScrollYRef.current = currentScrollY

      if (currentProgress < downThreshold) {
        downTriggeredRef.current = false
      }

      if (currentProgress > upThreshold) {
        upTriggeredRef.current = false
      }

      if (!direction || isSnappingRef.current) return

      const now = Date.now()
      if (now - lastSnapTimeRef.current < cooldownMs) return

      if (
        direction === "down" &&
        snapConfig?.down?.target &&
        currentProgress >= downThreshold &&
        !downTriggeredRef.current
      ) {
        const target = normalizeSectionSelector(snapConfig.down.target)
        if (!target) return

        const didScroll = scrollToTarget(target, getLenisInstance(), offset)
        if (!didScroll) return

        downTriggeredRef.current = true
        isSnappingRef.current = true
        lastSnapTimeRef.current = now

        window.clearTimeout(timeoutRef.current)
        timeoutRef.current = window.setTimeout(() => {
          isSnappingRef.current = false
        }, cooldownMs)
      }

      if (
        direction === "up" &&
        snapConfig?.up?.target &&
        currentProgress <= upThreshold &&
        !upTriggeredRef.current
      ) {
        const target = normalizeSectionSelector(snapConfig.up.target)
        if (!target) return

        const didScroll = scrollToTarget(target, getLenisInstance(), offset)
        if (!didScroll) return

        upTriggeredRef.current = true
        isSnappingRef.current = true
        lastSnapTimeRef.current = now

        window.clearTimeout(timeoutRef.current)
        timeoutRef.current = window.setTimeout(() => {
          isSnappingRef.current = false
        }, cooldownMs)
      }
    }

    const lenis = getLenisInstance()
    let unsubscribeLenis = null

    if (lenis && typeof lenis.on === "function") {
      const onLenisScroll = () => {
        checkSnap()
      }

      lenis.on("scroll", onLenisScroll)
      unsubscribeLenis = () => {
        if (typeof lenis.off === "function") {
          lenis.off("scroll", onLenisScroll)
        }
      }
    }

    window.addEventListener("scroll", checkSnap, { passive: true })
    window.addEventListener("resize", checkSnap)
    window.addEventListener("orientationchange", checkSnap)
    window.visualViewport?.addEventListener("resize", checkSnap)

    return () => {
      window.removeEventListener("scroll", checkSnap)
      window.removeEventListener("resize", checkSnap)
      window.removeEventListener("orientationchange", checkSnap)
      window.visualViewport?.removeEventListener("resize", checkSnap)
      window.clearTimeout(timeoutRef.current)
      if (unsubscribeLenis) unsubscribeLenis()
    }
  }, [offset, progress, scrollY, sectionRef, snapConfig])
}
