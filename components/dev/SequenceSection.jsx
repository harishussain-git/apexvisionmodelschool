"use client"

import { useEffect, useMemo, useRef, useState } from "react"

import CloudTextSection from "@/components/home/CloudTextSection"
import HeroSection from "@/components/home/HeroSection"
import SchoolFrontSection from "@/components/home/SchoolFrontSection"

const NAV_SETTLE_TOLERANCE = 2
const ANCHOR_NAV_BASE_DURATION = 320
const ANCHOR_NAV_DISTANCE_FACTOR = 0.32
const ANCHOR_NAV_MIN_DURATION = 360
const ANCHOR_NAV_MAX_DURATION = 760
const BUTTON_NAV_DURATION = 2200
const EMPTY_ANCHORS = []

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function easeInOutCubic(value) {
  if (value < 0.5) {
    return 4 * value * value * value
  }

  return 1 - ((-2 * value + 2) ** 3) / 2
}

function drawImageCover(canvas, image) {
  if (!canvas || !image) {
    return
  }

  const context = canvas.getContext("2d")
  if (!context) {
    return
  }

  const dpr = window.devicePixelRatio || 1
  const width = Math.max(1, Math.floor(canvas.clientWidth * dpr))
  const height = Math.max(1, Math.floor(canvas.clientHeight * dpr))

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width
    canvas.height = height
  }

  context.clearRect(0, 0, width, height)

  const scale = Math.max(width / image.width, height / image.height)
  const drawWidth = image.width * scale
  const drawHeight = image.height * scale
  const x = (width - drawWidth) / 2
  const y = (height - drawHeight) / 2

  context.drawImage(image, x, y, drawWidth, drawHeight)
}

function findNearestLoadedFrame(targetIndex, frameCount, loadedFrames) {
  const safeIndex = clamp(targetIndex, 0, frameCount - 1)

  if (loadedFrames[safeIndex]) {
    return safeIndex
  }

  for (let offset = 1; offset < frameCount; offset += 1) {
    const previousIndex = safeIndex - offset
    const nextIndex = safeIndex + offset

    if (previousIndex >= 0 && loadedFrames[previousIndex]) {
      return previousIndex
    }

    if (nextIndex < frameCount && loadedFrames[nextIndex]) {
      return nextIndex
    }
  }

  return -1
}

function buildFrameSources(basePath, folder, frameIndex) {
  const zeroBased = String(frameIndex)
  const paddedZeroBased = String(frameIndex).padStart(4, "0")
  const oneBased = String(frameIndex + 1)
  const paddedOneBased = String(frameIndex + 1).padStart(4, "0")

  return [
    `${basePath}/${folder}/${paddedZeroBased}.webp`,
    `${basePath}/${folder}/${paddedOneBased}.webp`,
    `${basePath}/${folder}/${oneBased}.webp`,
    `${basePath}/${folder}/${zeroBased}.webp`,
    `${basePath}/${folder}/${paddedZeroBased}.jpg`,
    `${basePath}/${folder}/${paddedOneBased}.jpg`,
    `${basePath}/${folder}/${oneBased}.jpg`,
    `${basePath}/${folder}/${zeroBased}.jpg`,
  ]
}

function getFrameFromProgress(progress, frameCount) {
  if (!frameCount) {
    return 0
  }

  return clamp(Math.round(progress * Math.max(frameCount - 1, 0)), 0, frameCount - 1)
}

function getProgressFromFrame(frame, frameCount) {
  if (frameCount <= 1) {
    return 0
  }

  return clamp((frame ?? 0) / (frameCount - 1), 0, 1)
}

function getActiveAnchorByFrame(currentFrame, anchors = []) {
  if (!anchors.length) {
    return null
  }

  let activeAnchor = anchors[0]

  for (const anchor of anchors) {
    if ((anchor.currentFrame ?? 0) <= currentFrame) {
      activeAnchor = anchor
    } else {
      break
    }
  }

  return activeAnchor
}

