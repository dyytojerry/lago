/**
 * 统一的分享功能Hook
 * 支持普通Web环境和小程序环境
 */

import { useCallback } from 'react';
import { isInMiniprogram, shareInMiniprogram } from '@/lib/miniprogram';
import toast from 'react-hot-toast';

export interface ShareOptions {
  title: string;
  desc?: string;
  url?: string;
  imageUrl?: string;
  path?: string; // 小程序页面路径
}

export function useShare() {
  const share = useCallback(async (options: ShareOptions) => {
    const {
      title,
      desc,
      url = window.location.href,
      imageUrl,
      path
    } = options;

    if (isInMiniprogram()) {
      // 小程序环境：通过postMessage发送分享请求
      shareInMiniprogram({
        title,
        desc,
        path: path || '/pages/webview/webview',
        imageUrl
      });
    } else {
      // 普通Web环境：使用Web Share API或复制链接
      if (navigator.share) {
        try {
          await navigator.share({
            title,
            text: desc,
            url
          });
        } catch (error) {
          console.log('分享被取消或失败:', error);
        }
      } else {
        // 降级到复制链接
        try {
          await navigator.clipboard.writeText(url);
          toast.success('链接已复制到剪贴板');
        } catch (error) {
          console.error('复制链接失败:', error);
          toast.error('分享失败，请手动复制链接');
        }
      }
    }
  }, []);

  return { share };
}
