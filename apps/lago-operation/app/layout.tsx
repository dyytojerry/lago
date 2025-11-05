import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Lago 运营系统',
  description: '平台管理后台',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}