function FeatureCard({ item }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/8 p-4 backdrop-blur-sm">
      <p className="text-sm font-medium text-white/90">{item}</p>
    </div>
  )
}

function FeatureContent({ content = {} }) {
  return (
    <div className="flex h-full items-center px-6 py-10 sm:px-10 lg:px-16">
      <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,360px)] lg:items-end">
        <div className="max-w-2xl">
          {content.eyebrow && (
            <p className="mb-4 text-xs uppercase tracking-[0.24em] text-white/70 sm:text-sm">
              {content.eyebrow}
            </p>
          )}

          <h2 className="text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
            {content.title}
          </h2>

          {content.description && (
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/82 sm:text-lg">
              {content.description}
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-4">
            {content.buttonText && (
              <a
                href={content.buttonHref || "#"}
                className="inline-flex min-h-11 items-center rounded-full bg-white px-6 py-3 text-sm font-medium text-neutral-950 transition hover:bg-white/90"
              >
                {content.buttonText}
              </a>
            )}
          </div>
        </div>

        <div className="grid gap-3">
          {content.items?.map((item) => (
            <FeatureCard key={item} item={item} />
          ))}
        </div>
      </div>
    </div>
  )
}

function renderDefaultAnchorContent(anchor) {
  if (!anchor) {
    return null
  }

  if (anchor.contentType === "feature") {
    return <FeatureContent content={anchor.content} />
  }

  if (anchor.contentType === "hero") {
    return <HeroSection overlay content={anchor.content} />
  }

  if (anchor.contentType === "cloudtext") {
    return <CloudTextSection overlay content={anchor.content} />
  }

  if (anchor.contentType === "school-front") {
    return <SchoolFrontSection overlay content={anchor.content} />
  }

  return null
}

function SequenceAnchorControls({ previousAnchor, nextAnchor, onStep }) {
  return (
    <div className="pointer-events-auto absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/15 bg-black/35 p-1.5 text-white backdrop-blur-xl">
      <span className="rounded-full bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-neutral-950 sm:px-5">
        Scroll
      </span>

      <button
        type="button"
        onClick={() => onStep("up")}
        disabled={!previousAnchor}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-neutral-950 transition disabled:cursor-not-allowed disabled:opacity-40"
        aria-label={previousAnchor ? `Go to ${previousAnchor.id}` : "No previous anchor"}
      >
        <img className="w-4 rotate-180" src="/icons/down.svg" alt="" aria-hidden="true" />
      </button>

      <button
        type="button"
        onClick={() => onStep("down")}
        disabled={!nextAnchor}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-neutral-950 transition disabled:cursor-not-allowed disabled:opacity-40"
        aria-label={nextAnchor ? `Go to ${nextAnchor.id}` : "No next anchor"}
      >
        <img className="w-4" src="/icons/down.svg" alt="" aria-hidden="true" />
      </button>
    </div>
  )
}

function SequenceContent({ activeAnchor, renderAnchor }) {
  const customContent = renderAnchor?.(activeAnchor)
  const resolvedContent =
    customContent === undefined ? renderDefaultAnchorContent(activeAnchor) : customContent

  return (
    <div className="relative h-full min-h-screen">
      <div key={activeAnchor?.id ?? "empty"} className="absolute inset-0">
        {resolvedContent}
      </div>
    </div>
  )
}

