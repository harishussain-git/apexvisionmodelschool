"use client"

import { useRef } from "react"

import useSectionSnap from "@/components/ui/useSectionSnap"

export default function SnapSection({
  id,
  snapConfig,
  className = "",
  children,
  showDebug = false,
}) {
  const sectionRef = useRef(null)
  const { debugState } = useSectionSnap({ sectionRef, snapConfig, debug: showDebug })
  const shouldShowDebugPanel =
    showDebug &&
    debugState.scrollY >= debugState.sectionTop - debugState.viewportHeight &&
    debugState.scrollY <= debugState.sectionTop + debugState.sectionHeight

  return (
    <section id={id} ref={sectionRef} className={className}>
      {children}

      {shouldShowDebugPanel && (
        <div className="fixed bottom-3 right-3 z-50 rounded-xl border border-white/20 bg-black/65 px-3 py-2 font-mono text-[11px] text-white shadow-lg backdrop-blur-md">
          <div className="mb-1 text-[10px] uppercase tracking-[0.08em] text-white/80">Snap Debug</div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
            <span className="text-white/70">section</span>
            <span className="text-right">{debugState.sectionId || "-"}</span>
            <span className="text-white/70">top</span>
            <span className="text-right">{Math.round(debugState.sectionTop)}</span>
            <span className="text-white/70">height</span>
            <span className="text-right">{Math.round(debugState.sectionHeight)}</span>
            <span className="text-white/70">viewport</span>
            <span className="text-right">{Math.round(debugState.viewportHeight)}</span>
            <span className="text-white/70">max scroll</span>
            <span className="text-right">{Math.round(debugState.maxScrollable)}</span>
            <span className="text-white/70">raw scrollY</span>
            <span className="text-right">{Math.round(debugState.scrollY)}</span>
            <span className="text-white/70">progress</span>
            <span className="text-right">{debugState.progress.toFixed(3)}</span>
            <span className="text-white/70">direction</span>
            <span className="text-right">{debugState.direction}</span>
            <span className="text-white/70">isSnapping</span>
            <span className="text-right">{debugState.isSnapping ? "yes" : "no"}</span>
            <span className="text-white/70">enabled</span>
            <span className="text-right">{debugState.enabled ? "yes" : "no"}</span>
            <span className="text-white/70">up threshold</span>
            <span className="text-right">{debugState.upThreshold.toFixed(2)}</span>
            <span className="text-white/70">down threshold</span>
            <span className="text-right">{debugState.downThreshold.toFixed(2)}</span>
            <span className="text-white/70">up target</span>
            <span className="text-right">{debugState.upTarget || "-"}</span>
            <span className="text-white/70">down target</span>
            <span className="text-right">{debugState.downTarget || "-"}</span>
            <span className="text-white/70">targetY</span>
            <span className="text-right">
              {typeof debugState.targetY === "number" ? Math.round(debugState.targetY) : "-"}
            </span>
            <span className="text-white/70">lenis</span>
            <span className="text-right">{debugState.lenisDetected ? "yes" : "no"}</span>
          </div>
        </div>
      )}
    </section>
  )
}
