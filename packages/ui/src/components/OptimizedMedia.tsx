"use client";

import React, { useMemo } from "react";
import clsx from "clsx";

export type MediaSourceType = "image" | "video";

export interface OptimizedMediaProps
  extends React.HTMLAttributes<HTMLDivElement> {
  src: string;
  type?: MediaSourceType;
  alt?: string;
  width?: number;
  height?: number;
  quality?: number;
  poster?: string;
  controls?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  playsInline?: boolean;
  lazy?: boolean;
  fit?: "cover" | "contain" | "fill";
  rounded?: boolean;
  className?: string;
  mediaClassName?: string;
  disableOptimization?: boolean;
  originalSrc?: string;
  onClick?: () => void;
}

function clampQuality(input: number | undefined): number {
  const base = typeof input === "number" ? input : 75;
  return Math.min(Math.max(Math.round(base), 10), 100);
}

function deriveAdaptiveQuality(
  requestedQuality: number,
  width?: number,
  height?: number
): number {
  const maxDimension = Math.max(width ?? 0, height ?? 0);
  const pixelCount = (width ?? 0) * (height ?? 0);
  let quality = clampQuality(requestedQuality);

  if (pixelCount > 6_000_000 || maxDimension > 3000) {
    quality = Math.min(quality, 60);
  } else if (pixelCount > 3_000_000 || maxDimension > 2400) {
    quality = Math.min(quality, 65);
  } else if (pixelCount > 1_500_000 || maxDimension > 1600) {
    quality = Math.min(quality, 70);
  } else if (pixelCount > 750_000 || maxDimension > 1280) {
    quality = Math.min(quality, 80);
  }

  return quality;
}

function buildImageOperations(
  width: number | undefined,
  height: number | undefined,
  quality: number
): string[] {
  const operations: string[] = ["image/auto-orient,1"];

  if (width || height) {
    const resizeParams: string[] = [];
    if (width) resizeParams.push(`w_${Math.round(width)}`);
    if (height) resizeParams.push(`h_${Math.round(height)}`);
    resizeParams.push("m_lfit");
    operations.push(`resize,${resizeParams.join(",")}`);
  }

  operations.push(`quality,q_${deriveAdaptiveQuality(quality, width, height)}`);

  return operations;
}

function buildVideoOperations(
  width: number | undefined,
  height: number | undefined
): string[] {
  if (!width && !height) {
    return [];
  }

  const resizeParams: string[] = [];
  if (width) resizeParams.push(`w_${Math.round(width)}`);
  if (height) resizeParams.push(`h_${Math.round(height)}`);
  resizeParams.push("m_lfit");
  return [`video/resize,${resizeParams.join(",")}`];
}

function buildOptimizedUrl(
  src: string,
  type: MediaSourceType,
  width?: number,
  height?: number,
  quality: number = 75
) {
  if (!src || src.includes("x-oss-process=")) {
    return src;
  }

  try {
    const origin =
      typeof globalThis !== "undefined" && globalThis.location
        ? globalThis.location.origin
        : "https://dummy.lago";
    const url = new URL(src, origin);
    const params = url.searchParams;

    const operations =
      type === "image"
        ? buildImageOperations(width, height, quality)
        : buildVideoOperations(width, height);

    if (operations.length === 0) {
      return src;
    }

    params.set("x-oss-process", operations.join("/"));
    url.search = params.toString();
    return url.toString();
  } catch (error) {
    console.warn("Failed to build optimized OSS URL", error);
    return src;
  }
}

export function OptimizedMedia({
  src,
  type = "image",
  alt,
  width,
  height,
  quality = 75,
  poster,
  controls = type === "video",
  autoPlay,
  muted,
  loop,
  playsInline = true,
  lazy = true,
  fit = "cover",
  rounded,
  className,
  mediaClassName,
  disableOptimization,
  originalSrc,
  onClick,
  ...rest
}: OptimizedMediaProps) {
  const optimizedSrc = useMemo(() => {
    if (disableOptimization) {
      return src;
    }
    return buildOptimizedUrl(src, type, width, height, quality);
  }, [disableOptimization, height, quality, src, type, width]);

  const containerStyles: React.CSSProperties = {
    width: width ? `${width}px` : undefined,
    height: height ? `${height}px` : undefined,
  };

  return (
    <div
      {...rest}
      className={clsx(
        "relative overflow-hidden bg-gray-100",
        rounded && "rounded-xl",
        className
      )}
      style={{ ...containerStyles, ...(rest.style || {}) }}
      onClick={onClick}
      data-original-src={originalSrc || src}
    >
      {type === "image" ? (
        <img
          src={optimizedSrc}
          alt={alt}
          loading={lazy ? "lazy" : undefined}
          className={clsx(
            "absolute inset-0 h-full w-full object-cover",
            fit && `object-${fit}`,
            mediaClassName
          )}
        />
      ) : (
        <video
          src={optimizedSrc}
          poster={poster}
          controls={controls}
          autoPlay={autoPlay}
          muted={muted}
          loop={loop}
          playsInline={playsInline}
          className={clsx(
            "absolute inset-0 h-full w-full object-cover",
            fit && `object-${fit}`,
            mediaClassName
          )}
        />
      )}
    </div>
  );
}