export default function SequenceSection({ data, renderAnchor }) {
  const sectionRef = useRef(null)
  const canvasRef = useRef(null)
  const frameImagesRef = useRef([])
  const loadedFramesRef = useRef([])
  const loadedCountRef = useRef(0)
  const metricsRef = useRef({
    sectionTop: 0,
    sectionHeight: 0,
    viewportHeight: 0,
    maxScrollable: 1,
    scrollY: 0,
    progress: 0,
    currentFrame: 0,
  })
  const renderedFrameRef = useRef(-1)
  const targetFrameRef = useRef(0)
  const activeAnchorRef = useRef(null)
  const rafIdRef = useRef(null)
  const debugRafTimeRef = useRef(0)
  const scrollAnimationFrameRef = useRef(null)
  const animateScrollToRef = useRef(null)
  const navigationStateRef = useRef({
    isAnimating: false,
    targetAnchorId: null,
    targetScrollY: null,
  })

  const [loadedCount, setLoadedCount] = useState(0)
  const [activeAnchorId, setActiveAnchorId] = useState(data?.anchors?.[0]?.id ?? "")
  const [debugState, setDebugState] = useState({
    chapterId: data?.id ?? "",
    folder: `${data?.basePath ?? ""}/${data?.folder ?? ""}`,
    frameCount: data?.frameCount ?? 0,
    progress: 0,
    currentFrame: 0,
    activeAnchorId: data?.anchors?.[0]?.id ?? "",
    navTargetId: "",
    scrollY: 0,
    sectionTop: 0,
    sectionHeight: 0,
    viewportHeight: 0,
  })

  const frameCount = data?.frameCount ?? 0
  const showDebug = Boolean(data?.showDebug)
  const anchors = data?.anchors ?? EMPTY_ANCHORS
  const activeAnchorIndex = useMemo(
    () => anchors.findIndex((anchor) => anchor.id === activeAnchorId),
    [activeAnchorId, anchors]
  )
  const activeAnchor = activeAnchorIndex >= 0 ? anchors[activeAnchorIndex] : null
  const previousAnchor = activeAnchorIndex > 0 ? anchors[activeAnchorIndex - 1] : null
  const nextAnchor =
    activeAnchorIndex >= 0 && activeAnchorIndex < anchors.length - 1
      ? anchors[activeAnchorIndex + 1]
      : null

  useEffect(() => {
    if (!frameCount || !data?.basePath || !data?.folder) {
      return undefined
    }

    let canceled = false

    frameImagesRef.current = new Array(frameCount)
    loadedFramesRef.current = new Array(frameCount).fill(false)
    loadedCountRef.current = 0
    renderedFrameRef.current = -1
    targetFrameRef.current = 0

    for (let frameIndex = 0; frameIndex < frameCount; frameIndex += 1) {
      const image = new Image()
      const sources = buildFrameSources(data.basePath, data.folder, frameIndex)
      let sourceIndex = 0

      image.onload = () => {
        if (canceled) {
          return
        }

        frameImagesRef.current[frameIndex] = image
        loadedFramesRef.current[frameIndex] = true
        loadedCountRef.current += 1
        setLoadedCount(loadedCountRef.current)

        if (frameIndex === 0 && renderedFrameRef.current < 0) {
          drawImageCover(canvasRef.current, image)
          renderedFrameRef.current = 0
        }
      }

      image.onerror = () => {
        if (canceled) {
          return
        }

        sourceIndex += 1

        if (sourceIndex < sources.length) {
          image.src = sources[sourceIndex]
          return
        }

        loadedFramesRef.current[frameIndex] = false
      }

      image.src = sources[sourceIndex]
    }

    return () => {
      canceled = true
    }
  }, [data?.basePath, data?.folder, frameCount])

  useEffect(() => {
    if (!frameCount) {
      return undefined
    }

    const cancelScrollAnimation = () => {
      if (scrollAnimationFrameRef.current !== null) {
        window.cancelAnimationFrame(scrollAnimationFrameRef.current)
        scrollAnimationFrameRef.current = null
      }

      navigationStateRef.current = {
        isAnimating: false,
        targetAnchorId: null,
        targetScrollY: null,
      }
    }

    const syncMetricsFromScroll = () => {
      const section = sectionRef.current
      if (!section) {
        return null
      }

      const scrollY = window.scrollY
      const sectionTop = section.getBoundingClientRect().top + scrollY
      const sectionHeight = section.offsetHeight
      const viewportHeight = window.innerHeight
      const maxScrollable = Math.max(1, sectionHeight - viewportHeight)
      const progress = clamp((scrollY - sectionTop) / maxScrollable, 0, 1)
      const currentFrame = getFrameFromProgress(progress, frameCount)
      const currentAnchor = getActiveAnchorByFrame(currentFrame, anchors)

      metricsRef.current = {
        sectionTop,
        sectionHeight,
        viewportHeight,
        maxScrollable,
        scrollY,
        progress,
        currentFrame,
      }
      targetFrameRef.current = currentFrame
      activeAnchorRef.current = currentAnchor

      setActiveAnchorId((current) => (current === currentAnchor?.id ? current : currentAnchor?.id ?? ""))

      return metricsRef.current
    }

    const redrawCurrentFrame = () => {
      const nextFrame = findNearestLoadedFrame(
        renderedFrameRef.current >= 0 ? renderedFrameRef.current : 0,
        frameCount,
        loadedFramesRef.current
      )

      if (nextFrame < 0) {
        return
      }

      const image = frameImagesRef.current[nextFrame]
      if (!image) {
        return
      }

      drawImageCover(canvasRef.current, image)
    }

    // Buttons use the same frame math as scroll, but we drive the page position manually.
    const animateScrollTo = (targetAnchor, options = {}) => {
      const metrics = syncMetricsFromScroll()
      if (!metrics || !targetAnchor) {
        return
      }

      const targetProgress = getProgressFromFrame(targetAnchor.currentFrame ?? 0, frameCount)
      const targetScrollY = metrics.sectionTop + targetProgress * metrics.maxScrollable
      const travelDistance = Math.abs(targetScrollY - window.scrollY)

      if (travelDistance <= NAV_SETTLE_TOLERANCE) {
        return
      }

      cancelScrollAnimation()

      const startedAt = window.performance.now()
      const startScrollY = window.scrollY
      const duration =
        options.duration ??
        clamp(
          ANCHOR_NAV_BASE_DURATION + travelDistance * ANCHOR_NAV_DISTANCE_FACTOR,
          ANCHOR_NAV_MIN_DURATION,
          ANCHOR_NAV_MAX_DURATION
        )

      navigationStateRef.current = {
        isAnimating: true,
        targetAnchorId: targetAnchor.id,
        targetScrollY,
      }

      const step = (time) => {
        const elapsed = time - startedAt
        const progress = clamp(elapsed / duration, 0, 1)
        const eased = easeInOutCubic(progress)
        const nextScrollY = startScrollY + (targetScrollY - startScrollY) * eased

        window.scrollTo({ top: nextScrollY, behavior: "auto" })

        if (progress < 1) {
          scrollAnimationFrameRef.current = window.requestAnimationFrame(step)
          return
        }

        window.scrollTo({ top: targetScrollY, behavior: "auto" })
        scrollAnimationFrameRef.current = null
        navigationStateRef.current = {
          isAnimating: false,
          targetAnchorId: null,
          targetScrollY: null,
        }
        syncMetricsFromScroll()
      }

      scrollAnimationFrameRef.current = window.requestAnimationFrame(step)
    }

    animateScrollToRef.current = animateScrollTo

    const handleScroll = () => {
      syncMetricsFromScroll()
    }

    const handleResize = () => {
      cancelScrollAnimation()
      syncMetricsFromScroll()
      redrawCurrentFrame()
    }

    const handleUserInterrupt = () => {
      if (navigationStateRef.current.isAnimating) {
        cancelScrollAnimation()
      }
    }

    const animate = (time) => {
      const frameIndex = clamp(Math.round(targetFrameRef.current), 0, frameCount - 1)

      if (frameIndex !== renderedFrameRef.current) {
        const nextFrame = findNearestLoadedFrame(frameIndex, frameCount, loadedFramesRef.current)

        if (nextFrame >= 0) {
          const image = frameImagesRef.current[nextFrame]

          if (image) {
            drawImageCover(canvasRef.current, image)
            renderedFrameRef.current = nextFrame
          }
        }
      }

      if (showDebug && time - debugRafTimeRef.current > 66) {
        const metrics = metricsRef.current
        debugRafTimeRef.current = time

        setDebugState({
          chapterId: data?.id ?? "",
          folder: `${data?.basePath ?? ""}/${data?.folder ?? ""}`,
          frameCount,
          progress: metrics.progress,
          currentFrame: frameIndex,
          activeAnchorId: activeAnchorRef.current?.id ?? "",
          navTargetId: navigationStateRef.current.targetAnchorId ?? "",
          scrollY: metrics.scrollY,
          sectionTop: metrics.sectionTop,
          sectionHeight: metrics.sectionHeight,
          viewportHeight: metrics.viewportHeight,
        })
      }

      rafIdRef.current = window.requestAnimationFrame(animate)
    }

    syncMetricsFromScroll()
    redrawCurrentFrame()

    window.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("resize", handleResize)
    window.addEventListener("orientationchange", handleResize)
    window.visualViewport?.addEventListener("resize", handleResize)
    window.addEventListener("wheel", handleUserInterrupt, { passive: true })
    window.addEventListener("touchstart", handleUserInterrupt, { passive: true })
    window.addEventListener("keydown", handleUserInterrupt)

    rafIdRef.current = window.requestAnimationFrame(animate)

    return () => {
      cancelScrollAnimation()
      animateScrollToRef.current = null
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("orientationchange", handleResize)
      window.visualViewport?.removeEventListener("resize", handleResize)
      window.removeEventListener("wheel", handleUserInterrupt)
      window.removeEventListener("touchstart", handleUserInterrupt)
      window.removeEventListener("keydown", handleUserInterrupt)

      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current)
      }
    }
  }, [anchors, data, frameCount, showDebug])

  const handleAnchorStep = (direction) => {
    const targetAnchor = direction === "up" ? previousAnchor : nextAnchor

    if (!targetAnchor) {
      return
    }

    animateScrollToRef.current?.(targetAnchor, { duration: BUTTON_NAV_DURATION })
  }

  const shouldShowDebugPanel =
    showDebug &&
    debugState.scrollY >= debugState.sectionTop - debugState.viewportHeight &&
    debugState.scrollY <= debugState.sectionTop + debugState.sectionHeight

  return (
    <section
      id={data?.id}
      ref={sectionRef}
      style={{ minHeight: `${data?.heightVh ?? 200}vh` }}
      className="relative bg-neutral-950"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <canvas ref={canvasRef} className="block h-full w-full " />

        <div className="absolute inset-0 z-10">
          <div className="mx-auto h-full w-full max-w-[96vw] text-black">
            <SequenceContent activeAnchor={activeAnchor} renderAnchor={renderAnchor} />
          </div>

          <SequenceAnchorControls
            previousAnchor={previousAnchor}
            nextAnchor={nextAnchor}
            onStep={handleAnchorStep}
          />
        </div>
      </div>

      {shouldShowDebugPanel && (
        <div className="fixed bottom-3 right-3 z-50 rounded-xl border border-white/20 bg-black/70 px-3 py-2 font-mono text-[11px] text-white shadow-lg backdrop-blur-md">
          <div className="mb-1 text-[10px] uppercase tracking-[0.08em] text-white/80">
            Sequence Debug
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
            <span className="text-white/70">TotalFrames</span>
            <span className="text-right">{debugState.frameCount}</span>
            <span className="text-white/70">CurrentFrame</span>
            <span className="text-right">{debugState.currentFrame}</span>
            <span className="text-white/70">ActiveAnchor</span>
            <span className="text-right">{debugState.activeAnchorId || "-"}</span>
            <span className="text-white/70">NavTarget</span>
            <span className="text-right">{debugState.navTargetId || "-"}</span>
            <span className="text-white/70">Progress</span>
            <span className="text-right">{debugState.progress.toFixed(3)}</span>
            <span className="text-white/70">Loaded</span>
            <span className="text-right">
              {loadedCount}/{debugState.frameCount}
            </span>
          </div>
        </div>
      )}
    </section>
  )
}
