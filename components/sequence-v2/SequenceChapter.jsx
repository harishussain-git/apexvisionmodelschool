"use client"

import { useEffect, useRef, useState } from "react"

import SequenceChapterContent from "@/components/sequence-v2/SequenceChapterContent"
import {
  clamp,
  drawImageCover,
  findNearestLoadedFrame,
  getActiveAnchorByFrame,
} from "@/components/sequence-v2/sequence-utils"

export default function SequenceChapter({ data }) {
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
  })
  const targetFrameRef = useRef(0)
  const renderedFrameRef = useRef(-1)
  const rafIdRef = useRef(null)
  const debugRafTimeRef = useRef(0)

  const [loadedCount, setLoadedCount] = useState(0)
  const [activeBeatId, setActiveBeatId] = useState(data?.anchors?.[0]?.id ?? "")
  const [debugState, setDebugState] = useState({
    chapterId: data?.id ?? "",
    folder: data?.folder ?? "",
    frameCount: data?.frameCount ?? 0,
    loadedCount: 0,
    progress: 0,
    currentFrame: 0,
    activeBeatId: data?.anchors?.[0]?.id ?? "",
    sectionHeight: 0,
    viewportHeight: 0,
    maxScrollable: 1,
    scrollY: 0,
    sectionTop: 0,
  })

  const frameCount = data?.frameCount ?? 0
  const showDebug = Boolean(data?.showDebug)

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

      image.src = `${data.basePath}/${data.folder}/${frameIndex}.webp`
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

      metricsRef.current = {
        sectionTop,
        sectionHeight,
        viewportHeight,
        maxScrollable,
        scrollY,
        progress,
      }

      targetFrameRef.current = Math.round(progress * (frameCount - 1))

      if (data?.anchors?.length) {
        const currentFrame = Math.round(progress * (frameCount - 1))
        const activeAnchor = getActiveAnchorByFrame(currentFrame, data.anchors)
        setActiveBeatId((current) =>
          current === activeAnchor?.id ? current : activeAnchor?.id ?? ""
        )
      }
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

    const handleResize = () => {
      updateFromScroll()
      redrawCurrentFrame()
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
          loadedCount: loadedCountRef.current,
          progress: metrics.progress,
          currentFrame: frameIndex,
          activeBeatId,
          sectionHeight: metrics.sectionHeight,
          viewportHeight: metrics.viewportHeight,
          maxScrollable: metrics.maxScrollable,
          scrollY: metrics.scrollY,
          sectionTop: metrics.sectionTop,
        })
      }

      rafIdRef.current = window.requestAnimationFrame(animate)
    }

    updateFromScroll()
    redrawCurrentFrame()

    window.addEventListener("scroll", updateFromScroll, { passive: true })
    window.addEventListener("resize", handleResize)
    window.addEventListener("orientationchange", handleResize)
    window.visualViewport?.addEventListener("resize", handleResize)

    rafIdRef.current = window.requestAnimationFrame(animate)

    return () => {
      window.removeEventListener("scroll", updateFromScroll)
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("orientationchange", handleResize)
      window.visualViewport?.removeEventListener("resize", handleResize)

      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current)
      }
    }
  }, [activeBeatId, data?.anchors, data?.basePath, data?.folder, data?.id, frameCount, showDebug])

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
        <canvas ref={canvasRef} className="block h-full w-full" />

        <div className="absolute inset-0 z-10">
          <SequenceChapterContent chapter={data} activeBeatId={activeBeatId} />
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
            <span className="text-white/70">Current Frame</span>
            <span className="text-right">{debugState.currentFrame}</span>
            <span className="text-white/70">ActiveBeat</span>
            <span className="text-right">{debugState.activeBeatId || "-"}</span>
            <span className="text-white/70">Progress</span>
            <span className="text-right">{debugState.progress.toFixed(3)}</span>
          </div>
        </div>
      )}
    </section>
  )
}
