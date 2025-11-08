"use client";

import React from "react";
import "./globals.css";
import {
  AuthProvider,
  WebSocketProvider,
  ApiProvider,
  LoadingProvider,
  MiniprogramProvider,
} from "@lago/ui";
import { Toaster } from "react-hot-toast";
import {
  authOperationLogin,
  authOperationMe,
  authOperationLogout,
  authOperationRefresh,
} from "@/lib/apis";

// 定义 authApi 对象
const authApi = {
  authMe: authOperationMe,
  authLogin: authOperationLogin,
  authLogout: authOperationLogout,
  authRefresh: authOperationRefresh,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <head>
        <title>来购运营系统</title>
        <meta name="description" content="来购运营管理系统" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </head>
      <body className="min-h-screen bg-background-primary">
        <LoadingProvider>
          <ApiProvider>
            <MiniprogramProvider>
              <AuthProvider authApi={authApi} prefix="operation_" name="staff">
                <WebSocketProvider>
                  <div className="relative">{children}</div>
                  {/* <RealTimeNotifications /> */}
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
