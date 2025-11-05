import type { Metadata } from "next";
import "./globals.css";
import { MiniProgramProvider } from "@/components/MiniProgramProvider";

export const metadata: Metadata = {
  title: "来购 - 社区化二手与租赁平台",
  description: "发现身边的优质商品，轻松租售",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <MiniProgramProvider>
          {children}
        </MiniProgramProvider>
      </body>
    </html>
  );
}