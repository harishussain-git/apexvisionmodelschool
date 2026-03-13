"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import useSectionSnap from "@/components/ui/useSectionSnap"
import { clamp, getLenis, getScrollY, getSectionMetrics } from "@/components/ui/snap-utils"

function buildFrameSources(folder, frameIndex) {
  const padded = String(frameIndex + 1).padStart(4, "0")
  const plain = String(frameIndex + 1)

  // Prefer padded filenames. Keep plain fallback for migration safety.
  return [`/sequences/${folder}/${padded}.jpg`, `/sequences/${folder}/${plain}.jpg`]
}

function loadSequenceFrames({ folder, frameCount, onFrameLoad, onProgress }) {
  const images = new Array(frameCount)
  const loaded = new Array(frameCount).fill(false)
  let completed = 0
  let canceled = false

  for (let i = 0; i < frameCount; i += 1) {
    const img = new Image()
    const sources = buildFrameSources(folder, i)
    let sourceIndex = 0

    const markDone = () => {
      completed += 1
      onProgress?.(completed)
    }

    img.onload = () => {
      if (canceled) return
      images[i] = img
      loaded[i] = true
      onFrameLoad?.(i, img)
      markDone()
    }

    img.onerror = () => {
      if (canceled) return

      sourceIndex += 1
      if (sourceIndex < sources.length) {
        img.src = sources[sourceIndex]
        return
      }

      loaded[i] = false
      markDone()
    }

    img.src = sources[sourceIndex]
  }

  return {
    images,
    loaded,
    cancel: () => {
      canceled = true
    },
  }
}

