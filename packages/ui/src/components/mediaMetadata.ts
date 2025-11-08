"use client";

export interface MediaMetadata {
  width?: number;
  height?: number;
  duration?: number;
  poster?: string;
}

export async function extractImageMetadata(file: File): Promise<MediaMetadata> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const { width, height } = await new Promise<{ width: number; height: number }>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = reject;
      img.src = objectUrl;
    });
    return { width, height };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function extractVideoMetadata(file: File): Promise<MediaMetadata> {
  const objectUrl = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.preload = "metadata";
  video.src = objectUrl;
  try {
    await new Promise<void>((resolve, reject) => {
      const handleLoaded = () => resolve();
      const handleError = () => reject(new Error("无法读取视频元信息"));
      video.addEventListener("loadedmetadata", handleLoaded, { once: true });
      video.addEventListener("error", handleError, { once: true });
    });

    let poster: string | undefined;
    try {
      poster = await createVideoPoster(video);
    } catch {
      poster = undefined;
    }

    return {
      width: video.videoWidth,
      height: video.videoHeight,
      duration: video.duration,
      poster,
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
    video.remove();
  }
}

async function createVideoPoster(video: HTMLVideoElement): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.6);
}

