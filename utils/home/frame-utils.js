export function resolveFrameValue(frameLike, fallback = 0) {
  if (typeof frameLike === "number" && Number.isFinite(frameLike)) {
    return frameLike;
  }

  if (typeof frameLike === "string") {
    const match = frameLike.trim().match(/^(\d+)(?:\.[^.]+)?$/);
    if (match) {
      return Number(match[1]);
    }
  }

  return fallback;
}

export function frameToImagePath(folder, frameLike, extension = "webp") {
  const frameNumber = resolveFrameValue(frameLike, 0);
  const paddedFrame = String(frameNumber).padStart(4, "0");
  return `${folder}/${paddedFrame}.${extension}`;
}
