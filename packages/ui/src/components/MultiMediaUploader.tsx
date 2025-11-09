"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import {
  MediaKind,
  UploadContext,
  UploadHandler,
  UploadedMedia,
} from "./uploadTypes";
import { extractImageMetadata, extractVideoMetadata } from "./mediaMetadata";
import {
  Upload,
  Loader2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export interface MultiMediaUploaderItem extends UploadedMedia {
  id: string;
  status: "pending" | "uploading" | "success" | "error";
  progress: number;
  error?: string;
  localPreview?: string;
}

export interface MultiMediaUploaderProps {
  value?: UploadedMedia[];
  onChange?: (result: UploadedMedia[]) => void;
  accept?: "image" | "video" | "any";
  maxFiles?: number;
  maxSize?: number;
  multiple?: boolean;
  uploadHandler?: UploadHandler;
  className?: string;
  onError?: (error: Error) => void;
  onUploadStart?: (pendingCount: number) => void;
  onUploadComplete?: () => void;
  allowPreview?: boolean;
  allowRemove?: boolean;
  capture?: boolean | "environment" | "user";
  placeholder?: string;
  concurrency?: number;
}

interface InternalItem {
  id: string;
  file: File;
  status: "pending" | "uploading" | "success" | "error";
  progress: number;
  uploaded?: UploadedMedia;
  error?: string;
  previewUrl: string;
}

function resolveMediaKind(file: File): MediaKind {
  if (file.type.startsWith("image")) return "image";
  if (file.type.startsWith("video")) return "video";
  return "file";
}

function getAcceptAttribute(accept: MultiMediaUploaderProps["accept"] = "any") {
  if (accept === "image") return "image/*";
  if (accept === "video") return "video/*";
  return "image/*,video/*";
}

function generateId() {
  return typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

export function MultiMediaUploader({
  value,
  onChange,
  accept = "any",
  maxFiles,
  maxSize,
  multiple = true,
  uploadHandler,
  multipartUploadHandler,
  ossConfig,
  multipartOptions,
  className,
  onError,
  onUploadStart,
  onUploadComplete,
  allowPreview = true,
  allowRemove = true,
  capture,
  placeholder,
  concurrency = 2,
}: MultiMediaUploaderProps) {
  const [items, setItems] = useState<InternalItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentValue = useMemo(
    () => value ?? items.filter((i) => i.uploaded).map((i) => i.uploaded!),
    [value, items]
  );

  const handleResetInput = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const dispatchChange = useCallback(
    (updated: InternalItem[]) => {
      setItems(updated);
      const uploaded = updated
        .filter((item) => item.uploaded && item.status === "success")
        .map((item) => item.uploaded!) as UploadedMedia[];
      onChange?.(uploaded);
    },
    [onChange]
  );

  const getUploadHandler = useCallback((): UploadHandler => {
    if (!uploadHandler) {
      throw new Error("MultiMediaUploader 需要提供 uploadHandler 属性");
    }
    return uploadHandler;
  }, [uploadHandler]);

  const finalizeMeta = useCallback(
    async (file: File, uploaded: UploadedMedia) => {
      const kind = resolveMediaKind(file);
      if (
        kind === "image" &&
        (uploaded.width == null || uploaded.height == null)
      ) {
        const metadata = await extractImageMetadata(file);
        uploaded.width = metadata.width;
        uploaded.height = metadata.height;
      } else if (kind === "video" && uploaded.duration == null) {
        const metadata = await extractVideoMetadata(file);
        uploaded.width = metadata.width;
        uploaded.height = metadata.height;
        uploaded.duration = metadata.duration;
        uploaded.poster = uploaded.poster ?? metadata.poster;
      }
      uploaded.kind = kind;
      uploaded.mimeType = uploaded.mimeType || file.type;
      uploaded.name = uploaded.name || file.name;
      uploaded.size = uploaded.size || file.size;
      return uploaded;
    },
    []
  );

  const enqueueFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const list = Array.from(files);

      if (maxFiles && currentValue.length + list.length > maxFiles) {
        onError?.(new Error(`最多上传 ${maxFiles} 个文件`));
        return;
      }

      const internalItems: InternalItem[] = [];
      for (const file of list) {
        if (maxSize && file.size > maxSize) {
          onError?.(new Error(`${file.name} 大小超出限制`));
          continue;
        }
        const kind = resolveMediaKind(file);
        if (accept === "image" && kind !== "image") {
          onError?.(new Error(`${file.name} 不是图片`));
          continue;
        }
        if (accept === "video" && kind !== "video") {
          onError?.(new Error(`${file.name} 不是视频`));
          continue;
        }
        const previewUrl = URL.createObjectURL(file);
        internalItems.push({
          id: generateId(),
          file,
          status: "pending",
          progress: 0,
          previewUrl,
        });
      }

      if (internalItems.length === 0) {
        handleResetInput();
        return;
      }

      dispatchChange([...items, ...internalItems]);
      onUploadStart?.(internalItems.length);
      uploadQueue([...items, ...internalItems]);
    },
    [
      accept,
      currentValue.length,
      dispatchChange,
      items,
      maxFiles,
      maxSize,
      onError,
      onUploadStart,
    ]
  );

  const uploadQueue = useCallback(
    (allItems: InternalItem[]) => {
      const handler = getUploadHandler();

      let active = 0;
      const queue = allItems.filter((item) => item.status === "pending");

      const next = () => {
        if (queue.length === 0) {
          if (active === 0) {
            onUploadComplete?.();
            dispatchChange([...allItems]);
          }
          return;
        }
        while (active < concurrency && queue.length > 0) {
          const item = queue.shift()!;
          active += 1;
          item.status = "uploading";
          item.progress = 0;
          dispatchChange([...allItems]);

          const abortController = new AbortController();
          const context: UploadContext = {
            signal: abortController.signal,
            onProgress: (progress) => {
              item.progress = progress;
              dispatchChange([...allItems]);
            },
          };

          handler(item.file, context)
            .then((uploaded) => finalizeMeta(item.file, uploaded))
            .then((result) => {
              item.status = "success";
              item.progress = 100;
              item.uploaded = result;
            })
            .catch((error) => {
              const err =
                error instanceof Error ? error : new Error("上传失败");
              item.status = "error";
              item.error = err.message;
              item.progress = 0;
              onError?.(err);
              URL.revokeObjectURL(item.previewUrl);
            })
            .finally(() => {
              active -= 1;
              dispatchChange([...allItems]);
              next();
            });
        }
      };

      next();
    },
    [
      concurrency,
      dispatchChange,
      finalizeMeta,
      getUploadHandler,
      onError,
      onUploadComplete,
    ]
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    enqueueFiles(event.target.files);
    handleResetInput();
  };

  const handleRemove = useCallback(
    (id: string) => {
      const updated = items.filter((item) => item.id !== id);
      dispatchChange(updated);
      const removed = items.find((item) => item.id === id);
      if (removed) {
        URL.revokeObjectURL(removed.previewUrl);
      }
    },
    [dispatchChange, items]
  );

  const handleOpenPicker = () => {
    inputRef.current?.click();
  };

  return (
    <div className={clsx("space-y-4", className)}>
      <div
        className={clsx(
          "relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-5 py-10 text-center transition-colors",
          "border-gray-200 hover:border-primary hover:bg-primary/5 cursor-pointer"
        )}
        onClick={handleOpenPicker}
        role="button"
        tabIndex={0}
      >
        <Upload className="h-10 w-10 text-primary" />
        <div>
          <p className="text-sm font-medium text-gray-900">
            点击或拖拽文件到此处上传
          </p>
          <p className="text-xs text-gray-500">
            {placeholder ||
              (accept === "image"
                ? "支持多张图片上传，最多 20MB"
                : accept === "video"
                ? "支持多个视频上传，建议控制在 200MB 内"
                : "支持图片或视频，单个文件大小不超过服务器限制")}
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept={getAcceptAttribute(accept)}
          capture={capture as any}
          className="hidden"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
          >
            {allowPreview &&
              item.previewUrl &&
              item.file.type.startsWith("image") && (
                <img
                  src={item.previewUrl}
                  alt={item.file.name}
                  className="h-40 w-full object-cover"
                />
              )}
            {allowPreview &&
              item.previewUrl &&
              item.file.type.startsWith("video") && (
                <video
                  src={item.previewUrl}
                  className="h-40 w-full object-cover"
                  muted
                  playsInline
                />
              )}

            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">
                    {item.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(item.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                {item.status === "success" && (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                )}
                {item.status === "error" && (
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                )}
              </div>

              {item.status === "uploading" && (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">
                    {item.progress}%
                  </span>
                </div>
              )}

              {item.status === "error" && item.error && (
                <p className="text-xs text-red-500 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
                  {item.error}
                </p>
              )}

              {allowRemove && (
                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-600"
                >
                  <Trash2 className="h-3 w-3" />
                  移除
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
