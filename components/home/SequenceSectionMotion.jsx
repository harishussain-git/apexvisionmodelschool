"use client";

import { motion } from "framer-motion";

const DEFAULT_SECTION_MOTION = {
  enabled: true,
  durationMs: 180,
  distancePx: 24,
  enterOpacity: 0,
  exitOpacity: 0,
};

export default function SequenceSectionMotion({
  section = null,
  direction = "down",
  mode = "enter",
  motionConfig = {},
}) {
  if (!section) {
    return null;
  }

  const resolvedConfig = {
    ...DEFAULT_SECTION_MOTION,
    ...motionConfig,
    ...(section.sectionMotion ?? {}),
  };

  if (!resolvedConfig.enabled) {
    return (
      <div className="absolute inset-0 z-10 flex items-center justify-center px-6 text-center">
        {section.sectionComponent}
      </div>
    );
  }

  const enterOffsetY = direction === "down" ? resolvedConfig.distancePx : -resolvedConfig.distancePx;
  const exitOffsetY = direction === "down" ? -resolvedConfig.distancePx : resolvedConfig.distancePx;
  const transition = {
    duration: resolvedConfig.durationMs / 1000,
    ease: [0.22, 1, 0.36, 1],
  };

  const initial =
    mode === "exit"
      ? { opacity: 1, y: 0 }
      : { opacity: resolvedConfig.enterOpacity, y: enterOffsetY };
  const animate =
    mode === "exit"
      ? { opacity: resolvedConfig.exitOpacity, y: exitOffsetY }
      : { opacity: 1, y: 0 };

  return (
    <motion.div
      key={`${section.id}-${mode}`}
      initial={initial}
      animate={animate}
      transition={transition}
      className="absolute inset-0 z-10"
    >
      <div className="flex h-full w-full items-center justify-center px-6 text-center">
        {section.sectionComponent}
      </div>
    </motion.div>
  );
}
