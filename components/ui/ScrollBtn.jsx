"use client"

import { useEffect, useMemo, useState } from "react"

const ScrollDownBtn = ({
  showIn = "#hero",
  label = "Scroll",
  onScrollUp,
  onScrollDown,
  disableUp = false,
  disableDown = false,
}) => {
  const [isVisible, setIsVisible] = useState(false)

  const selectors = useMemo(
    () =>
      showIn
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    [showIn]
  )

  const alwaysVisible = selectors.length === 0

  useEffect(() => {
    if (alwaysVisible) return undefined

    const targets = selectors
      .map((selector) => document.querySelector(selector))
      .filter(Boolean)

    const updateVisibility = () => {
      const viewportHeight = window.innerHeight
      const active = targets.some((target) => {
        const rect = target.getBoundingClientRect()
        return rect.top >= 0 && rect.top < viewportHeight
      })
      setIsVisible(active)
    }

    requestAnimationFrame(updateVisibility)
    window.addEventListener("scroll", updateVisibility, { passive: true })
    window.addEventListener("resize", updateVisibility)

    return () => {
      window.removeEventListener("scroll", updateVisibility)
      window.removeEventListener("resize", updateVisibility)
    }
  }, [alwaysVisible, selectors])

  const handleScrollUp = () => {
    if (disableUp) {
      return
    }

    if (onScrollUp) {
      onScrollUp()
      return
    }

    window.scrollBy({ top: window.innerHeight * -0.8, behavior: "smooth" })
  }

  const handleScrollDown = () => {
    if (disableDown) {
      return
    }

    if (onScrollDown) {
      onScrollDown()
      return
    }

    window.scrollBy({ top: window.innerHeight * 0.8, behavior: "smooth" })
  }

  const shouldShow = alwaysVisible || isVisible

  return (
    <div
      className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 items-center gap-2 rounded-full bg-white/20 p-1.5 backdrop-blur-3xl md:flex ${
        shouldShow ? "flex" : "hidden"
      }`}
    >
      <span className="font-clash-display rounded-full bg-white px-6 py-2 font-medium">
        {label}
      </span>

      <button
        type="button"
        onClick={handleScrollUp}
        disabled={disableUp}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-white disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Scroll up"
      >
        <img className="w-4 rotate-180" src="/icons/down.svg" alt="" aria-hidden="true" />
      </button>

      <button
        type="button"
        onClick={handleScrollDown}
        disabled={disableDown}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-white disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Scroll down"
      >
        <img className="w-4" src="/icons/down.svg" alt="" aria-hidden="true" />
      </button>
    </div>
  )
}

export default ScrollDownBtn
