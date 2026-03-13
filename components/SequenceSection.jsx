"use client"

import { useCallback, useEffect, useRef, useState } from "react"

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

export default function SequenceSection({ folder, frameCount, heightMultiplier = 2.5 }) {
  const sectionRef = useRef(null)
  const canvasRef = useRef(null)

  const imagesRef = useRef([])
  const loadedRef = useRef([])

  // Smoothing refs (no React state for animation core).
  const targetFrameRef = useRef(0)
  const currentFrameRef = useRef(0)
  const renderedFrameRef = useRef(-1)
  const progressRef = useRef(0)

  const rafIdRef = useRef(null)

  const [debug, setDebug] = useState({
    progress: 0,
    targetFrame: 0,
    currentFrame: 0,
  })

  const getNearestLoadedFrame = useCallback(
    (index) => {
      const safe = clamp(index, 0, frameCount - 1)
      if (loadedRef.current[safe]) return safe

      for (let offset = 1; offset < frameCount; offset += 1) {
        const prev = safe - offset
        const next = safe + offset

        if (prev >= 0 && loadedRef.current[prev]) return prev
        if (next < frameCount && loadedRef.current[next]) return next
      }

      return -1
    },
    [frameCount]
  )

  // Draw image to canvas with "cover" behavior and DPR scaling.
  const drawFrame = useCallback(
    (frameIndex) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const drawIndex = getNearestLoadedFrame(frameIndex)
      if (drawIndex < 0) return

      const img = imagesRef.current[drawIndex]
      if (!img) return

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
    },
    [getNearestLoadedFrame]
  )

  useEffect(() => {
    if (!folder || !frameCount) return

    let canceled = false

    imagesRef.current = new Array(frameCount)
    loadedRef.current = new Array(frameCount).fill(false)

    for (let i = 0; i < frameCount; i += 1) {
      const img = new Image()
      const frameNumber = i + 1

      img.onload = () => {
        if (canceled) return
        imagesRef.current[i] = img
        loadedRef.current[i] = true

        // Draw first frame immediately when available.
        if (i === 0) {
          drawFrame(0)
        }
      }

      img.onerror = () => {
        if (canceled) return
        loadedRef.current[i] = false
      }

      img.src = `/sequences/${folder}/${frameNumber}.jpg`
    }

    return () => {
      canceled = true
    }
  }, [folder, frameCount, drawFrame])

  useEffect(() => {
    if (!frameCount) return

    // Scroll handler only updates progress + target frame.
    function onScroll() {
      const section = sectionRef.current
      if (!section) return

      const scrollY = window.scrollY
      const sectionRect = section.getBoundingClientRect()
      const sectionTop = sectionRect.top + scrollY
      const sectionHeight = section.offsetHeight
      const viewportHeight = window.innerHeight
      const maxScrollable = sectionHeight - viewportHeight

      let progress = 0
      if (maxScrollable > 0) {
        progress = clamp((scrollY - sectionTop) / maxScrollable, 0, 1)
      }

      progressRef.current = progress
      targetFrameRef.current = progress * (frameCount - 1)
    }

    function animate() {
      const target = targetFrameRef.current
      const current = currentFrameRef.current

      // Playhead interpolation for smooth frame transitions.
      currentFrameRef.current = current + (target - current) * 0.12

      const renderFrame = clamp(Math.round(currentFrameRef.current), 0, frameCount - 1)

      // Draw only when frame changes.
      if (renderFrame !== renderedFrameRef.current) {
        renderedFrameRef.current = renderFrame
        drawFrame(renderFrame)
      }

      setDebug({
        progress: progressRef.current,
        targetFrame: targetFrameRef.current,
        currentFrame: currentFrameRef.current,
      })

      rafIdRef.current = window.requestAnimationFrame(animate)
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    window.addEventListener("orientationchange", onScroll)
    window.visualViewport?.addEventListener("resize", onScroll)

    // Initialize values before starting RAF.
    onScroll()
    rafIdRef.current = window.requestAnimationFrame(animate)

    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      window.removeEventListener("orientationchange", onScroll)
      window.visualViewport?.removeEventListener("resize", onScroll)

      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current)
      }
    }
  }, [frameCount, drawFrame])

  return (
    <section
      ref={sectionRef}
      style={{ minHeight: `${heightMultiplier * 100}vh` }}
      className="relative w-full bg-black"
    >
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        <canvas ref={canvasRef} className="block h-full w-full" />
      </div>

      <div className="fixed bottom-3 right-3 z-50 rounded-xl border border-white/20 bg-black/65 px-3 py-2 font-mono text-[11px] text-white shadow-lg backdrop-blur-md">
        <div className="mb-1 text-[10px] uppercase tracking-[0.08em] text-white/80">Sequence Debug</div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
          <span className="text-white/70">progress</span>
          <span className="text-right">{debug.progress.toFixed(3)}</span>
          <span className="text-white/70">target</span>
          <span className="text-right">{debug.targetFrame.toFixed(2)}</span>
          <span className="text-white/70">current</span>
          <span className="text-right">{debug.currentFrame.toFixed(2)}</span>
        </div>
      </div>
    </section>
  )
}
