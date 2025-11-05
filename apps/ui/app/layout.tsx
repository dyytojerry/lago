import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lago Design System Manager",
  description: "管理和编辑所有前端项目的设计系统",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
