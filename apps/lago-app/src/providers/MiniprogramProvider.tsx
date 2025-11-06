/**
 * 小程序环境Provider
 * 提供小程序环境检测和相关功能
 */

"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { isInMiniProgram, initMiniProgramCommunication } from '@lago/common';

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
    const inMiniprogram = isInMiniProgram();
    setIsMiniprogram(inMiniprogram);

    if (inMiniprogram) {
      // 初始化小程序通信
      initMiniProgramCommunication();

      // 监听来自小程序的消息
      window.addEventListener('message', (event) => {
        if (event.data && event.data.type) {
          console.log('收到小程序消息:', event.data);
          
          switch (event.data.type) {
            case 'userInfo':
              setUserInfo(event.data.userInfo);
              break;
            case 'userInfoError':
              console.error('获取用户信息失败:', event.data.error);
              break;
            case 'loginSuccess':
              console.log('登录成功:', event.data.code);
              break;
            case 'loginError':
              console.error('登录失败:', event.data.error);
              break;
            default:
              console.log('未知消息类型:', event.data.type);
          }
        }
      });
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

