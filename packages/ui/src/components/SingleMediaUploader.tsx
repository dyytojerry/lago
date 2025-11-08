"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { Upload, Loader2, Trash2 } from "lucide-react";
import clsx from "clsx";
import { extractImageMetadata, extractVideoMetadata } from "./mediaMetadata";
import {
  MediaKind,
  UploadContext,
  UploadHandler,
  UploadedMedia,
  UploadValidationOptions,
} from "./uploadTypes";

type AcceptType = "image" | "video" | "any";

export interface SingleMediaUploaderProps {
  value?: UploadedMedia | null;
  onChange?: (value: UploadedMedia | null) => void;
  label?: string;
  description?: string;
  placeholder?: string;
  accept?: AcceptType;
  capture?: boolean | "environment" | "user";
  disabled?: boolean;
  mandatoryType?: MediaKind;
  maxSize?: number;
  validation?: UploadValidationOptions;
  uploadHandler?: UploadHandler;
  className?: string;
  buttonText?: string;
  allowRemove?: boolean;
  showPreview?: boolean;
  renderPreview?: (value: UploadedMedia) => React.ReactNode;
  onError?: (error: Error) => void;
}

interface UploadState {
  uploading: boolean;
  progress: number;
  error?: string;
  previewUrl?: string;
}

function getAcceptAttribute(accept: AcceptType = "any") {
  if (accept === "image") return "image/*";
  if (accept === "video") return "video/*";
  return "image/*,video/*";
}

function resolveMediaKind(file: File): MediaKind {
  if (file.type.startsWith("image")) return "image";
  if (file.type.startsWith("video")) return "video";
  return "file";
}

const DEFAULT_BUTTON_TEXT = "上传文件";

