const DEFAULT_LOCK_BUFFER_MS = 80;

let activeScrollAnimationFrame = null;
let activeScrollLockUntil = 0;
const navigationStartListeners = new Set();
const navigationEndListeners = new Set();

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function easeInOutCubic(value) {
  if (value < 0.5) {
    return 4 * value * value * value;
  }

  return 1 - ((-2 * value + 2) ** 3) / 2;
}

export function isSequenceScrollLocked() {
  return typeof window !== "undefined" && window.performance.now() < activeScrollLockUntil;
}

export function subscribeToSequenceNavigationStart(listener) {
  navigationStartListeners.add(listener);

  return () => {
    navigationStartListeners.delete(listener);
  };
}

export function subscribeToSequenceNavigationEnd(listener) {
  navigationEndListeners.add(listener);

  return () => {
    navigationEndListeners.delete(listener);
  };
}

function notifySequenceNavigationStart(payload) {
  navigationStartListeners.forEach((listener) => {
    listener(payload);
  });
}

function notifySequenceNavigationEnd(payload) {
  navigationEndListeners.forEach((listener) => {
    listener(payload);
  });
}

export function getSequenceScrollMetrics(sequenceId = "") {
  if (typeof window === "undefined") {
    return null;
  }

  const sequenceElement = document.getElementById(sequenceId);
  if (!sequenceElement) {
    return null;
  }

  const sectionTop = sequenceElement.offsetTop;
  const sectionHeight = sequenceElement.offsetHeight;
  const viewportHeight = window.innerHeight;
  const maxTravel = Math.max(sectionHeight - viewportHeight, 0);
  const sectionBottom = sectionTop + sectionHeight;

  return {
    sequenceElement,
    sectionTop,
    sectionBottom,
    sectionHeight,
    viewportHeight,
    maxTravel,
  };
}

export function isWithinSequenceScrollRange(sequenceId = "") {
  const metrics = getSequenceScrollMetrics(sequenceId);
  if (!metrics) {
    return false;
  }

  const scrollY = window.scrollY;
  return scrollY >= metrics.sectionTop && scrollY < metrics.sectionBottom - metrics.viewportHeight;
}

export function getSequenceSectionTargetY(sequenceId = "", sections = [], targetIndex = 0) {
  const metrics = getSequenceScrollMetrics(sequenceId);
  const targetSection = sections[targetIndex];
  if (!metrics || !targetSection) {
    return null;
  }

  // Convert the section's cumulative start frame into a scroll Y inside the tall sequence wrapper.
  const totalFrames = Math.max(sections.at(-1)?.endFrame ?? 1, 1);
  const targetProgress = (targetSection.startFrame - 1) / Math.max(totalFrames - 1, 1);

  return metrics.sectionTop + metrics.maxTravel * targetProgress;
}

export function getNearestSequenceSectionIndex(sequenceId = "", sections = []) {
  if (typeof window === "undefined" || !sections.length) {
    return -1;
  }

  const scrollY = window.scrollY;
  let nearestIndex = 0;
  let nearestDistance = Number.POSITIVE_INFINITY;

  sections.forEach((section, sectionIndex) => {
    const targetY = getSequenceSectionTargetY(sequenceId, sections, sectionIndex);
    if (typeof targetY !== "number") {
      return;
    }

    const distance = Math.abs(scrollY - targetY);
    if (distance < nearestDistance) {
      nearestIndex = sectionIndex;
      nearestDistance = distance;
    }
  });

  return nearestIndex;
}

export function animateSequenceScrollToSection({
  sequenceId = "",
  sections = [],
  sourceIndex = -1,
  targetIndex = 0,
  durationMs = 1200,
  lockBufferMs = DEFAULT_LOCK_BUFFER_MS,
}) {
  if (typeof window === "undefined") {
    return false;
  }

  const targetY = getSequenceSectionTargetY(sequenceId, sections, targetIndex);
  if (typeof targetY !== "number" || Number.isNaN(targetY)) {
    return false;
  }

  if (activeScrollAnimationFrame !== null) {
    window.cancelAnimationFrame(activeScrollAnimationFrame);
  }

  const startY = window.scrollY;
  const startedAt = window.performance.now();
  activeScrollLockUntil = startedAt + Math.max(durationMs + lockBufferMs, 0);
  notifySequenceNavigationStart({
    sequenceId,
    sourceIndex,
    targetIndex,
    direction: Math.sign(targetIndex - sourceIndex) || 1,
    startedAt,
  });

  const step = (time) => {
    // Keep every navigation path on the same easing + timing model.
    const elapsed = time - startedAt;
    const progress = clamp(elapsed / Math.max(durationMs, 1), 0, 1);
    const easedProgress = easeInOutCubic(progress);
    const nextY = startY + (targetY - startY) * easedProgress;

    window.scrollTo({
      top: nextY,
      behavior: "auto",
    });

    if (progress < 1) {
      activeScrollAnimationFrame = window.requestAnimationFrame(step);
      return;
    }

    activeScrollAnimationFrame = null;
    notifySequenceNavigationEnd({
      sequenceId,
      sourceIndex,
      targetIndex,
      direction: Math.sign(targetIndex - sourceIndex) || 1,
      completedAt: time,
    });
  };

  activeScrollAnimationFrame = window.requestAnimationFrame(step);
  return true;
}
