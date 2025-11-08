import { Request, Response } from 'express';
import { ossClient, uploadToOSS, generateFileName } from '../lib/oss';
import { createSuccessResponse, createErrorResponse } from '../lib/response';

interface MultipartPartInput {
  partNumber: number;
  etag: string;
}

function resolvePrefix(kind?: string) {
  if (!kind) return 'uploads';
  switch (kind) {
    case 'image':
      return 'uploads/images';
    case 'video':
      return 'uploads/videos';
    default:
      return 'uploads';
  }
}

export async function uploadSingleMedia(req: Request, res: Response) {
  try {
    const file = req.file;
    const { kind } = req.body;

    if (!file) {
      return createErrorResponse(res, '未找到上传文件', 400);
    }

    const objectKey = generateFileName(file.originalname, resolvePrefix(kind));
    const result = await uploadToOSS(file.buffer, objectKey, file.mimetype);

    return createSuccessResponse(res, {
      url: result.url,
      objectKey: result.fileName,
      name: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      kind: kind || (file.mimetype.startsWith('image') ? 'image' : file.mimetype.startsWith('video') ? 'video' : 'file'),
    });
  } catch (error) {
    console.error('单文件上传失败:', error);
    return createErrorResponse(res, '文件上传失败', 500);
  }
}

export async function initMultipartUpload(req: Request, res: Response) {
  try {
    const { fileName, mimeType, kind } = req.body;
    if (!fileName) {
      return createErrorResponse(res, '缺少文件名称', 400);
    }

    const objectKey = generateFileName(fileName, resolvePrefix(kind));
    const options: any = {};
    if (mimeType) {
      options.headers = {
        'Content-Type': mimeType,
      };
    }

    const result = await ossClient.initMultipartUpload(objectKey, options);

    return createSuccessResponse(res, {
      uploadId: result.uploadId,
      objectKey,
    });
  } catch (error) {
    console.error('初始化分片上传失败:', error);
    return createErrorResponse(res, '初始化分片上传失败', 500);
  }
}

export async function uploadMultipartPart(req: Request, res: Response) {
  try {
    const file = req.file;
    const { uploadId, objectKey, partNumber } = req.body;

    if (!uploadId || !objectKey || !partNumber) {
      return createErrorResponse(res, '缺少必要参数', 400);
    }
    if (!file) {
      return createErrorResponse(res, '缺少分片文件', 400);
    }

    const partNo = Number(partNumber);
    if (!Number.isInteger(partNo) || partNo <= 0) {
      return createErrorResponse(res, '分片序号必须为正整数', 400);
    }

    const result = await ossClient.uploadPart(objectKey, uploadId, partNo, file.buffer);

    return createSuccessResponse(res, {
      etag: result.etag,
      partNumber: partNo,
    });
  } catch (error) {
    console.error('上传分片失败:', error);
    return createErrorResponse(res, '上传分片失败', 500);
  }
}

export async function completeMultipartUpload(req: Request, res: Response) {
  try {
    const { uploadId, objectKey, parts } = req.body;
    if (!uploadId || !objectKey || !parts) {
      return createErrorResponse(res, '缺少必要参数', 400);
    }

    let parsedParts: MultipartPartInput[];
    if (typeof parts === 'string') {
      parsedParts = JSON.parse(parts);
    } else {
      parsedParts = parts;
    }

    if (!Array.isArray(parsedParts) || parsedParts.length === 0) {
      return createErrorResponse(res, '分片列表不能为空', 400);
    }

    const normalizedParts = parsedParts
      .map((part) => ({
        number: Number(part.partNumber),
        etag: part.etag,
      }))
      .filter((part) => Number.isInteger(part.number) && part.number > 0 && typeof part.etag === 'string')
      .sort((a, b) => a.number - b.number);

    if (normalizedParts.length === 0) {
      return createErrorResponse(res, '分片信息无效', 400);
    }

    const result = await ossClient.completeMultipartUpload(objectKey, uploadId, normalizedParts);

    const url =
      result?.res?.requestUrls?.[0]?.split('?')[0] ??
      ossClient.signatureUrl(objectKey, { expires: 3600 }).split('?')[0];

    return createSuccessResponse(res, {
      url,
      objectKey,
    });
  } catch (error) {
    console.error('完成分片上传失败:', error);
    return createErrorResponse(res, '完成分片上传失败', 500);
  }
}

export async function abortMultipartUpload(req: Request, res: Response) {
  try {
    const { uploadId, objectKey } = req.body;
    if (!uploadId || !objectKey) {
      return createErrorResponse(res, '缺少必要参数', 400);
    }

    await ossClient.abortMultipartUpload(objectKey, uploadId);
    return createSuccessResponse(res, { success: true });
  } catch (error) {
    console.error('取消分片上传失败:', error);
    return createErrorResponse(res, '取消分片上传失败', 500);
  }
}

