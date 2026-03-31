"use client";

import { useEffect, useState } from "react";

import UpDownBtn from "@/components/ui/UpDownBtn";
import { HOME_SEQUENCE_CONFIG } from "@/components/home/homeSequenceConfig";
import {
  animateSequenceScrollToSection,
  isSequenceScrollLocked,
  isWithinSequenceScrollRange,
} from "@/utils/home/sequence-anchor-navigation";

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export default function SequenceAnchorScrollButton({
  sequenceId = "",
  sections = [],
  activeIndex = 0,
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const syncButtonState = () => {
      const nextVisible = isWithinSequenceScrollRange(sequenceId);
      setIsVisible(nextVisible);
    };

    syncButtonState();
    window.addEventListener("scroll", syncButtonState, { passive: true });
    window.addEventListener("resize", syncButtonState);

    return () => {
      window.removeEventListener("scroll", syncButtonState);
      window.removeEventListener("resize", syncButtonState);
    };
  }, [sequenceId, sections]);

  const jumpByOffset = (offset) => {
    if (!sections.length || isSequenceScrollLocked()) {
      return;
    }

    const nextIndex = clamp(activeIndex + offset, 0, sections.length - 1);
    animateSequenceScrollToSection({
      sequenceId,
      sections,
      sourceIndex: activeIndex,
      targetIndex: nextIndex,
      durationMs: HOME_SEQUENCE_CONFIG.snapDurationMs,
    });
  };

  if (!isVisible) {
    return null;
  }

  const hasPrevious = activeIndex > 0;
  const hasNext = activeIndex < sections.length - 1;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-4">
      <UpDownBtn
        direction="up"
        label="Go to previous sequence section"
        onClick={() => jumpByOffset(-1)}
        disabled={!hasPrevious}
      />
      <UpDownBtn
        direction="down"
        label="Go to next sequence section"
        onClick={() => jumpByOffset(1)}
        disabled={!hasNext}
      />
    </div>
  );
}
