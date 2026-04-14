"use client";

import { useEffect, useRef, useState } from "react";

export const SEQUENCE_DEPTH_CONFIG = {
  desktopBreakpoint: 1024,
  maxRotateX: 0.5,
  maxRotateY: 0.9,
  maxTranslate: 2,
  perspective: 1200,
  scale: 1.002,
  baseOverscanScale: 1.02,
  smoothing: 0.06,
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function subscribeToMediaQuery(query, handler) {
  if (typeof query.addEventListener === "function") {
    query.addEventListener("change", handler);
    return () => {
      query.removeEventListener("change", handler);
    };
  }

  if (typeof query.addListener === "function") {
    query.addListener(handler);
    return () => {
      query.removeListener(handler);
    };
  }

  return () => {};
}

function getBrowserDepthProfile() {
  if (typeof navigator === "undefined") {
    return {
      allowRotation: true,
      translateMultiplier: 1,
      scaleMultiplier: 1,
    };
  }

  const userAgent = navigator.userAgent;
  const isFirefox = /Firefox/i.test(userAgent);
  const isSafari =
    /Safari/i.test(userAgent) &&
    !/Chrome|Chromium|Edg|OPR|OPiOS|CriOS|FxiOS/i.test(userAgent);
  const isChromium = /Chrome|Chromium|Edg|OPR|CriOS/i.test(userAgent) && !isFirefox;

  if (!isChromium || isFirefox || isSafari) {
    return {
      allowRotation: false,
      translateMultiplier: 0.75,
      scaleMultiplier: 1,
    };
  }

  return {
    allowRotation: true,
    translateMultiplier: 1,
    scaleMultiplier: 1,
  };
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
  const [browserDepthProfile, setBrowserDepthProfile] = useState({
    allowRotation: true,
    translateMultiplier: 1,
    scaleMultiplier: 1,
  });

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
    setBrowserDepthProfile(getBrowserDepthProfile());

    const unsubscribeDesktop = subscribeToMediaQuery(desktopQuery, updateAvailability);
    const unsubscribePointer = subscribeToMediaQuery(pointerQuery, updateAvailability);
    const unsubscribeReducedMotion = subscribeToMediaQuery(reducedMotionQuery, updateAvailability);
    window.addEventListener("resize", updateAvailability);

    return () => {
      unsubscribeDesktop();
      unsubscribePointer();
      unsubscribeReducedMotion();
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

      const rotateX = browserDepthProfile.allowRotation
        ? current.y * -SEQUENCE_DEPTH_CONFIG.maxRotateX
        : 0;
      const rotateY = browserDepthProfile.allowRotation
        ? current.x * -SEQUENCE_DEPTH_CONFIG.maxRotateY
        : 0;
      const translateX =
        current.x * SEQUENCE_DEPTH_CONFIG.maxTranslate * browserDepthProfile.translateMultiplier;
      const translateY =
        current.y * SEQUENCE_DEPTH_CONFIG.maxTranslate * browserDepthProfile.translateMultiplier;
      const appliedScale =
        SEQUENCE_DEPTH_CONFIG.baseOverscanScale *
        (activeRef.current ? SEQUENCE_DEPTH_CONFIG.scale * browserDepthProfile.scaleMultiplier : 1);

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

    const handlePointerMove = (event) => {
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

    const handlePointerLeave = () => {
      activeRef.current = false;
      targetRef.current = { x: 0, y: 0 };
      startAnimation();
    };

    const moveEvent = "onpointermove" in window ? "pointermove" : "mousemove";
    const leaveEvent = "onpointerleave" in window ? "pointerleave" : "mouseleave";

    viewport.addEventListener(moveEvent, handlePointerMove);
    viewport.addEventListener(leaveEvent, handlePointerLeave);

    return () => {
      viewport.removeEventListener(moveEvent, handlePointerMove);
      viewport.removeEventListener(leaveEvent, handlePointerLeave);
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
      setNeutralTransform();
    };
  }, [browserDepthProfile, enabled, isDesktopEnabled, layerRef, viewportRef]);
}
