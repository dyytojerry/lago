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
import { authLogin, authLogout, authMe, authRefresh } from "@/lib/apis";

// 定义 authApi 对象（小程序端）
const authApi = {
  authMe: authMe,
  authLogin: authLogin,
  authLogout: authLogout,
  authRefresh: authRefreshToken,
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
