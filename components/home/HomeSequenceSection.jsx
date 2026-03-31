"use client";

import { useEffect, useRef, useState } from "react";

import SequenceAnchorScrollButton from "@/components/home/SequenceAnchorScrollButton";
import SequenceLoaderOverlay from "@/components/home/SequenceLoaderOverlay";
import SequenceSectionMotion from "@/components/home/SequenceSectionMotion";
import SequenceScrollSnapEffect from "@/components/home/SequenceScrollSnapEffect";
import { frameToImagePath } from "@/utils/home/frame-utils";
import {
  subscribeToSequenceNavigationEnd,
  subscribeToSequenceNavigationStart,
} from "@/utils/home/sequence-anchor-navigation";
import {
  SEQUENCE_DEPTH_CONFIG,
  useSequenceDepthEffect,
} from "@/utils/home/sequence-depth-effect";
import { HOME_SEQUENCE_CONFIG } from "@/components/home/homeSequenceConfig";

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getActiveSectionIndex(progress) {
  const currentFrame = Math.round(progress * (HOME_SEQUENCE_CONFIG.frameCount - 1)) + 1;

  return HOME_SEQUENCE_CONFIG.sections.reduce((bestIndex, section, sectionIndex) => {
    return currentFrame >= section.startFrame ? sectionIndex : bestIndex;
  }, 0);
}

const PRELOAD_SECTIONS = HOME_SEQUENCE_CONFIG.sections.slice(
  0,
  HOME_SEQUENCE_CONFIG.loaderPreloadSectionCount ?? 0,
);

const PRELOAD_FRAME_PATHS = PRELOAD_SECTIONS.flatMap((section) => {
  return Array.from({ length: section.frameCount }, (_, index) => {
    return frameToImagePath(section.sectionImgFolder, index + 1, "webp");
  });
});

const PRELOAD_FRAME_TOTAL = PRELOAD_FRAME_PATHS.length;
const PRELOAD_STATIC_ASSET_TOTAL = 2;
const PRELOAD_RESOURCE_TOTAL = PRELOAD_FRAME_TOTAL + PRELOAD_STATIC_ASSET_TOTAL;

function loadImageAsset(src) {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(src);
    image.onerror = () => reject(new Error(`Failed to load ${src}`));
    image.src = src;
  });
}

