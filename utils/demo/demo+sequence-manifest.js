export const DEMO_SEQUENCE_CONFIG = {
  frameCount: 266,
  frameFolder: "/demo/fullseq",
  canvasScrollScreens: 14,
  frameProgressCutoff: 0.9,
  loaderTitle: "Preparing demo sequence",
  loaderLabel: "Downloading every frame before scroll starts.",
  showLoaderDebug: true,
};

export const DEMO_SEQUENCE_FRAMES = Array.from(
  { length: DEMO_SEQUENCE_CONFIG.frameCount },
  (_, index) => ({
    src: `${DEMO_SEQUENCE_CONFIG.frameFolder}/${String(index + 1).padStart(4, "0")}.webp`,
  })
);

export const DEMO_SEQUENCE_TOTAL_FRAMES = DEMO_SEQUENCE_FRAMES.length;
