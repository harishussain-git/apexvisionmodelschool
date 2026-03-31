"use client"

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

export function normalizeTarget(target) {
  if (typeof target !== "string") {
    return ""
  }

  const trimmed = target.trim()
  if (!trimmed) {
    return ""
  }

  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`
}

export function getTargetElement(target) {
  if (typeof window === "undefined") {
    return null
  }

  if (target instanceof Element) {
    return target
  }

  const normalizedTarget = normalizeTarget(target)
  if (!normalizedTarget) {
    return null
  }

  return document.querySelector(normalizedTarget)
}

export function getTargetY(target) {
  const targetElement = getTargetElement(target)
  if (!targetElement) {
    return null
  }

  return targetElement.getBoundingClientRect().top + window.scrollY
}

export function getLenis() {
  if (typeof window === "undefined") {
    return null
  }

  return window.__lenis || window.lenis || null
}

export function getScrollY() {
  const lenis = getLenis()

  if (lenis && typeof lenis.animatedScroll === "number") {
    return lenis.animatedScroll
  }

  if (lenis && typeof lenis.scroll === "number") {
    return lenis.scroll
  }

  return typeof window === "undefined" ? 0 : window.scrollY
}

export function getSectionMetrics(section, scrollY = getScrollY()) {
  if (!section || typeof window === "undefined") {
    return {
      sectionTop: 0,
      sectionHeight: 0,
      viewportHeight: 0,
      maxScrollable: 1,
      scrollY: 0,
      progress: 0,
    }
  }

  const sectionTop = section.getBoundingClientRect().top + window.scrollY
  const sectionHeight = section.offsetHeight
  const viewportHeight = window.innerHeight
  // Short full-screen sections still need a usable progress range for snap thresholds.
  const maxScrollable = Math.max(1, viewportHeight, sectionHeight - viewportHeight)
  const progress = clamp((scrollY - sectionTop) / maxScrollable, 0, 1)

  return {
    sectionTop,
    sectionHeight,
    viewportHeight,
    maxScrollable,
    scrollY,
    progress,
  }
}

export function normalizeSnapConfig(snapConfig) {
  const enabled = Boolean(snapConfig?.enabled)
  const cooldownMs = Math.max(0, snapConfig?.cooldownMs ?? 900)
  const upThreshold = clamp(snapConfig?.up?.threshold ?? 0.08, 0, 1)
  const downThreshold = clamp(snapConfig?.down?.threshold ?? 0.92, 0, 1)
  const upTarget = normalizeTarget(snapConfig?.up?.target)
  const downTarget = normalizeTarget(snapConfig?.down?.target)

  return {
    enabled,
    cooldownMs,
    up: {
      threshold: upThreshold,
      target: upTarget,
    },
    down: {
      threshold: downThreshold,
      target: downTarget,
    },
  }
}

export function scrollToY(y, options = {}) {
  if (typeof window === "undefined" || typeof y !== "number" || Number.isNaN(y)) {
    return false
  }

  const lenis = options.lenis || getLenis()

  if (lenis && typeof lenis.scrollTo === "function") {
    try {
      lenis.scrollTo(y, {
        duration: 1,
        lock: true,
        force: true,
        ...options.lenisOptions,
      })
      return true
    } catch {
      // Fall through to native smooth scrolling.
    }
  }

  window.scrollTo({
    top: y,
    behavior: "smooth",
  })

  return true
}
