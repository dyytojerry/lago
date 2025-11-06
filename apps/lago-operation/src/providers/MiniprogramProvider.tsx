/**
 * 小程序环境Provider
 * 提供小程序环境检测和相关功能
 */

"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { isInMiniprogram, initMiniprogramEnvironment, listenMiniprogramMessages } from '@/lib/miniprogram';

interface MiniprogramContextType {
  isMiniprogram: boolean;
  userInfo: any | null;
  setUserInfo: (userInfo: any) => void;
}

const MiniprogramContext = createContext<MiniprogramContextType | undefined>(undefined);

export function MiniprogramProvider({ children }: { children: React.ReactNode }) {
  const [isMiniprogram, setIsMiniprogram] = useState(false);
  const [userInfo, setUserInfo] = useState<any | null>(null);

  useEffect(() => {
    const inMiniprogram = isInMiniprogram();
    setIsMiniprogram(inMiniprogram);

    if (inMiniprogram) {
      // 初始化小程序环境
      initMiniprogramEnvironment();

      // 监听来自小程序的消息
      const cleanup = listenMiniprogramMessages((message) => {
        console.log('收到小程序消息:', message);
        
        switch (message.type) {
          case 'userInfo':
            setUserInfo(message.userInfo);
            break;
          case 'userInfoError':
            console.error('获取用户信息失败:', message.error);
            break;
          case 'loginSuccess':
            console.log('登录成功:', message.code);
            break;
          case 'loginError':
            console.error('登录失败:', message.error);
            break;
          default:
            console.log('未知消息类型:', message.type);
        }
      });

      return cleanup;
    }
  }, []);

  return (
    <MiniprogramContext.Provider value={{ isMiniprogram, userInfo, setUserInfo }}>
      {children}
    </MiniprogramContext.Provider>
  );
}

export function useMiniprogram() {
  const context = useContext(MiniprogramContext);
  if (context === undefined) {
    throw new Error('useMiniprogram must be used within a MiniprogramProvider');
  }
  return context;
}