export default function HomeSequenceSection() {
  const wrapperRef = useRef(null);
  const viewportRef = useRef(null);
  const imageLayerRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [loadedAssetCount, setLoadedAssetCount] = useState(0);
  const [isLoaderReady, setIsLoaderReady] = useState(false);
  const [isLoaderMounted, setIsLoaderMounted] = useState(true);
  const [isHeroIntroActive, setIsHeroIntroActive] = useState(true);
  const [sectionMotionDirection, setSectionMotionDirection] = useState("down");
  const [exitingSectionState, setExitingSectionState] = useState(null);
  const [delayedEnterState, setDelayedEnterState] = useState(null);
  const activeIndexRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    let completedCount = 0;

    const markLoaded = () => {
      if (cancelled) {
        return;
      }

      completedCount += 1;
      setLoadedAssetCount(completedCount);
    };

    const preloadResources = async () => {
      try {
        if (document.fonts?.load) {
          await document.fonts.load('700 48px "RFRufo"');
          if (document.fonts.ready) {
            await document.fonts.ready;
          }
        }
      } catch {}

      markLoaded();

      try {
        await loadImageAsset("/icons/apex-logo.svg");
      } catch {}

      markLoaded();

      for (const src of PRELOAD_FRAME_PATHS) {
        try {
          await loadImageAsset(src);
        } catch {}

        markLoaded();
      }

      if (!cancelled) {
        setIsLoaderReady(true);
      }
    };

    preloadResources();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isLoaderReady) {
      return undefined;
    }

    const loaderTimeout = window.setTimeout(() => {
      setIsLoaderMounted(false);
    }, 900);

    const heroIntroTimeout = window.setTimeout(() => {
      setIsHeroIntroActive(false);
    }, 1400);

    return () => {
      window.clearTimeout(loaderTimeout);
      window.clearTimeout(heroIntroTimeout);
    };
  }, [isLoaderReady]);

  useEffect(() => {
    if (!isLoaderMounted) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isLoaderMounted]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) {
      return undefined;
    }

    let frameRequest = null;

    const syncProgress = () => {
      const rect = wrapper.getBoundingClientRect();
      const maxTravel = Math.max(rect.height - window.innerHeight, 1);
      const traveled = clamp(-rect.top, 0, maxTravel);
      const nextProgress = clamp(traveled / maxTravel, 0, 1);
      const nextActiveIndex = getActiveSectionIndex(nextProgress);

      if (nextActiveIndex !== activeIndexRef.current) {
        const nextDirection = nextActiveIndex > activeIndexRef.current ? "down" : "up";
        activeIndexRef.current = nextActiveIndex;
        setSectionMotionDirection(nextDirection);
      }

      setProgress(nextProgress);
      frameRequest = null;
    };

    const onScroll = () => {
      if (frameRequest !== null) {
        return;
      }

      frameRequest = window.requestAnimationFrame(syncProgress);
    };

    syncProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (frameRequest !== null) {
        window.cancelAnimationFrame(frameRequest);
      }

      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const currentFrame = Math.round(progress * (HOME_SEQUENCE_CONFIG.frameCount - 1)) + 1;
  const activeIndex = getActiveSectionIndex(progress);
  const activeSection = HOME_SEQUENCE_CONFIG.sections[activeIndex] ?? HOME_SEQUENCE_CONFIG.sections[0];
  const localFrame = currentFrame - activeSection.startFrame + 1;
  const imageSrc = frameToImagePath(activeSection.sectionImgFolder, localFrame, "webp");
  const depthTriggerFrame = Math.min(
    Math.max(Number(activeSection.depthTriggerFrame ?? activeSection.frameCount), 1),
    activeSection.frameCount,
  );
  const depthEffectEnabled = Boolean(
    localFrame === depthTriggerFrame,
  );
  const heroImageClassName =
    activeSection.id === "hero" && isHeroIntroActive
      ? "scale-[1.06]"
      : "scale-100";
  const visibleExitState =
    exitingSectionState && activeIndex === exitingSectionState.sourceIndex
      ? exitingSectionState
      : null;
  const shouldDelayEnter =
    Boolean(
      delayedEnterState &&
    delayedEnterState.direction === "up" &&
    delayedEnterState.targetIndex === activeIndex
    );

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    const unsubscribeStart = subscribeToSequenceNavigationStart((payload) => {
      if (
        payload.sequenceId !== HOME_SEQUENCE_CONFIG.id ||
        payload.sourceIndex < 0 ||
        payload.sourceIndex >= HOME_SEQUENCE_CONFIG.sections.length
      ) {
        return;
      }

      setExitingSectionState({
        section: HOME_SEQUENCE_CONFIG.sections[payload.sourceIndex],
        direction: payload.direction > 0 ? "down" : "up",
        sourceIndex: payload.sourceIndex,
      });

      setDelayedEnterState(
        payload.direction < 0
          ? {
              targetIndex: payload.targetIndex,
              direction: "up",
            }
          : null,
      );
    });

    const unsubscribeEnd = subscribeToSequenceNavigationEnd((payload) => {
      if (payload.sequenceId !== HOME_SEQUENCE_CONFIG.id) {
        return;
      }

      setExitingSectionState(null);
      setDelayedEnterState(null);
    });

    return () => {
      unsubscribeStart();
      unsubscribeEnd();
    };
  }, []);

  useSequenceDepthEffect({
    viewportRef,
    layerRef: imageLayerRef,
    enabled: depthEffectEnabled,
  });

  return (
    <section
      id={HOME_SEQUENCE_CONFIG.id}
      ref={wrapperRef}
      className="relative w-full bg-black"
      style={{ height: `${HOME_SEQUENCE_CONFIG.scrollVh}vh` }}
    >
      {isLoaderMounted ? (
        <SequenceLoaderOverlay
          loadedCount={loadedAssetCount}
          totalCount={PRELOAD_RESOURCE_TOTAL}
          isReady={isLoaderReady}
        />
      ) : null}
      <div
        ref={viewportRef}
        className="sticky top-0 h-screen w-full overflow-hidden bg-black"
        style={{ perspective: `${SEQUENCE_DEPTH_CONFIG.perspective}px` }}
      >
        <SequenceScrollSnapEffect
          sequenceId={HOME_SEQUENCE_CONFIG.id}
          sections={HOME_SEQUENCE_CONFIG.sections}
          activeIndex={activeIndex}
        />
        <SequenceAnchorScrollButton
          sequenceId={HOME_SEQUENCE_CONFIG.id}
          sections={HOME_SEQUENCE_CONFIG.sections}
          activeIndex={activeIndex}
        />
        <div
          ref={imageLayerRef}
          className="absolute inset-0"
          style={{
            transform: `translate3d(0px, 0px, 0px) rotateX(0deg) rotateY(0deg) scale(${SEQUENCE_DEPTH_CONFIG.baseOverscanScale})`,
            transformStyle: "preserve-3d",
            willChange: "transform",
          }}
        >
          <img
            src={imageSrc}
            alt={`${activeSection.id} frame ${currentFrame}`}
            className={`absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-out ${heroImageClassName}`}
          />
        </div>
        {visibleExitState ? (
          <SequenceSectionMotion
            section={visibleExitState.section}
            direction={visibleExitState.direction}
            mode="exit"
            motionConfig={HOME_SEQUENCE_CONFIG.sectionMotion}
          />
        ) : null}
        {!visibleExitState && !shouldDelayEnter ? (
          <SequenceSectionMotion
            section={activeSection}
            direction={sectionMotionDirection}
            mode="enter"
            motionConfig={HOME_SEQUENCE_CONFIG.sectionMotion}
          />
        ) : null}
      </div>
    </section>
  );
}
