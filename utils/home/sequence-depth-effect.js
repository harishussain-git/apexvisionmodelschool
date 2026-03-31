"use client";

import { useEffect, useRef, useState } from "react";

export const SEQUENCE_DEPTH_CONFIG = {
  desktopBreakpoint: 1024,
  maxRotateX: 1.5,
  maxRotateY: 2.5,
  maxTranslate: 8,
  perspective: 1200,
  scale: 1.005,
  baseOverscanScale: 1.04,
  smoothing: 0.1,
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function useSequenceDepthEffect({
  viewportRef,
  layerRef,
  enabled = false,
}) {
  const frameRef = useRef(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const activeRef = useRef(false);
  const [isDesktopEnabled, setIsDesktopEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const desktopQuery = window.matchMedia(`(min-width: ${SEQUENCE_DEPTH_CONFIG.desktopBreakpoint}px)`);
    const pointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updateAvailability = () => {
      setIsDesktopEnabled(
        desktopQuery.matches &&
          pointerQuery.matches &&
          !reducedMotionQuery.matches,
      );
    };

    updateAvailability();

    desktopQuery.addEventListener("change", updateAvailability);
    pointerQuery.addEventListener("change", updateAvailability);
    reducedMotionQuery.addEventListener("change", updateAvailability);
    window.addEventListener("resize", updateAvailability);

    return () => {
      desktopQuery.removeEventListener("change", updateAvailability);
      pointerQuery.removeEventListener("change", updateAvailability);
      reducedMotionQuery.removeEventListener("change", updateAvailability);
      window.removeEventListener("resize", updateAvailability);
    };
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    const layer = layerRef.current;

    if (!viewport || !layer) {
      return undefined;
    }

    const setNeutralTransform = () => {
      layer.style.transform =
        `translate3d(0px, 0px, 0px) rotateX(0deg) rotateY(0deg) scale(${SEQUENCE_DEPTH_CONFIG.baseOverscanScale})`;
    };

    if (!enabled || !isDesktopEnabled) {
      activeRef.current = false;
      targetRef.current = { x: 0, y: 0 };
      currentRef.current = { x: 0, y: 0 };
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
      setNeutralTransform();
      return undefined;
    }

    const animate = () => {
      const current = currentRef.current;
      const target = targetRef.current;

      current.x += (target.x - current.x) * SEQUENCE_DEPTH_CONFIG.smoothing;
      current.y += (target.y - current.y) * SEQUENCE_DEPTH_CONFIG.smoothing;

      const rotateX = current.y * -SEQUENCE_DEPTH_CONFIG.maxRotateX;
      const rotateY = current.x * -SEQUENCE_DEPTH_CONFIG.maxRotateY;
      const translateX = current.x * SEQUENCE_DEPTH_CONFIG.maxTranslate;
      const translateY = current.y * SEQUENCE_DEPTH_CONFIG.maxTranslate;
      const appliedScale =
        SEQUENCE_DEPTH_CONFIG.baseOverscanScale *
        (activeRef.current ? SEQUENCE_DEPTH_CONFIG.scale : 1);

      layer.style.transform =
        `translate3d(${translateX.toFixed(2)}px, ${translateY.toFixed(2)}px, 0px) ` +
        `rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale(${appliedScale})`;

      const isSettled =
        Math.abs(current.x - target.x) < 0.001 &&
        Math.abs(current.y - target.y) < 0.001;

      if (!activeRef.current && isSettled) {
        frameRef.current = null;
        return;
      }

      frameRef.current = window.requestAnimationFrame(animate);
    };

    const startAnimation = () => {
      if (frameRef.current !== null) {
        return;
      }

      frameRef.current = window.requestAnimationFrame(animate);
    };

    const handleMouseMove = (event) => {
      const rect = viewport.getBoundingClientRect();
      if (!rect.width || !rect.height) {
        return;
      }

      const normalizedX = clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
      const normalizedY = clamp(((event.clientY - rect.top) / rect.height) * 2 - 1, -1, 1);

      activeRef.current = true;
      targetRef.current = {
        x: normalizedX,
        y: normalizedY,
      };
      startAnimation();
    };

    const handleMouseLeave = () => {
      activeRef.current = false;
      targetRef.current = { x: 0, y: 0 };
      startAnimation();
    };

    viewport.addEventListener("mousemove", handleMouseMove);
    viewport.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      viewport.removeEventListener("mousemove", handleMouseMove);
      viewport.removeEventListener("mouseleave", handleMouseLeave);
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
      setNeutralTransform();
    };
  }, [enabled, isDesktopEnabled, layerRef, viewportRef]);
}
