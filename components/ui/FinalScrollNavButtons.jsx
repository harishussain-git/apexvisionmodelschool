"use client";

import { useEffect, useRef, useState } from "react";

import { getLenis, getScrollY, scrollToY } from "@/components/ui/snap-utils";

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function resolvePointY(point) {
  if (typeof window === "undefined") {
    return null;
  }

  if (point.type === "section") {
    const element = document.getElementById(point.elementId ?? point.id);
    if (!element) {
      return null;
    }

    return element.getBoundingClientRect().top + window.scrollY;
  }

  if (point.type === "group-section") {
    const groupElement = document.getElementById(point.groupId);
    if (!groupElement) {
      return null;
    }

    const progress = clamp(point.progress ?? 0, 0, 1);
    const groupTop = groupElement.getBoundingClientRect().top + window.scrollY;
    const maxTravel = Math.max(groupElement.offsetHeight - window.innerHeight, 1);

    return groupTop + maxTravel * progress;
  }

  return null;
}

function resolvePoints(points) {
  return points
    .map((point) => ({
      ...point,
      y: resolvePointY(point),
    }))
    .filter((point) => typeof point.y === "number" && Number.isFinite(point.y))
    .sort((a, b) => a.y - b.y);
}

function findActiveIndex(points, scrollY) {
  if (!points.length) {
    return -1;
  }

  let activeIndex = 0;

  for (let index = 0; index < points.length; index += 1) {
    if (scrollY >= points[index].y) {
      activeIndex = index;
      continue;
    }

    break;
  }

  return activeIndex;
}

function ArrowIcon({ direction }) {
  const rotation = direction === "up" ? "rotate(180 12 12)" : undefined;

  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
      <path
        d="M12 5v14M6 11l6-6 6 6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform={rotation}
      />
    </svg>
  );
}

export default function FinalScrollNavButtons({ points, settings }) {
  const resolvedPointsRef = useRef([]);
  const navigationTimeoutRef = useRef(null);
  const activeIndexRef = useRef(0);
  const isNavigatingRef = useRef(false);
  const [navState, setNavState] = useState({ activeIndex: 0, pointCount: 0, isNavigating: false });

  useEffect(() => {
    const syncFromScroll = () => {
      const resolvedPoints = resolvePoints(points);
      resolvedPointsRef.current = resolvedPoints;
      const pointCount = resolvedPoints.length;

      if (isNavigatingRef.current) {
        setNavState((previous) => ({
          ...previous,
          pointCount,
        }));
        return;
      }

      const nextActiveIndex = findActiveIndex(resolvedPoints, getScrollY());
      activeIndexRef.current = nextActiveIndex >= 0 ? nextActiveIndex : 0;
      setNavState({
        activeIndex: activeIndexRef.current,
        pointCount,
        isNavigating: false,
      });
    };

    syncFromScroll();
    window.addEventListener("scroll", syncFromScroll, { passive: true });
    window.addEventListener("resize", syncFromScroll);

    return () => {
      window.removeEventListener("scroll", syncFromScroll);
      window.removeEventListener("resize", syncFromScroll);
      window.clearTimeout(navigationTimeoutRef.current);
    };
  }, [points]);

  const finishNavigation = (fallbackIndex) => {
    isNavigatingRef.current = false;
    const resolvedPoints = resolvePoints(points);
    resolvedPointsRef.current = resolvedPoints;
    const settledIndex = findActiveIndex(resolvedPoints, getScrollY());
    activeIndexRef.current = settledIndex >= 0 ? settledIndex : fallbackIndex;
    setNavState({
      activeIndex: activeIndexRef.current,
      pointCount: resolvedPoints.length,
      isNavigating: false,
    });
  };

  const goToIndex = (offset) => {
    if (isNavigatingRef.current) {
      return;
    }

    const resolvedPoints = resolvePoints(points);
    resolvedPointsRef.current = resolvedPoints;

    const currentIndex = clamp(activeIndexRef.current, 0, Math.max(resolvedPoints.length - 1, 0));
    const nextIndex = clamp(currentIndex + offset, 0, resolvedPoints.length - 1);
    const targetPoint = resolvedPoints[nextIndex];

    if (!targetPoint || nextIndex === currentIndex) {
      return;
    }

    activeIndexRef.current = nextIndex;
    isNavigatingRef.current = true;
    setNavState({
      activeIndex: nextIndex,
      pointCount: resolvedPoints.length,
      isNavigating: true,
    });

    scrollToY(targetPoint.y, {
      lenis: getLenis(),
      lenisOptions: {
        duration: Math.max((settings?.scrollDurationMs ?? 1000) / 1000, 0.01),
        lock: true,
        force: true,
      },
    });

    window.clearTimeout(navigationTimeoutRef.current);
    navigationTimeoutRef.current = window.setTimeout(() => {
      finishNavigation(nextIndex);
    }, Math.max((settings?.scrollDurationMs ?? 1000) + 200, 400));
  };

  const hasPrevious = navState.activeIndex > 0;
  const hasNext = navState.activeIndex < Math.max(navState.pointCount - 1, 0);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3">
      <button
        type="button"
        aria-label="Snap to previous section"
        onClick={() => goToIndex(-1)}
        disabled={!hasPrevious || navState.isNavigating}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-slate-200/55 text-slate-900/90 shadow-xl backdrop-blur-xl transition hover:bg-slate-200/70 disabled:cursor-not-allowed disabled:opacity-45"
      >
        <ArrowIcon direction="down" />
      </button>
      <button
        type="button"
        aria-label="Snap to next section"
        onClick={() => goToIndex(1)}
        disabled={!hasNext || navState.isNavigating}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-slate-200/55 text-slate-900/90 shadow-xl backdrop-blur-xl transition hover:bg-slate-200/70 disabled:cursor-not-allowed disabled:opacity-45"
      >
        <ArrowIcon direction="up" />
      </button>
    </div>
  );
}
