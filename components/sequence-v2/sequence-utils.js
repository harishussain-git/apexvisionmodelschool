"use client"

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

export function drawImageCover(canvas, image) {
  if (!canvas || !image) {
    return
  }

  const context = canvas.getContext("2d")
  if (!context) {
    return
  }

  const dpr = window.devicePixelRatio || 1
  const width = Math.max(1, Math.floor(canvas.clientWidth * dpr))
  const height = Math.max(1, Math.floor(canvas.clientHeight * dpr))

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width
    canvas.height = height
  }

  context.clearRect(0, 0, width, height)

  const scale = Math.max(width / image.width, height / image.height)
  const drawWidth = image.width * scale
  const drawHeight = image.height * scale
  const x = (width - drawWidth) / 2
  const y = (height - drawHeight) / 2

  context.drawImage(image, x, y, drawWidth, drawHeight)
}

export function findNearestLoadedFrame(targetIndex, frameCount, loadedFrames) {
  const safeIndex = clamp(targetIndex, 0, frameCount - 1)

  if (loadedFrames[safeIndex]) {
    return safeIndex
  }

  for (let offset = 1; offset < frameCount; offset += 1) {
    const previousIndex = safeIndex - offset
    const nextIndex = safeIndex + offset

    if (previousIndex >= 0 && loadedFrames[previousIndex]) {
      return previousIndex
    }

    if (nextIndex < frameCount && loadedFrames[nextIndex]) {
      return nextIndex
    }
  }

  return -1
}

export function buildFrameSources(basePath, folder, frameIndex) {
  const zeroBased = String(frameIndex)
  const oneBased = String(frameIndex + 1)
  const paddedOneBased = String(frameIndex + 1).padStart(4, "0")

  return [
    `${basePath}/${folder}/${paddedOneBased}.webp`,
    `${basePath}/${folder}/${oneBased}.webp`,
    `${basePath}/${folder}/${zeroBased}.webp`,
    `${basePath}/${folder}/${paddedOneBased}.jpg`,
    `${basePath}/${folder}/${oneBased}.jpg`,
    `${basePath}/${folder}/${zeroBased}.jpg`,
  ]
}

export function getActiveAnchorByFrame(currentFrame, anchors = []) {
  if (!anchors.length) {
    return null
  }

  let activeAnchor = anchors[0]

  for (const anchor of anchors) {
    if ((anchor.currentFrame ?? 0) <= currentFrame) {
      activeAnchor = anchor
    } else {
      break
    }
  }

  return activeAnchor
}
