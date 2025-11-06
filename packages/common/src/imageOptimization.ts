/**
 * 阿里云OSS图片优化工具函数
 * 用于生成优化后的图片URL，提高加载效率
 */

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpg' | 'png' | 'jpeg';
  resize?: 'fill' | 'fit' | 'mfit' | 'lfit' | 'limit' | 'pad';
  crop?: boolean;
}

/**
 * 生成优化后的阿里云OSS图片URL
 * @param originalUrl 原始图片URL
 * @param options 优化选项
 * @returns 优化后的图片URL
 */
export function optimizeImageUrl(
  originalUrl: string,
  options: ImageOptimizationOptions = {}
): string {
  // 如果不是阿里云OSS URL，直接返回原URL
  if (!isAliyunOSSUrl(originalUrl)) {
    return originalUrl;
  }

  const {
    width,
    height,
    quality = 85,
    format = 'webp',
    resize = 'mfit',
    crop = false,
  } = options;

  // 构建图片处理参数
  const params: string[] = [];

  // 尺寸处理
  if (width && height) {
    params.push(`resize,w_${width},h_${height},m_${resize}`);
  } else if (width) {
    params.push(`resize,w_${width},m_${resize}`);
  } else if (height) {
    params.push(`resize,h_${height},m_${resize}`);
  }

  // 裁剪处理
  if (crop && width && height) {
    params.push(`crop,w_${width},h_${height},g_center`);
  }

  // 质量压缩
  if (quality < 100) {
    params.push(`quality,q_${quality}`);
  }

  // 格式转换
  if (format && format !== 'jpg') {
    params.push(`format,${format}`);
  }

  // 如果没有参数，返回原URL
  if (params.length === 0) {
    return originalUrl;
  }

  // 构建处理参数字符串
  const processParams = params.join('/');
  
  // 在URL中插入图片处理参数
  return insertImageProcessParams(originalUrl, processParams);
}

/**
 * 检查是否为阿里云OSS URL
 */
function isAliyunOSSUrl(url: string): boolean {
  return url.includes('aliyuncs.com') || url.includes('oss-');
}

/**
 * 在OSS URL中插入图片处理参数
 */
function insertImageProcessParams(url: string, params: string): string {
  // 如果URL已经包含处理参数，先移除
  const baseUrl = url.split('?x-oss-process=')[0];
  
  // 添加图片处理参数
  return `${baseUrl}?x-oss-process=image/${params}`;
}

/**
 * 为相册展示生成优化图片URL
 * 默认使用较小的尺寸和WebP格式
 */
export function getOptimizedThumbnailUrl(
  originalUrl: string,
  maxWidth: number = 400,
  maxHeight: number = 400
): string {
  return optimizeImageUrl(originalUrl, {
    width: maxWidth,
    height: maxHeight,
    quality: 80,
    format: 'webp',
    resize: 'mfit',
  });
}

/**
 * 为预览大图生成优化URL
 * 使用较高质量但仍进行适当压缩
 */
export function getOptimizedPreviewUrl(
  originalUrl: string,
  maxWidth: number = 1200,
  maxHeight: number = 1200
): string {
  return optimizeImageUrl(originalUrl, {
    width: maxWidth,
    height: maxHeight,
    quality: 90,
    format: 'webp',
    resize: 'mfit',
  });
}

/**
 * 获取原图URL（不进行任何优化）
 */
export function getOriginalImageUrl(originalUrl: string): string {
  return originalUrl;
}

/**
 * 根据容器尺寸动态计算图片尺寸
 */
export function calculateImageDimensions(
  containerWidth: number,
  containerHeight: number,
  imageAspectRatio?: number,
  maxSize: number = 800
): { width: number; height: number } {
  let width = Math.min(containerWidth, maxSize);
  let height = Math.min(containerHeight, maxSize);

  // 如果提供了图片宽高比，按比例调整
  if (imageAspectRatio) {
    if (width / height > imageAspectRatio) {
      width = height * imageAspectRatio;
    } else {
      height = width / imageAspectRatio;
    }
  }

  return {
    width: Math.round(width),
    height: Math.round(height),
  };
}
