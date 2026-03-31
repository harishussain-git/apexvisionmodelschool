"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"

const DESKTOP_BREAKPOINT = 1024
const MAX_ROTATE_X = 3
const MAX_ROTATE_Y = 5
const MAX_TRANSLATE = 20
const PERSPECTIVE = 1200
const SCALE = 1.01
const BASE_OVERSCAN_SCALE = 1.08
const SMOOTHING = 0.12

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

export default function Mouse3DPage() {
  const wrapperRef = useRef(null)
  const layerRef = useRef(null)
  const titleRef = useRef(null)
  const frameRef = useRef(null)
  const targetRef = useRef({ x: 0, y: 0 })
  const currentRef = useRef({ x: 0, y: 0 })
  const activeRef = useRef(false)
  const [isDesktopEnabled, setIsDesktopEnabled] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined
    }

    // Only allow the effect on desktop-like devices with mouse hover.
    const desktopQuery = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`)
    const pointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)")
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")

    const updateAvailability = () => {
      setIsDesktopEnabled(
        desktopQuery.matches &&
          pointerQuery.matches &&
          !reducedMotionQuery.matches
      )
    }

    updateAvailability()

    desktopQuery.addEventListener("change", updateAvailability)
    pointerQuery.addEventListener("change", updateAvailability)
    reducedMotionQuery.addEventListener("change", updateAvailability)
    window.addEventListener("resize", updateAvailability)

    return () => {
      desktopQuery.removeEventListener("change", updateAvailability)
      pointerQuery.removeEventListener("change", updateAvailability)
      reducedMotionQuery.removeEventListener("change", updateAvailability)
      window.removeEventListener("resize", updateAvailability)
    }
  }, [])

  useEffect(() => {
    const wrapper = wrapperRef.current
    const layer = layerRef.current
    const title = titleRef.current

    if (!wrapper || !layer || !title) {
      return undefined
    }

    const setNeutralTransform = () => {
      layer.style.transform =
        `translate3d(0px, 0px, 0px) rotateX(0deg) rotateY(0deg) scale(${BASE_OVERSCAN_SCALE})`
      title.style.transform = "translate3d(0px, 0px, 0px)"
    }

    if (!isDesktopEnabled) {
      activeRef.current = false
      targetRef.current = { x: 0, y: 0 }
      currentRef.current = { x: 0, y: 0 }
      window.cancelAnimationFrame(frameRef.current)
      frameRef.current = null
      setNeutralTransform()
      return undefined
    }

    // Smoothly interpolate toward the mouse position using requestAnimationFrame.
    const animate = () => {
      const current = currentRef.current
      const target = targetRef.current

      current.x += (target.x - current.x) * SMOOTHING
      current.y += (target.y - current.y) * SMOOTHING

      const rotateX = current.y * -MAX_ROTATE_X
      const rotateY = current.x * -MAX_ROTATE_Y
      const translateX = current.x * MAX_TRANSLATE
      const translateY = current.y * MAX_TRANSLATE
      const appliedScale = BASE_OVERSCAN_SCALE * (activeRef.current ? SCALE : 1)

      layer.style.transform =
        `translate3d(${translateX.toFixed(2)}px, ${translateY.toFixed(2)}px, 0px) ` +
        `rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale(${appliedScale})`

      // Give the title a lighter parallax move so the whole scene feels layered.
      title.style.transform =
        `translate3d(${(translateX * 0.45).toFixed(2)}px, ${(translateY * 0.45).toFixed(2)}px, 0px)`

      const isSettled =
        Math.abs(current.x - target.x) < 0.001 &&
        Math.abs(current.y - target.y) < 0.001

      if (!activeRef.current && isSettled) {
        frameRef.current = null
        return
      }

      frameRef.current = window.requestAnimationFrame(animate)
    }

    const startAnimation = () => {
      if (frameRef.current !== null) {
        return
      }

      frameRef.current = window.requestAnimationFrame(animate)
    }

    const handleMouseMove = (event) => {
      const rect = wrapper.getBoundingClientRect()

      if (!rect.width || !rect.height) {
        return
      }

      const normalizedX = clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1, 1)
      const normalizedY = clamp(((event.clientY - rect.top) / rect.height) * 2 - 1, -1, 1)

      activeRef.current = true
      targetRef.current = {
        x: normalizedX,
        y: normalizedY,
      }
      startAnimation()
    }

    const handleMouseLeave = () => {
      activeRef.current = false
      targetRef.current = { x: 0, y: 0 }
      startAnimation()
    }

    wrapper.addEventListener("mousemove", handleMouseMove)
    wrapper.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      wrapper.removeEventListener("mousemove", handleMouseMove)
      wrapper.removeEventListener("mouseleave", handleMouseLeave)
      window.cancelAnimationFrame(frameRef.current)
      frameRef.current = null
      setNeutralTransform()
    }
  }, [isDesktopEnabled])

  return (
    <main className="relative h-screen overflow-hidden bg-neutral-950 text-white">
      {/* Perspective container keeps the fake 3D transform isolated to this page only. */}
      <div
        ref={wrapperRef}
        className="relative h-full w-full"
        style={{ perspective: `${PERSPECTIVE}px` }}
      >
        {/* Transform layer holds the background scene and receives the mouse tilt. */}
        <div
          ref={layerRef}
          className="absolute inset-0"
          style={{
            transform: `translate3d(0px, 0px, 0px) rotateX(0deg) rotateY(0deg) scale(${BASE_OVERSCAN_SCALE})`,
            transformStyle: "preserve-3d",
            willChange: "transform",
          }}
        >
          <Image
            src="/sequences/hero-cloudtext/0001.webp"
            alt="Mouse 3D depth background"
            fill
            priority
            unoptimized
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/20 to-black/55" />
        </div>

        <div className="absolute inset-0 z-10 flex items-center justify-center px-6 text-center">
          <h1
            ref={titleRef}
            className="font-accent text-5xl leading-none text-white drop-shadow-[0_14px_40px_rgba(0,0,0,0.35)] sm:text-7xl lg:text-8xl"
            style={{
              willChange: "transform",
            }}
          >
            Mouse 3D Depth Test
          </h1>
        </div>
      </div>
    </main>
  )
}

