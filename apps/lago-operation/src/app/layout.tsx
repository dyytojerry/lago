"use client";

import React from "react";
import "./globals.css";
import { AuthProvider } from "@/providers/AuthProvider";
import {
  WebSocketProvider,
  RealTimeNotifications,
} from "@/providers/WebSocketProvider";
import { Toaster } from "react-hot-toast";
import { ApiProvider } from "@/providers/ApiProvider";
import { LoadingProvider } from "@/providers/LoadingProvider";
import { MiniprogramProvider } from "@/providers/MiniprogramProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <head>
        <title>丁家乐园</title>
        <meta name="description" content="让每个孩子都能筑起属于自己的梦想" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </head>
      <body className="min-h-screen bg-background-primary">
        <LoadingProvider>
          <ApiProvider>
            <MiniprogramProvider>
              <AuthProvider>
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
