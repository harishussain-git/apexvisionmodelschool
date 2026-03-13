"use client"

import { useEffect, useRef, useState } from "react"

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function getActiveBeat(progress, beats = []) {
  if (!beats.length) {
    return null
  }

  return (
    beats.find((beat) => progress >= beat.startProgress && progress <= beat.endProgress) ||
    beats[beats.length - 1]
  )
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

const CONTENT_MAP = {
  hero: {
    alignClass: "items-center justify-center text-center",
    bodyClass: "max-w-3xl",
    eyebrow: "Apex Manual Test Chapter",
    title: "One long sequence chapter can carry the whole story.",
    description:
      "This test route keeps the viewer inside a single sticky canvas while the frames and narrative beats evolve naturally through scroll.",
    points: [],
  },
  classroom: {
    alignClass: "items-end justify-start text-left",
    bodyClass: "max-w-xl pb-[12vh]",
    badge: "Beat 02",
    title: "Classroom moments can enter without breaking the chapter.",
    description:
      "The image sequence keeps running continuously while the overlay shifts to a new beat with a simple content transition.",
    points: ["Natural scroll progress through one long section", "Same canvas, different beat content"],
  },
  robotics: {
    alignClass: "items-center justify-end text-left",
    bodyClass: "max-w-xl",
    badge: "Beat 03",
    title: "Later beats can push into a more technical story.",
    description:
      "This pattern is designed to stack chapters with normal sections in between, so the homepage can mix immersive scenes and standard content blocks.",
    points: ["Reusable JSON-driven beat ranges", "Easy to repeat with a second chapter later"],
  },
}

function BeatContent({ beatKey, isActive }) {
  const content = CONTENT_MAP[beatKey]

  if (!content) {
    return null
  }

  return (
    <div
      className={`absolute inset-0 flex px-6 py-10 transition-all duration-500 ease-out sm:px-10 lg:px-16 ${content.alignClass} ${
        isActive ? "pointer-events-auto opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-4"
      }`}
      aria-hidden={!isActive}
    >
      <div className={content.bodyClass}>
        {content.eyebrow && (
          <p className="mb-3 text-xs uppercase tracking-[0.24em] text-white/70 sm:text-sm">
            {content.eyebrow}
          </p>
        )}

        {content.badge && (
          <span className="mb-4 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-white/85 backdrop-blur-sm">
            {content.badge}
          </span>
        )}

        <h2 className="text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
          {content.title}
        </h2>

        <p className="mt-4 text-base leading-relaxed text-white/82 sm:text-lg">
          {content.description}
        </p>

        {content.points.length > 0 && (
          <ul className="mt-6 space-y-2 text-sm text-white/78 sm:text-base">
            {content.points.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-white" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default function SequenceChapter({ data }) {
  const sectionRef = useRef(null)
  const canvasRef = useRef(null)
  const frameImagesRef = useRef([])
  const loadedFramesRef = useRef([])
  const metricsRef = useRef({
    sectionTop: 0,
    sectionHeight: 0,
    viewportHeight: 0,
    maxScrollable: 1,
    scrollY: 0,
    progress: 0,
  })
  const targetFrameRef = useRef(0)
  const renderedFrameRef = useRef(-1)
  const activeBeatRef = useRef(null)
  const loadedCountRef = useRef(0)
  const rafIdRef = useRef(null)
  const debugRafTimeRef = useRef(0)

  const [loadedCount, setLoadedCount] = useState(0)
  const [activeBeatId, setActiveBeatId] = useState(data?.beats?.[0]?.id ?? "")
  const [debugState, setDebugState] = useState({
    sectionId: data?.id ?? "",
    progress: 0,
    activeBeatId: data?.beats?.[0]?.id ?? "",
    currentFrame: 0,
    loadedCount: 0,
    frameCount: data?.frameCount ?? 0,
    sectionHeight: 0,
    viewportHeight: 0,
    maxScrollable: 1,
    scrollY: 0,
    sectionTop: 0,
    folderPath: `${data?.basePath ?? ""}/${data?.folder ?? ""}`,
  })

  const frameCount = data?.frameCount ?? 0
  const showDebug = Boolean(data?.showDebug)
  const chapterHeightVh = data?.heightVh ?? 300

  useEffect(() => {
    if (!frameCount || !data?.folder || !data?.basePath) {
      return undefined
    }

    let canceled = false

    frameImagesRef.current = new Array(frameCount)
    loadedFramesRef.current = new Array(frameCount).fill(false)
    loadedCountRef.current = 0
    setLoadedCount(0)

    for (let frameIndex = 0; frameIndex < frameCount; frameIndex += 1) {
      const image = new Image()

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

        loadedFramesRef.current[frameIndex] = false
      }

      image.src = `${data.basePath}/${data.folder}/${frameIndex}.jpg`
    }

    return () => {
      canceled = true
    }
  }, [data?.basePath, data?.folder, frameCount])

  useEffect(() => {
    if (!frameCount) {
      return undefined
    }

    const updateFromScroll = () => {
      const section = sectionRef.current
      if (!section) {
        return
      }

      const scrollY = window.scrollY
      const sectionTop = section.getBoundingClientRect().top + window.scrollY
      const sectionHeight = section.offsetHeight
      const viewportHeight = window.innerHeight
      const maxScrollable = Math.max(1, sectionHeight - viewportHeight)
      const progress = clamp((scrollY - sectionTop) / maxScrollable, 0, 1)
      const currentFrame = Math.round(progress * (frameCount - 1))
      const activeBeat = getActiveBeat(progress, data?.beats)

      metricsRef.current = {
        sectionTop,
        sectionHeight,
        viewportHeight,
        maxScrollable,
        scrollY,
        progress,
      }
      targetFrameRef.current = currentFrame

      if (activeBeat?.id !== activeBeatRef.current?.id) {
        activeBeatRef.current = activeBeat
        setActiveBeatId(activeBeat?.id ?? "")
      }
    }

    const redrawCurrentFrame = () => {
      const drawIndex = findNearestLoadedFrame(
        renderedFrameRef.current >= 0 ? renderedFrameRef.current : 0,
        frameCount,
        loadedFramesRef.current
      )

      if (drawIndex < 0) {
        return
      }

      const image = frameImagesRef.current[drawIndex]
      if (!image) {
        return
      }

      drawImageCover(canvasRef.current, image)
    }

    const onResize = () => {
      updateFromScroll()
      redrawCurrentFrame()
    }

    const animate = (time) => {
      const targetFrame = clamp(Math.round(targetFrameRef.current), 0, frameCount - 1)

      if (targetFrame !== renderedFrameRef.current) {
        const nearestFrame = findNearestLoadedFrame(
          targetFrame,
          frameCount,
          loadedFramesRef.current
        )

        if (nearestFrame >= 0) {
          const image = frameImagesRef.current[nearestFrame]
          if (image) {
            drawImageCover(canvasRef.current, image)
            renderedFrameRef.current = nearestFrame
          }
        }
      }

      if (showDebug && time - debugRafTimeRef.current > 66) {
        const metrics = metricsRef.current
        debugRafTimeRef.current = time

        setDebugState({
          sectionId: data?.id ?? "",
          progress: metrics.progress,
          activeBeatId: activeBeatRef.current?.id ?? "",
          currentFrame: clamp(Math.round(targetFrameRef.current), 0, frameCount - 1),
          loadedCount: loadedCountRef.current,
          frameCount,
          sectionHeight: metrics.sectionHeight,
          viewportHeight: metrics.viewportHeight,
          maxScrollable: metrics.maxScrollable,
          scrollY: metrics.scrollY,
          sectionTop: metrics.sectionTop,
          folderPath: `${data?.basePath ?? ""}/${data?.folder ?? ""}`,
        })
      }

      rafIdRef.current = window.requestAnimationFrame(animate)
    }

    updateFromScroll()
    redrawCurrentFrame()

    window.addEventListener("scroll", updateFromScroll, { passive: true })
    window.addEventListener("resize", onResize)
    window.addEventListener("orientationchange", onResize)
    window.visualViewport?.addEventListener("resize", onResize)

    rafIdRef.current = window.requestAnimationFrame(animate)

    return () => {
      window.removeEventListener("scroll", updateFromScroll)
      window.removeEventListener("resize", onResize)
      window.removeEventListener("orientationchange", onResize)
      window.visualViewport?.removeEventListener("resize", onResize)

      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current)
      }
    }
  }, [data?.beats, data?.basePath, data?.folder, data?.id, frameCount, showDebug])

  const isDebugVisible =
    showDebug &&
    debugState.scrollY >= debugState.sectionTop - debugState.viewportHeight &&
    debugState.scrollY <= debugState.sectionTop + debugState.sectionHeight

  return (
    <section
      id={data?.id}
      ref={sectionRef}
      style={{ minHeight: `${chapterHeightVh}vh` }}
      className="relative bg-neutral-950"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <canvas ref={canvasRef} className="block h-full w-full" />
        <div className="pointer-events-none absolute inset-0 bg-black/35" />

        <div className="absolute inset-0 z-10">
          {data?.beats?.map((beat) => (
            <BeatContent
              key={beat.id}
              beatKey={beat.contentKey}
              isActive={activeBeatId === beat.id}
            />
          ))}
        </div>
      </div>

      {isDebugVisible && (
        <div className="fixed bottom-3 right-3 z-50 rounded-xl border border-white/20 bg-black/70 px-3 py-2 font-mono text-[11px] text-white shadow-lg backdrop-blur-md">
          <div className="mb-1 text-[10px] uppercase tracking-[0.08em] text-white/80">
            Sequence Debug
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
            <span className="text-white/70">section</span>
            <span className="text-right">{debugState.sectionId}</span>
            <span className="text-white/70">progress</span>
            <span className="text-right">{debugState.progress.toFixed(3)}</span>
            <span className="text-white/70">beat</span>
            <span className="text-right">{debugState.activeBeatId || "-"}</span>
            <span className="text-white/70">frame</span>
            <span className="text-right">{debugState.currentFrame}</span>
            <span className="text-white/70">loaded</span>
            <span className="text-right">
              {debugState.loadedCount}/{debugState.frameCount}
            </span>
            <span className="text-white/70">height</span>
            <span className="text-right">{Math.round(debugState.sectionHeight)}</span>
            <span className="text-white/70">viewport</span>
            <span className="text-right">{Math.round(debugState.viewportHeight)}</span>
            <span className="text-white/70">max scroll</span>
            <span className="text-right">{Math.round(debugState.maxScrollable)}</span>
            <span className="text-white/70">scrollY</span>
            <span className="text-right">{Math.round(debugState.scrollY)}</span>
            <span className="text-white/70">sectionTop</span>
            <span className="text-right">{Math.round(debugState.sectionTop)}</span>
            <span className="text-white/70">folder</span>
            <span className="text-right">{debugState.folderPath}</span>
          </div>
        </div>
      )}
    </section>
  )
}
