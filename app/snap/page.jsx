"use client"

import { useEffect, useMemo, useRef, useState } from "react"

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function SequenceBlock({
  id,
  folder,
  frameCount,
  sectionClassName,
  overlayLabel,
  onDebugChange,
}) {
  const sectionRef = useRef(null)
  const canvasRef = useRef(null)
  const imagesRef = useRef([])
  const loadedRef = useRef([])
  const rafRef = useRef(null)

  const [loadedCount, setLoadedCount] = useState(0)

  useEffect(() => {
    let cancelled = false
    const images = new Array(frameCount)
    const loaded = new Array(frameCount).fill(false)
    let count = 0


    for (let i = 0; i < frameCount; i += 1) {
      const img = new Image()
      const frameNumber = i // this matches 0.jpg, 1.jpg, 2.jpg ...
      img.onload = () => {
        if (cancelled) return
        images[i] = img
        loaded[i] = true
        count += 1
        setLoadedCount(count)
      }
      img.onerror = () => {
        if (cancelled) return
        count += 1
        setLoadedCount(count)
      }
      img.src = `/sequences/${folder}/${frameNumber}.jpg`
    }

    imagesRef.current = images
    loadedRef.current = loaded

    return () => {
      cancelled = true
    }
  }, [folder, frameCount])

  useEffect(() => {
    const drawImageCover = (img) => {
      const canvas = canvasRef.current
      if (!canvas || !img) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const dpr = window.devicePixelRatio || 1
      const width = Math.max(1, Math.floor(canvas.clientWidth * dpr))
      const height = Math.max(1, Math.floor(canvas.clientHeight * dpr))

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
      }

      ctx.clearRect(0, 0, width, height)

      const scale = Math.max(width / img.width, height / img.height)
      const drawWidth = img.width * scale
      const drawHeight = img.height * scale
      const x = (width - drawWidth) / 2
      const y = (height - drawHeight) / 2

      ctx.drawImage(img, x, y, drawWidth, drawHeight)
    }

    const findNearestLoadedFrame = (targetIndex) => {
      if (loadedRef.current[targetIndex]) return targetIndex

      for (let offset = 1; offset < frameCount; offset += 1) {
        const prev = targetIndex - offset
        const next = targetIndex + offset

        if (prev >= 0 && loadedRef.current[prev]) return prev
        if (next < frameCount && loadedRef.current[next]) return next
      }

      return -1
    }

    const update = () => {
      const section = sectionRef.current
      if (!section) {
        rafRef.current = requestAnimationFrame(update)
        return
      }

      const scrollY = window.scrollY
      const sectionTop = section.getBoundingClientRect().top + scrollY
      const sectionHeight = section.offsetHeight
      const viewportHeight = window.innerHeight
      const maxScrollable = Math.max(1, sectionHeight - viewportHeight)

      const progress = clamp((scrollY - sectionTop) / maxScrollable, 0, 1)
      const frameIndex = Math.round(progress * (frameCount - 1))
      const safeIndex = clamp(frameIndex, 0, frameCount - 1)
      const nearestIndex = findNearestLoadedFrame(safeIndex)

      if (nearestIndex >= 0) {
        const img = imagesRef.current[nearestIndex]
        if (img) {
          drawImageCover(img)
        }
      }

      onDebugChange?.({
        sectionId: id,
        sectionTop: Math.round(sectionTop),
        sectionHeight,
        viewportHeight,
        maxScrollable,
        progress,
        frameIndex: safeIndex,
        loadedCount,
        frameCount,
      })

      rafRef.current = requestAnimationFrame(update)
    }

    rafRef.current = requestAnimationFrame(update)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [frameCount, id, loadedCount, onDebugChange])

  const preloadPercent = frameCount ? Math.round((loadedCount / frameCount) * 100) : 0

  return (
    <section
      id={id}
      ref={sectionRef}
      className={sectionClassName}
    >
      <div className=" sticky top-0 h-screen w-full overflow-hidden">
        <canvas ref={canvasRef} className="block h-full w-full" />

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="rounded-xl bg-black/35 px-6 py-3 text-center text-white backdrop-blur-sm">
            <div className="text-sm uppercase tracking-[0.18em] text-white/75">{overlayLabel}</div>
            <div className="mt-1 text-3xl font-semibold">{id}</div>
          </div>
        </div>

        {loadedCount < frameCount && (
          <div className="absolute left-1/2 top-4 z-20 w-[240px] -translate-x-1/2 rounded-full bg-white/15 p-1 backdrop-blur">
            <div className="h-1.5 w-full rounded-full bg-white/20">
              <div
                className="h-1.5 rounded-full bg-white"
                style={{ width: `${preloadPercent}%` }}
              />
            </div>
            <p className="mt-1 text-center text-[10px] uppercase tracking-[0.08em] text-white/90">
              Loading {preloadPercent}%
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

export default function SnapPage() {
  const sectionIds = useMemo(() => ["section1", "section2", "section3", "section4"], [])

  const SNAP_DURATION = 3 // in seconds, for Lenis
  const NATIVE_SNAP_DURATION_MS = 3000
  const SNAP_EASING = (t) => 1 - Math.pow(1 - t, 1.15)

  const isSnappingRef = useRef(false)
  const currentIndexRef = useRef(0)

  const [debug, setDebug] = useState({
    currentSection: "section1",
    currentIndex: 0,
    direction: "none",
    isSnapping: false,
    scrollY: 0,
    deltaY: 0,
    targetY: 0,
    lenisDetected: false,
    seqSectionId: "section1",
    seqProgress: 0,
    seqFrameIndex: 0,
    seqLoadedCount: 0,
    seqFrameCount: 0,
    seqSectionTop: 0,
    seqSectionHeight: 0,
    seqViewportHeight: 0,
    seqMaxScrollable: 0,
  })

  useEffect(() => {
    const getLenis = () => window.__lenis || window.lenis || null

    const getSectionTop = (id) => {
      const el = document.getElementById(id)
      if (!el) return 0
      return el.offsetTop
    }

    const getClosestSectionIndex = () => {
      const scrollY = window.scrollY
      let closestIndex = 0
      let closestDistance = Infinity

      sectionIds.forEach((id, index) => {
        const top = getSectionTop(id)
        const distance = Math.abs(scrollY - top)

        if (distance < closestDistance) {
          closestDistance = distance
          closestIndex = index
        }
      })

      return closestIndex
    }

    const snapToIndex = (nextIndex, direction, deltaY = 0) => {
      const safeIndex = Math.max(0, Math.min(nextIndex, sectionIds.length - 1))
      const targetId = sectionIds[safeIndex]
      const targetEl = document.getElementById(targetId)
      if (!targetEl) return

      const targetY = targetEl.offsetTop
      const lenis = getLenis()

      isSnappingRef.current = true
      currentIndexRef.current = safeIndex

      setDebug((prev) => ({
        ...prev,
        currentSection: targetId,
        currentIndex: safeIndex,
        direction,
        isSnapping: true,
        scrollY: Math.round(window.scrollY),
        deltaY: Math.round(deltaY),
        targetY: Math.round(targetY),
        lenisDetected: !!lenis,
      }))

      if (lenis && typeof lenis.scrollTo === "function") {
        lenis.scrollTo(targetY, {
          duration: SNAP_DURATION,
          easing: SNAP_EASING,
          lock: true,
          force: true,
        })
      } else {
        window.scrollTo({
          top: targetY,
          behavior: "smooth",
        })
      }

      window.setTimeout(() => {
        isSnappingRef.current = false
        setDebug((prev) => ({
          ...prev,
          isSnapping: false,
          scrollY: Math.round(window.scrollY),
        }))
      }, lenis ? SNAP_DURATION * 1000 + 200 : NATIVE_SNAP_DURATION_MS)
    }

    const handleWheel = (event) => {
      const lenis = getLenis()
      const deltaY = event.deltaY
      const currentIndex = getClosestSectionIndex()

      currentIndexRef.current = currentIndex

      setDebug((prev) => ({
        ...prev,
        scrollY: Math.round(window.scrollY),
        deltaY: Math.round(deltaY),
        currentIndex,
        currentSection: sectionIds[currentIndex],
        lenisDetected: !!lenis,
      }))

      if (isSnappingRef.current) {
        event.preventDefault()
        return
      }

      if (Math.abs(deltaY) < 10) return

      if (deltaY > 0) {
        const nextIndex = currentIndex + 1
        if (nextIndex < sectionIds.length) {
          event.preventDefault()
          snapToIndex(nextIndex, "down", deltaY)
        }
      } else if (deltaY < 0) {
        const prevIndex = currentIndex - 1
        if (prevIndex >= 0) {
          event.preventDefault()
          snapToIndex(prevIndex, "up", deltaY)
        }
      }
    }

    const handleScroll = () => {
      const currentIndex = getClosestSectionIndex()
      currentIndexRef.current = currentIndex

      setDebug((prev) => ({
        ...prev,
        currentSection: sectionIds[currentIndex],
        currentIndex,
        scrollY: Math.round(window.scrollY),
      }))
    }

    window.addEventListener("wheel", handleWheel, { passive: false })
    window.addEventListener("scroll", handleScroll, { passive: true })

    handleScroll()

    return () => {
      window.removeEventListener("wheel", handleWheel)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [sectionIds])

  return (
    <div className="relative">
      <SequenceBlock
        id="section1"
        folder="hero"
        frameCount={60}
        sectionClassName="relative h-[300vh] w-full bg-black"
        overlayLabel="Sequence Hero"
        onDebugChange={(seq) => {
          setDebug((prev) => ({
            ...prev,
            seqSectionId: seq.sectionId,
            seqProgress: seq.progress,
            seqFrameIndex: seq.frameIndex,
            seqLoadedCount: seq.loadedCount,
            seqFrameCount: seq.frameCount,
            seqSectionTop: seq.sectionTop,
            seqSectionHeight: seq.sectionHeight,
            seqViewportHeight: seq.viewportHeight,
            seqMaxScrollable: seq.maxScrollable,
          }))
        }}
      />

      <SequenceBlock
        id="section2"
        folder="section-2"
        frameCount={60}
        sectionClassName="relative h-[300vh] w-full bg-black"
        overlayLabel="Sequence Section 2"
        onDebugChange={(seq) => {
          setDebug((prev) => ({
            ...prev,
            seqSectionId: seq.sectionId,
            seqProgress: seq.progress,
            seqFrameIndex: seq.frameIndex,
            seqLoadedCount: seq.loadedCount,
            seqFrameCount: seq.frameCount,
            seqSectionTop: seq.sectionTop,
            seqSectionHeight: seq.sectionHeight,
            seqViewportHeight: seq.viewportHeight,
            seqMaxScrollable: seq.maxScrollable,
          }))
        }}
      />

      <section
        id="section3"
        className="flex h-screen w-full items-center justify-center bg-pink-700 text-4xl text-white"
      >
        Section 3
      </section>

      <section
        id="section4"
        className="flex h-screen w-full items-center justify-center bg-gray-700 text-4xl text-white"
      >
        Section 4
      </section>

        <div>
          <section id="sec1" className="flex h-screen w-full items-center justify-center bg-gray-700 text-4xl text-white">Section 1</section>
          <section id="sec2" className="flex h-screen w-full items-center justify-center bg-gray-700 text-4xl text-white">Section 2</section>
          <section id="sec3" className="flex h-screen w-full items-center justify-center bg-gray-700 text-4xl text-white">Section 3</section>
          <section id="sec4" className="flex h-screen w-full items-center justify-center bg-gray-700 text-4xl text-white">Section 4</section>

          <section id="sec5" className="flex h-screen w-full items-center justify-center bg-gray-700 text-4xl text-white">Section 5 this is normal</section>
          <section id="sec6" className="flex h-screen w-full items-center justify-center bg-gray-700 text-4xl text-white">Section 6 this is normal</section>

          <section id="sec7" className="flex h-screen w-full items-center justify-center bg-gray-700 text-4xl text-white">Section 7</section>
        </div>


      <div className="fixed bottom-4 right-4 z-50 w-[360px] rounded-xl border border-white/20 bg-black/70 px-4 py-3 font-mono text-sm text-white backdrop-blur">
        <div className="mb-2 text-xs uppercase tracking-widest text-white/70">Snap + Sequence Debug</div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <span className="text-white/70">section</span>
          <span className="text-right">{debug.currentSection}</span>

          <span className="text-white/70">index</span>
          <span className="text-right">{debug.currentIndex}</span>

          <span className="text-white/70">direction</span>
          <span className="text-right">{debug.direction}</span>

          <span className="text-white/70">snapping</span>
          <span className="text-right">{debug.isSnapping ? "yes" : "no"}</span>

          <span className="text-white/70">scrollY</span>
          <span className="text-right">{debug.scrollY}</span>

          <span className="text-white/70">deltaY</span>
          <span className="text-right">{debug.deltaY}</span>

          <span className="text-white/70">targetY</span>
          <span className="text-right">{debug.targetY}</span>

          <span className="text-white/70">lenis</span>
          <span className="text-right">{debug.lenisDetected ? "yes" : "no"}</span>

          <span className="col-span-2 mt-2 border-t border-white/10 pt-2 text-xs uppercase tracking-widest text-white/60">
            sequence
          </span>

          <span className="text-white/70">seq id</span>
          <span className="text-right">{debug.seqSectionId}</span>

          <span className="text-white/70">progress</span>
          <span className="text-right">{debug.seqProgress.toFixed(3)}</span>

          <span className="text-white/70">frame</span>
          <span className="text-right">
            {debug.seqFrameIndex} / {Math.max(0, debug.seqFrameCount - 1)}
          </span>

          <span className="text-white/70">loaded</span>
          <span className="text-right">
            {debug.seqLoadedCount} / {debug.seqFrameCount}
          </span>

          <span className="text-white/70">sec top</span>
          <span className="text-right">{debug.seqSectionTop}</span>

          <span className="text-white/70">sec height</span>
          <span className="text-right">{debug.seqSectionHeight}</span>

          <span className="text-white/70">viewport</span>
          <span className="text-right">{debug.seqViewportHeight}</span>

          <span className="text-white/70">max scroll</span>
          <span className="text-right">{debug.seqMaxScrollable}</span>
        </div>
      </div>
    </div>
  )
}