"use client";

import React, { useMemo } from "react";
import clsx from "clsx";

export type MediaSourceType = "image" | "video";

export interface OptimizedMediaProps extends React.HTMLAttributes<HTMLDivElement> {
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

  const url = new URL(src, typeof window === "undefined" ? "https://dummy.lago" : window.location.origin);
  const params = url.searchParams;

  if (type === "image") {
    const transforms: string[] = [];
    if (width || height) {
      const resizeParts = ["image/resize"];
      if (width) resizeParts.push(`w_${Math.round(width)}`);
      if (height) resizeParts.push(`h_${Math.round(height)}`);
      resizeParts.push("m_lfit");
      transforms.push(resizeParts.join(","));
    }
    transforms.push(`image/quality,q_${Math.min(Math.max(quality, 10), 100)}`);
    params.set("x-oss-process", transforms.join("/"));
  } else if (type === "video") {
    const resizeParts = ["video/resize"];
    if (width) resizeParts.push(`w_${Math.round(width)}`);
    if (height) resizeParts.push(`h_${Math.round(height)}`);
    resizeParts.push("m_lfit");
    resizeParts.push(`bitrate_1200`);
    params.set("x-oss-process", resizeParts.join(","));
  }

  url.search = params.toString();
  return url.toString();
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
  const optimizedSrc = useMemo(
    () => (disableOptimization ? src : buildOptimizedUrl(src, type, width, height, quality)),
    [disableOptimization, height, quality, src, type, width]
  );

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