export default function SequenceSection({
  data,
  showDebug = true,
  lerpFactor = 0.1,
  frameResponse = 1,
}) {
  const sectionRef = useRef(null)
  const canvasRef = useRef(null)
  const frameImagesRef = useRef([])
  const loadedFramesRef = useRef([])

  const rafIdRef = useRef(null)
  const debugRafTimeRef = useRef(0)

  // Playhead refs for smooth frame interpolation.
  const targetFrameRef = useRef(0)
  const currentFrameRef = useRef(0)
  const renderedFrameRef = useRef(-1)

  // Scroll + diagnostics refs.
  const smoothedScrollRef = useRef(0)
  const progressRef = useRef(0)
  const framesPer100Ref = useRef(0)

  const [loadedCount, setLoadedCount] = useState(0)
  const [sectionHeight, setSectionHeight] = useState(0)
  const [debugState, setDebugState] = useState({
    smoothedScroll: 0,
    progress: 0,
    targetFrame: 0,
    currentFrame: 0,
    renderedFrame: 1,
    framesPer100: 0,
  })

  const frameCount = data?.frameCount ?? 0
  const pixelsPerFrame = data?.pixelsPerFrame ?? 45

  const { debugState: snapDebug } = useSectionSnap({
    sectionRef,
    snapConfig: data?.snap,
    debug: showDebug,
  })

  const drawImageCover = useCallback((img) => {
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
  }, [])

  const findNearestLoadedFrame = useCallback(
    (targetIndex) => {
      if (loadedFramesRef.current[targetIndex]) return targetIndex

      for (let offset = 1; offset < frameCount; offset += 1) {
        const prev = targetIndex - offset
        const next = targetIndex + offset

        if (prev >= 0 && loadedFramesRef.current[prev]) return prev
        if (next < frameCount && loadedFramesRef.current[next]) return next
      }

      return -1
    },
    [frameCount]
  )

  const drawFrame = useCallback(
    (requestedIndex) => {
      if (!frameCount) return

      const safeIndex = clamp(requestedIndex, 0, frameCount - 1)
      const nearestIndex = findNearestLoadedFrame(safeIndex)
      if (nearestIndex < 0) return

      const frameImage = frameImagesRef.current[nearestIndex]
      if (!frameImage) return

      drawImageCover(frameImage)
    },
    [drawImageCover, findNearestLoadedFrame, frameCount]
  )

  const calculateSectionHeight = useCallback(() => {
    const viewportHeight = window.innerHeight
    const maxScrollDistance = 5000
    const rawExtra = Math.max(0, (frameCount - 1) * pixelsPerFrame)
    const extraScroll = Math.min(rawExtra, maxScrollDistance)

    // sectionHeight = viewport + animated scroll distance
    setSectionHeight(viewportHeight + extraScroll)
  }, [frameCount, pixelsPerFrame])

  const updateTargetFromScroll = useCallback(
    (scrollY) => {
      const section = sectionRef.current
      if (!section || !frameCount) return

      const metrics = getSectionMetrics(section, scrollY)
      const progress = metrics.progress
      const responsiveProgress = clamp(progress * frameResponse, 0, 1)

      progressRef.current = progress
      smoothedScrollRef.current = scrollY
      targetFrameRef.current = responsiveProgress * (frameCount - 1)
      framesPer100Ref.current =
        ((frameCount - 1) / (metrics.maxScrollable / 100)) * frameResponse
    },
    [frameCount, frameResponse]
  )

  useEffect(() => {
    if (!frameCount || !data?.folder) return

    const loader = loadSequenceFrames({
      folder: data.folder,
      frameCount,
      onFrameLoad: (index, image) => {
        frameImagesRef.current[index] = image
        loadedFramesRef.current[index] = true

        if (index === 0) {
          drawFrame(0)
        }
      },
      onProgress: (loaded) => {
        setLoadedCount(loaded)
      },
    })

    frameImagesRef.current = loader.images
    loadedFramesRef.current = loader.loaded

    return () => {
      loader.cancel()
    }
  }, [data?.folder, drawFrame, frameCount])

  useEffect(() => {
    if (!frameCount) return

    const handleViewportChange = () => {
      calculateSectionHeight()
      updateTargetFromScroll(getScrollY())
    }

    const initialResizeRafId = window.requestAnimationFrame(handleViewportChange)

    window.addEventListener("resize", handleViewportChange)
    window.addEventListener("orientationchange", handleViewportChange)

    return () => {
      window.cancelAnimationFrame(initialResizeRafId)
      window.removeEventListener("resize", handleViewportChange)
      window.removeEventListener("orientationchange", handleViewportChange)
    }
  }, [calculateSectionHeight, frameCount, updateTargetFromScroll])

  useEffect(() => {
    if (!frameCount) return

    const onAnyScrollSignal = () => {
      updateTargetFromScroll(getScrollY())
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

        // Scroll handlers only update targets. No drawing here.
        updateTargetFromScroll(eventScroll)
      }

      lenis.on("scroll", onLenisScroll)
      unsubscribeLenis = () => {
        if (typeof lenis.off === "function") {
          lenis.off("scroll", onLenisScroll)
        }
      }
    }

    window.addEventListener("scroll", onAnyScrollSignal, { passive: true })
    window.visualViewport?.addEventListener("resize", onAnyScrollSignal)

    onAnyScrollSignal()

    const animate = (time) => {
      const target = targetFrameRef.current
      const current = currentFrameRef.current

      currentFrameRef.current = current + (target - current) * lerpFactor

      const renderFrame = clamp(Math.round(currentFrameRef.current), 0, frameCount - 1)

      // Draw only when frame changes.
      if (renderFrame !== renderedFrameRef.current) {
        renderedFrameRef.current = renderFrame
        drawFrame(renderFrame)
      }

      if (showDebug && time - debugRafTimeRef.current > 66) {
        debugRafTimeRef.current = time
        setDebugState({
          smoothedScroll: smoothedScrollRef.current,
          progress: progressRef.current,
          targetFrame: targetFrameRef.current,
          currentFrame: currentFrameRef.current,
          renderedFrame: renderFrame + 1,
          framesPer100: framesPer100Ref.current,
        })
      }

      rafIdRef.current = window.requestAnimationFrame(animate)
    }

    rafIdRef.current = window.requestAnimationFrame(animate)

    return () => {
      window.removeEventListener("scroll", onAnyScrollSignal)
      window.visualViewport?.removeEventListener("resize", onAnyScrollSignal)

      if (unsubscribeLenis) unsubscribeLenis()

      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current)
      }
    }
  }, [drawFrame, frameCount, lerpFactor, showDebug, updateTargetFromScroll])

  const preloadPercent = frameCount ? Math.round((loadedCount / frameCount) * 100) : 0
  const isLoading = loadedCount < frameCount
  const shouldShowDebugPanel =
    showDebug &&
    snapDebug.scrollY >= snapDebug.sectionTop - snapDebug.viewportHeight &&
    snapDebug.scrollY <= snapDebug.sectionTop + snapDebug.sectionHeight

  return (
    <section
      ref={sectionRef}
      style={{ minHeight: `${sectionHeight || 1000}px` }}
      className="relative w-full bg-black"
    >
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        <canvas ref={canvasRef} className="block h-full w-full" />

        <div className="pointer-events-none absolute inset-x-0 bottom-[10vh] z-10 px-4 text-center text-white">
          <p className="mb-1 text-xs uppercase tracking-[0.08em] sm:text-sm">{data?.subtitle}</p>
          <h2 className="text-2xl font-semibold leading-tight sm:text-4xl">{data?.title}</h2>
        </div>

        {isLoading && (
          <div className="pointer-events-none absolute left-1/2 top-4 z-20 w-[min(240px,calc(100%-2rem))] -translate-x-1/2 rounded-full bg-white/15 p-1 backdrop-blur">
            <div className="h-1.5 w-full rounded-full bg-white/20">
              <div
                className="h-1.5 rounded-full bg-white transition-[width] duration-150"
                style={{ width: `${preloadPercent}%` }}
              />
            </div>
            <p className="mt-1 text-center text-[10px] uppercase tracking-[0.08em] text-white/90">
              Loading {preloadPercent}%
            </p>
          </div>
        )}
      </div>

      {shouldShowDebugPanel && (
        <div className="fixed bottom-3 right-3 z-50 rounded-xl border border-white/20 bg-black/65 px-3 py-2 font-mono text-[11px] text-white shadow-lg backdrop-blur-md">
          <div className="mb-1 text-[10px] uppercase tracking-[0.08em] text-white/80">Sequence Debug</div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
            <span className="text-white/70">smoothY</span>
            <span className="text-right">{Math.round(debugState.smoothedScroll)}</span>
            <span className="text-white/70">progress</span>
            <span className="text-right">{debugState.progress.toFixed(3)}</span>
            <span className="text-white/70">target</span>
            <span className="text-right">{debugState.targetFrame.toFixed(2)}</span>
            <span className="text-white/70">current</span>
            <span className="text-right">{debugState.currentFrame.toFixed(2)}</span>
            <span className="text-white/70">rendered</span>
            <span className="text-right">{debugState.renderedFrame}</span>
            <span className="text-white/70">f / 100px</span>
            <span className="text-right">{debugState.framesPer100.toFixed(2)}</span>
            <span className="text-white/70">loaded</span>
            <span className="text-right">
              {loadedCount}/{frameCount}
            </span>
            <span className="col-span-2 mt-1 border-t border-white/10 pt-1 text-[10px] uppercase tracking-[0.08em] text-white/80">
              Snap
            </span>
            <span className="text-white/70">section</span>
            <span className="text-right">{snapDebug.sectionId || data?.id || "-"}</span>
            <span className="text-white/70">top</span>
            <span className="text-right">{Math.round(snapDebug.sectionTop)}</span>
            <span className="text-white/70">height</span>
            <span className="text-right">{Math.round(snapDebug.sectionHeight)}</span>
            <span className="text-white/70">viewport</span>
            <span className="text-right">{Math.round(snapDebug.viewportHeight)}</span>
            <span className="text-white/70">max scroll</span>
            <span className="text-right">{Math.round(snapDebug.maxScrollable)}</span>
            <span className="text-white/70">raw scrollY</span>
            <span className="text-right">{Math.round(snapDebug.scrollY)}</span>
            <span className="text-white/70">direction</span>
            <span className="text-right">{snapDebug.direction}</span>
            <span className="text-white/70">isSnapping</span>
            <span className="text-right">{snapDebug.isSnapping ? "yes" : "no"}</span>
            <span className="text-white/70">enabled</span>
            <span className="text-right">{snapDebug.enabled ? "yes" : "no"}</span>
            <span className="text-white/70">up threshold</span>
            <span className="text-right">{snapDebug.upThreshold.toFixed(2)}</span>
            <span className="text-white/70">down threshold</span>
            <span className="text-right">{snapDebug.downThreshold.toFixed(2)}</span>
            <span className="text-white/70">up target</span>
            <span className="text-right">{snapDebug.upTarget || "-"}</span>
            <span className="text-white/70">down target</span>
            <span className="text-right">{snapDebug.downTarget || "-"}</span>
            <span className="text-white/70">targetY</span>
            <span className="text-right">
              {typeof snapDebug.targetY === "number" ? Math.round(snapDebug.targetY) : "-"}
            </span>
            <span className="text-white/70">lenis</span>
            <span className="text-right">{snapDebug.lenisDetected ? "yes" : "no"}</span>
          </div>
        </div>
      )}
    </section>
  )
}
