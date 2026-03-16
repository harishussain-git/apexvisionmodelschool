"use client"

import { useEffect, useRef } from "react"

export default function SnapPage() {
  const ids = ["sec1", "sec2", "sec3", "sec4"]
  const currentIndexRef = useRef(0)
  const isSnappingRef = useRef(false)

  useEffect(() => {
    const getLenis = () => window.__lenis || window.lenis || null

    const getClosestSectionIndex = () => {
      let closestIndex = 0
      let closestDistance = Infinity
      const currentScroll = window.scrollY

      ids.forEach((id, index) => {
        const el = document.getElementById(id)
        if (!el) return

        const distance = Math.abs(currentScroll - el.offsetTop)

        if (distance < closestDistance) {
          closestDistance = distance
          closestIndex = index
        }
      })

      return closestIndex
    }

    const snapToIndex = (nextIndex) => {
      const lenis = getLenis()
      const targetEl = document.getElementById(ids[nextIndex])

      if (!lenis || !targetEl) return

      isSnappingRef.current = true
      currentIndexRef.current = nextIndex

      lenis.scrollTo(targetEl, {
        duration: 1.2,
        lock: true,
        force: true,
        onComplete: () => {
          isSnappingRef.current = false
        },
      })
    }

    const handleWheel = (e) => {
      const lenis = getLenis()
      if (!lenis) return

      if (isSnappingRef.current) {
        e.preventDefault()
        return
      }

      if (Math.abs(e.deltaY) < 10) return

      const currentIndex = getClosestSectionIndex()
      currentIndexRef.current = currentIndex

      if (e.deltaY > 0) {
        const nextIndex = Math.min(currentIndex + 1, ids.length - 1)
        if (nextIndex !== currentIndex) {
          e.preventDefault()
          snapToIndex(nextIndex)
        }
      } else {
        const nextIndex = Math.max(currentIndex - 1, 0)
        if (nextIndex !== currentIndex) {
          e.preventDefault()
          snapToIndex(nextIndex)
        }
      }
    }

    window.addEventListener("wheel", handleWheel, { passive: false })

    return () => {
      window.removeEventListener("wheel", handleWheel)
    }
  }, [])

  return (
    <div>
      <section
        id="sec1"
        className="flex h-screen items-center justify-center bg-red-500 text-4xl text-white"
      >
        Section 1
      </section>

      <section
        id="sec2"
        className="flex h-screen items-center justify-center bg-blue-500 text-4xl text-white"
      >
        Section 2
      </section>

      <section
        id="sec3"
        className="flex h-screen items-center justify-center bg-green-500 text-4xl text-white"
      >
        Section 3
      </section>

      <section
        id="sec4"
        className="flex h-screen items-center justify-center bg-purple-500 text-4xl text-white"
      >
        Section 4
      </section>
    </div>
  )
}