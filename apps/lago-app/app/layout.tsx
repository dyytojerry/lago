import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Lago 来购',
  description: '社区二手租售平台',
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

