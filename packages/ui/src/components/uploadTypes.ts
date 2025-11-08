export type MediaKind = "image" | "video" | "file";

export interface UploadProgressHandler {
  (progress: number): void;
}

export interface UploadContext {
  signal: AbortSignal;
  onProgress?: UploadProgressHandler;
}

export interface UploadedMedia {
  url: string;
  name: string;
  size: number;
  mimeType: string;
  kind: MediaKind;
  width?: number;
  height?: number;
  duration?: number;
  poster?: string;
  extra?: Record<string, any>;
}

export interface UploadValidationOptions {
  maxSize?: number;
  allowedMimeTypes?: string[];
}

export type UploadHandler = (
  file: File,
  context: UploadContext
) => Promise<UploadedMedia>;

