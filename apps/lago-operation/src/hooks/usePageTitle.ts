/**
 * 页面标题管理Hook
 * 支持普通Web环境和小程序环境
 */

import { useEffect, useCallback } from 'react';
import { setMiniprogramTitle } from '@/lib/miniprogram';

export function usePageTitle(title: string, dependencies: any[] = []) {
  useEffect(() => {
    setMiniprogramTitle(title);
  }, [title, ...dependencies]);
}

export function usePageTitleManager() {
  const setTitle = useCallback((title: string) => {
    setMiniprogramTitle(title);
  }, []);

  return { setTitle };
}
