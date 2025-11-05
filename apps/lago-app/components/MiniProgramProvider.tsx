'use client';

import { useEffect } from 'react';
import { initMiniProgramCommunication } from '@/lib/miniprogram';

export function MiniProgramProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 初始化小程序通信
    initMiniProgramCommunication();
  }, []);

  return <>{children}</>;
}
