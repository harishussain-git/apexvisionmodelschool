import { DEMO_SEQUENCE_TOTAL_FRAMES } from "@/utils/demo/demo+sequence-manifest";

export function createDemoSequenceProgress(overrides = {}) {
  return {
    loadedFrames: 0,
    totalFrames: DEMO_SEQUENCE_TOTAL_FRAMES,
    failedFrames: 0,
    ready: false,
    ...overrides,
  };
}

export function preloadDemoSequence(frames, { onProgress } = {}) {
  let cancelled = false;
  let loadedFrames = 0;
  let failedFrames = 0;

  const images = new Array(frames.length);
  const activeImages = [];

  const pushProgress = () => {
    onProgress?.(
      createDemoSequenceProgress({
        loadedFrames,
        failedFrames,
        ready: loadedFrames === frames.length,
      })
    );
  };

  pushProgress();

  const done = Promise.all(
    frames.map((frame, index) => {
      return new Promise((resolve) => {
        const image = new window.Image();
        let settled = false;

        activeImages.push(image);
        images[index] = image;

        // Count progress per frame so the loader can stay simple and deterministic.
        const finish = (didLoad) => {
          if (settled || cancelled) {
            resolve();
            return;
          }

          settled = true;
          loadedFrames += 1;

          if (!didLoad) {
            failedFrames += 1;
          }

          image.onload = null;
          image.onerror = null;

          pushProgress();
          resolve();
        };

        image.decoding = "async";
        image.onload = () => finish(true);
        image.onerror = () => finish(false);
        image.src = frame.src;
      });
    })
  ).then(() => ({
    images,
    progress: createDemoSequenceProgress({
      loadedFrames,
      failedFrames,
      ready: true,
    }),
  }));

  return {
    done,
    cancel() {
      cancelled = true;

      activeImages.forEach((image) => {
        image.onload = null;
        image.onerror = null;
        image.src = "";
      });
    },
  };
}
