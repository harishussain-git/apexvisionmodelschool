"use client"

import { useEffect, useState } from "react"

export default function useActiveSection(sectionIds = [], options = {}) {
  const {
    root = null,
    rootMargin = "-35% 0px -35% 0px",
    threshold = [0.2, 0.4, 0.6, 0.8],
  } = options

  const [activeSectionId, setActiveSectionId] = useState(sectionIds[0] ?? "")

  useEffect(() => {
    if (!sectionIds.length) {
      return undefined
    }

    const sectionElements = sectionIds
      .map((sectionId) => document.getElementById(sectionId))
      .filter(Boolean)

    if (!sectionElements.length) {
      return undefined
    }

    if (typeof window === "undefined" || typeof window.IntersectionObserver !== "function") {
      return undefined
    }

    const visibleRatios = new Map()

    const updateActiveSection = () => {
      let bestId = sectionIds[0] ?? ""
      let bestRatio = -1

      sectionIds.forEach((sectionId) => {
        const ratio = visibleRatios.get(sectionId) ?? 0

        if (ratio > bestRatio) {
          bestRatio = ratio
          bestId = sectionId
        }
      })

      setActiveSectionId((currentId) => (currentId === bestId ? currentId : bestId))
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visibleRatios.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0)
        })

        updateActiveSection()
      },
      {
        root,
        rootMargin,
        threshold,
      }
    )

    sectionElements.forEach((sectionElement) => {
      visibleRatios.set(sectionElement.id, 0)
      observer.observe(sectionElement)
    })

    window.requestAnimationFrame(updateActiveSection)

    return () => {
      observer.disconnect()
    }
  }, [root, rootMargin, sectionIds, threshold])

  return activeSectionId || sectionIds[0] || ""
}
