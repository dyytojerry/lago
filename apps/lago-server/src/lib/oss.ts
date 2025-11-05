import OSS from 'ali-oss';
import path from 'path';
import crypto from 'crypto';

// OSS配置
const ossConfig = {
  accessKeyId: process.env.ACCESS_KEY_ID!,
  accessKeySecret: process.env.ACCESS_KEY_SECRET!,
  bucket: process.env.OSS_BUCKET_NAME!,
  endpoint: process.env.OSS_ENDPOINT!,
  region: process.env.OSS_REGION || 'oss-cn-hangzhou',
};

// 创建OSS客户端
export const ossClient = new OSS(ossConfig);

// 生成唯一文件名
export function generateFileName(originalName: string, prefix: string = ''): string {
  const ext = path.extname(originalName);
  const hash = crypto.randomBytes(16).toString('hex');
  const timestamp = Date.now();
  return `${prefix}${prefix ? '/' : ''}${timestamp}-${hash}${ext}`;
}

// 上传文件到OSS
export async function uploadToOSS(
  buffer: Buffer,
  fileName: string,
  contentType?: string
): Promise<{ url: string; fileName: string }> {
  try {
    const result = await ossClient.put(fileName, buffer, {
      headers: {
        'Content-Type': contentType || 'application/octet-stream',
      },
    });

    return {
      url: result.url,
      fileName: result.name,
    };
  } catch (error) {
    console.error('OSS upload error:', error);
    throw new Error('文件上传失败');
  }
}

// 删除OSS文件
export async function deleteFromOSS(fileName: string): Promise<void> {
  try {
    await ossClient.delete(fileName);
  } catch (error) {
    console.error('OSS delete error:', error);
    throw new Error('文件删除失败');
  }
}

// 获取临时访问URL（用于私有文件）
export function getSignedUrl(fileName: string, expires: number = 3600): string {
  return ossClient.signatureUrl(fileName, { expires });
}

// 检查文件是否存在
export async function fileExists(fileName: string): Promise<boolean> {
  try {
    await ossClient.head(fileName);
    return true;
  } catch (error) {
    console.error('Check file exists error:', error);
    return false;
  }
}
