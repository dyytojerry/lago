import { UploadHandler, UploadedMedia } from '@lago/ui';
import {
  uploadSingle,
  uploadMultipartInit,
  uploadMultipartPart,
  uploadMultipartComplete,
  uploadMultipartAbort,
} from '@/lib/apis/uploads';
import { UploadSingleResponseKind } from '@/lib/apis/types';

interface CreateUploadHandlerOptions {
  multipartThreshold?: number;
  partSize?: number;
}

const DEFAULT_MULTIPART_THRESHOLD = 8 * 1024 * 1024; // 8MB
const DEFAULT_PART_SIZE = 5 * 1024 * 1024; // 5MB

function resolveKind(file: File): UploadSingleResponseKind {
  if (file.type.startsWith('image')) {
    return UploadSingleResponseKind.IMAGE;
  }
  if (file.type.startsWith('video')) {
    return UploadSingleResponseKind.VIDEO;
  }
  return UploadSingleResponseKind.FILE;
}

function mapKind(kind: UploadSingleResponseKind): UploadedMedia['kind'] {
  switch (kind) {
    case UploadSingleResponseKind.IMAGE:
      return 'image';
    case UploadSingleResponseKind.VIDEO:
      return 'video';
    default:
      return 'file';
  }
}

export function createUploadHandler(options?: CreateUploadHandlerOptions): UploadHandler {
  const multipartThreshold = options?.multipartThreshold ?? DEFAULT_MULTIPART_THRESHOLD;
  const partSize = options?.partSize ?? DEFAULT_PART_SIZE;

  return async (file, context) => {
    const kind = resolveKind(file);
    context.onProgress?.(0);

    if (file.size <= multipartThreshold) {
      const response = await uploadSingle({ file, kind });
      const data = response.data as any;
      context.onProgress?.(100);
      return {
        url: data.url,
        name: data.name ?? file.name,
        size: data.size ?? file.size,
        mimeType: data.mimeType ?? file.type,
        kind: mapKind(kind),
        extra: {
          objectKey: data.objectKey,
        },
      };
    }

    const initResponse = await uploadMultipartInit({
      fileName: file.name,
      mimeType: file.type,
      kind,
    });

    const initData = initResponse.data as any;
    const uploadId = initData.uploadId;
    const objectKey = initData.objectKey;
    const totalParts = Math.ceil(file.size / partSize);
    const parts: { partNumber: number; etag: string }[] = [];

    try {
      for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
        if (context.signal.aborted) {
          throw new DOMException('Upload aborted', 'AbortError');
        }
        const start = (partNumber - 1) * partSize;
        const end = Math.min(start + partSize, file.size);
        const chunk = file.slice(start, end);
        const chunkFile = new File([chunk], file.name, { type: file.type });

        const partResponse = await uploadMultipartPart({
          uploadId,
          objectKey,
          partNumber,
          file: chunkFile,
        });
        const partData = partResponse.data as any;
        parts.push({
          partNumber: partData.partNumber ?? partNumber,
          etag: partData.etag,
        });
        context.onProgress?.(Math.round((partNumber / totalParts) * 100));
      }

      const completeResponse = await uploadMultipartComplete({
        uploadId,
        objectKey,
        parts,
      });
      const completeData = completeResponse.data as any;

      context.onProgress?.(100);

      return {
        url: completeData.url,
        name: file.name,
        size: file.size,
        mimeType: file.type,
        kind: mapKind(kind),
        extra: {
          objectKey,
        },
      };
    } catch (error) {
      if (!context.signal.aborted) {
        await uploadMultipartAbort({ uploadId, objectKey }).catch((abortError) => {
          console.warn('Abort multipart upload failed:', abortError);
        });
      }
      throw error;
    }
  };
}

export const defaultUploadHandler = createUploadHandler();

