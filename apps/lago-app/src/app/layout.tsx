"use client";

import "./globals.css";
import {
  AuthProvider,
  WebSocketProvider,
  ApiProvider,
  LoadingProvider,
  MiniprogramProvider,
} from "@lago/ui";
import { Toaster } from "react-hot-toast";
import { apiRequest, HTTPResponse } from "@lago/common";

// 定义 authApi 对象（小程序端）
const authApi = {
  authMe: async (noAuthorize?: boolean): Promise<HTTPResponse<any>> => {
    return apiRequest("/api/auth/me", {
      method: "GET",
      noAuthorize,
    });
  },
  authLogin: async (
    loginData: any,
    noAuthorize?: boolean
  ): Promise<HTTPResponse<any>> => {
    return apiRequest("/api/auth/phone/login", {
      method: "POST",
      body: JSON.stringify(loginData),
      noAuthorize,
    });
  },
  authLogout: async (): Promise<void> => {
    // 小程序端的登出逻辑（如果需要）
    return;
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="bg-background">
        <LoadingProvider>
          <ApiProvider>
            <MiniprogramProvider>
              <AuthProvider authApi={authApi}>
                <WebSocketProvider>
                  {children as any}
                  <Toaster
                    position="top-right"
                    toastOptions={{
                      duration: 4000,
                      style: {
                        background: "#363636",
                        color: "#fff",
                      },
                      success: {
                        style: {
                          background: "#4ECDC4",
                        },
                      },
                      error: {
                        style: {
                          background: "#FF6B6B",
                        },
                      },
                    }}
                  />
                </WebSocketProvider>
              </AuthProvider>
            </MiniprogramProvider>
          </ApiProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}