export function SingleMediaUploader({
  value,
  onChange,
  label,
  description,
  placeholder,
  accept = "any",
  capture,
  disabled,
  mandatoryType,
  maxSize,
  validation,
  uploadHandler,
  multipartUploadHandler,
  multipartOptions,
  ossConfig,
  className,
  buttonText = DEFAULT_BUTTON_TEXT,
  allowRemove = true,
  showPreview = true,
  renderPreview,
  onError,
}: SingleMediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [state, setState] = useState<UploadState>({ uploading: false, progress: 0 });

  const previewContent = useMemo(() => {
    if (!value || !showPreview) return null;
    if (renderPreview) return renderPreview(value);
    if (value.kind === "image") {
      return (
        <img
          src={value.url}
          alt={value.name}
          className="w-full h-48 object-cover rounded-lg border border-gray-100"
        />
      );
    }
    if (value.kind === "video") {
      return (
        <video
          src={value.url}
          controls
          className="w-full h-48 rounded-lg border border-gray-100 object-cover"
        />
      );
    }
    return (
      <a
        href={value.url}
        target="_blank"
        rel="noreferrer"
        className="text-sm text-primary underline"
      >
        {value.name}
      </a>
    );
  }, [value, showPreview, renderPreview]);

  const handleResetInput = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const validateFile = useCallback(
    (file: File) => {
      if (maxSize && file.size > maxSize) {
        throw new Error(`文件大小超过限制（最大 ${Math.round(maxSize / 1024 / 1024)}MB）`);
      }
      if (validation?.maxSize && file.size > validation.maxSize) {
        throw new Error(
          `文件大小超过限制（最大 ${Math.round(validation.maxSize / 1024 / 1024)}MB）`
        );
      }
      if (validation?.allowedMimeTypes?.length) {
        const matched = validation.allowedMimeTypes.some((mime) => file.type === mime);
        if (!matched) {
          throw new Error("文件类型不支持");
        }
      }

      const kind = resolveMediaKind(file);
      if (mandatoryType && kind !== mandatoryType) {
        throw new Error(`仅支持上传 ${mandatoryType === "image" ? "图片" : "视频"}`);
      }
      if (accept === "image" && kind !== "image") {
        throw new Error("请选择图片文件");
      }
      if (accept === "video" && kind !== "video") {
        throw new Error("请选择视频文件");
      }
    },
    [accept, mandatoryType, maxSize, validation]
  );

  const finalizeResult = useCallback(
    async (file: File, uploaded: UploadedMedia): Promise<UploadedMedia> => {
      const kind = resolveMediaKind(file);
      if (kind === "image" && (uploaded.width == null || uploaded.height == null)) {
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

  const getUploadHandler = useCallback(
    (): UploadHandler => {
      if (!uploadHandler) {
        throw new Error("SingleMediaUploader 需要提供 uploadHandler 属性");
      }
      return uploadHandler;
    },
    [uploadHandler]
  );

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
        validateFile(file);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        setState((prev) => ({ ...prev, error: message }));
        onError?.(error instanceof Error ? error : new Error(message));
        handleResetInput();
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      setState({ uploading: true, progress: 0, previewUrl });

      const abortController = new AbortController();
      abortRef.current = abortController;

      const handler = getUploadHandler();
      const context: UploadContext = {
        signal: abortController.signal,
        onProgress: (progress) =>
          setState((prev) => ({
            ...prev,
            progress,
          })),
      };

      try {
        const uploaded = await handler(file, context);
        const merged = await finalizeResult(file, uploaded);
        onChange?.(merged);
        setState({ uploading: false, progress: 100, previewUrl });
      } catch (error) {
        const message = error instanceof Error ? error.message : "上传失败";
        setState({ uploading: false, progress: 0, error: message });
        onError?.(error instanceof Error ? error : new Error(message));
        onChange?.(null);
        URL.revokeObjectURL(previewUrl);
      } finally {
        abortRef.current = null;
        handleResetInput();
      }
    },
    [finalizeResult, getUploadHandler, onChange, onError, validateFile]
  );

  const handleRemove = useCallback(() => {
    if (state.uploading && abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    if (state.previewUrl) {
      URL.revokeObjectURL(state.previewUrl);
    }
    setState({ uploading: false, progress: 0 });
    onChange?.(null);
    handleResetInput();
  }, [onChange, state.previewUrl, state.uploading]);

  const handleTriggerClick = () => {
    if (disabled || state.uploading) return;
    inputRef.current?.click();
  };

  return (
    <div className={clsx("space-y-3", className)}>
      {label && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">{label}</span>
          {state.uploading && (
            <span className="text-xs text-primary">{state.progress}%</span>
          )}
        </div>
      )}
      {description && <p className="text-xs text-gray-500">{description}</p>}

      <div
        className={clsx(
          "relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-5 py-8 text-center transition-colors",
          disabled
            ? "border-gray-200 bg-gray-50 text-gray-400"
            : "border-gray-200 hover:border-primary hover:bg-primary/5"
        )}
        onClick={handleTriggerClick}
        role="button"
        tabIndex={0}
      >
        {state.uploading ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-gray-600">正在上传...</p>
          </>
        ) : value ? (
          <>
            {previewContent}
            {allowRemove && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="absolute top-3 right-3 rounded-full bg-white p-2 shadow hover:bg-gray-100"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </button>
            )}
          </>
        ) : (
          <>
            <Upload className="h-10 w-10 text-primary" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {buttonText}
              </p>
              <p className="text-xs text-gray-500">
                {placeholder ||
                  (accept === "image"
                    ? "支持 JPG、PNG、WebP 等图片格式"
                    : accept === "video"
                    ? "支持 MP4、MOV 等视频格式"
                    : "支持图片或视频文件")}
              </p>
            </div>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={getAcceptAttribute(accept)}
          capture={capture as any}
          className="hidden"
          disabled={disabled || state.uploading}
          onChange={handleFileChange}
        />
      </div>

      {state.error && (
        <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}
    </div>
  );
}

