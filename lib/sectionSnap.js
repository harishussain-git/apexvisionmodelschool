"use client"

export function clamp01(value) {
  return Math.min(1, Math.max(0, value))
}

export function normalizeSectionSelector(target) {
  if (typeof target !== "string") return ""

  const trimmed = target.trim()
  if (!trimmed) return ""

  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`
}

export function getTargetElement(target) {
  if (!target) return null

  if (target instanceof Element) {
    return target
  }

  const selector = normalizeSectionSelector(target)
  if (!selector) return null

  return document.querySelector(selector)
}

export function getLenisInstance() {
  return window.__lenis || window.lenis || null
}

export function getLenisScrollY() {
  const lenis = getLenisInstance()

  if (lenis && typeof lenis.animatedScroll === "number") {
    return lenis.animatedScroll
  }

  if (lenis && typeof lenis.scroll === "number") {
    return lenis.scroll
  }

  return window.scrollY
}

export function scrollToTarget(target, lenis = getLenisInstance(), offset = 0) {
  const targetElement = getTargetElement(target)
  if (!targetElement) return false

  if (lenis && typeof lenis.scrollTo === "function") {
    try {
      lenis.scrollTo(targetElement, {
        offset,
        duration: 1,
        lock: true,
        force: true,
      })
      return true
    } catch {
      // Fall back to native smooth scroll if Lenis options differ.
    }
  }

  const targetTop = targetElement.getBoundingClientRect().top + window.scrollY + offset
  window.scrollTo({
    top: targetTop,
    behavior: "smooth",
  })
  return true
}
