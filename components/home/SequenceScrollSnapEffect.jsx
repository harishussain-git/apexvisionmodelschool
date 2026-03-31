"use client";

import { useEffect, useRef } from "react";

import { HOME_SEQUENCE_CONFIG } from "@/components/home/homeSequenceConfig";
import {
  animateSequenceScrollToSection,
  isSequenceScrollLocked,
  isWithinSequenceScrollRange,
} from "@/utils/home/sequence-anchor-navigation";

const WHEEL_INTENT_DELTA = 28;
const WHEEL_RESET_MS = 160;
const TOUCH_INTENT_DELTA = 36;

export default function SequenceScrollSnapEffect({
  sequenceId = "",
  sections = [],
  activeIndex = 0,
}) {
  const activeIndexRef = useRef(activeIndex);
  const wheelAccumulatorRef = useRef(0);
  const wheelDirectionRef = useRef(0);
  const wheelResetTimeoutRef = useRef(null);
  const touchStartYRef = useRef(null);
  const touchTriggeredRef = useRef(false);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    const resetWheelGesture = () => {
      wheelAccumulatorRef.current = 0;
      wheelDirectionRef.current = 0;
      window.clearTimeout(wheelResetTimeoutRef.current);
      wheelResetTimeoutRef.current = null;
    };

    const canMoveByDirection = (direction) => {
      const currentIndex = activeIndexRef.current;
      const nextIndex = Math.min(Math.max(currentIndex + direction, 0), sections.length - 1);

      return nextIndex !== currentIndex;
    };

    const snapByDirection = (direction) => {
      const currentIndex = activeIndexRef.current;
      const nextIndex = Math.min(Math.max(currentIndex + direction, 0), sections.length - 1);

      // At the first/last anchor, allow normal page scrolling to continue out of the sequence.
      if (nextIndex === currentIndex) {
        return false;
      }

      animateSequenceScrollToSection({
        sequenceId,
        sections,
        sourceIndex: currentIndex,
        targetIndex: nextIndex,
        durationMs: HOME_SEQUENCE_CONFIG.snapDurationMs,
      });

      return true;
    };

    const onWheel = (event) => {
      if (!isWithinSequenceScrollRange(sequenceId)) {
        resetWheelGesture();
        return;
      }

      if (isSequenceScrollLocked()) {
        resetWheelGesture();
        event.preventDefault();
        return;
      }

      const direction = Math.sign(event.deltaY);
      if (!direction) {
        return;
      }

      if (!canMoveByDirection(direction)) {
        resetWheelGesture();
        return;
      }

      // Once the gesture direction is valid inside the sequence, stop native wheel scrolling
      // and let this component decide when to commit the next section step.
      event.preventDefault();

      if (wheelDirectionRef.current !== direction) {
        wheelDirectionRef.current = direction;
        wheelAccumulatorRef.current = 0;
      }

      wheelAccumulatorRef.current += Math.abs(event.deltaY);

      window.clearTimeout(wheelResetTimeoutRef.current);
      wheelResetTimeoutRef.current = window.setTimeout(() => {
        resetWheelGesture();
      }, WHEEL_RESET_MS);

      if (wheelAccumulatorRef.current < WHEEL_INTENT_DELTA) {
        return;
      }

      resetWheelGesture();
      const didSnap = snapByDirection(direction);
      if (!didSnap) {
        return;
      }
    };

    const onTouchStart = (event) => {
      if (!isWithinSequenceScrollRange(sequenceId) || isSequenceScrollLocked()) {
        touchStartYRef.current = null;
        touchTriggeredRef.current = false;
        return;
      }

      const touch = event.touches?.[0];
      if (!touch) {
        return;
      }

      touchStartYRef.current = touch.clientY;
      touchTriggeredRef.current = false;
    };

    const onTouchMove = (event) => {
      if (!isWithinSequenceScrollRange(sequenceId)) {
        return;
      }

      if (isSequenceScrollLocked()) {
        event.preventDefault();
        return;
      }

      const touch = event.touches?.[0];
      if (!touch || touchStartYRef.current === null || touchTriggeredRef.current) {
        return;
      }

      const deltaY = touchStartYRef.current - touch.clientY;
      if (!deltaY) {
        return;
      }

      const direction = Math.sign(deltaY);
      if (!direction) {
        return;
      }

      if (!canMoveByDirection(direction)) {
        return;
      }

      // Stop native touch scrolling for in-sequence gestures and commit one section move
      // once the swipe distance is large enough.
      event.preventDefault();

      if (Math.abs(deltaY) < TOUCH_INTENT_DELTA) {
        return;
      }

      const didSnap = snapByDirection(direction);
      if (didSnap) {
        touchTriggeredRef.current = true;
      }
    };

    const resetTouch = () => {
      touchStartYRef.current = null;
      touchTriggeredRef.current = false;
    };

    // Gesture-driven snapping gives one committed section move per intent,
    // without the previous threshold-based "snap back" behavior.
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", resetTouch, { passive: true });
    window.addEventListener("touchcancel", resetTouch, { passive: true });

    return () => {
      resetWheelGesture();
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", resetTouch);
      window.removeEventListener("touchcancel", resetTouch);
    };
  }, [sequenceId, sections]);

  return null;
}
