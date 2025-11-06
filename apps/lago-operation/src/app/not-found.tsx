"use client";

import { NavigationLink } from "@lago/ui";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="text-6xl mb-4 text-yellow-500">⚠️</div>
      <h1 className="text-2xl font-bold mb-2">您访问的页面不存在</h1>
      <NavigationLink
        href="/"
        className="mt-4 px-6 py-2 bg-primary text-white rounded hover:bg-primary/90 transition"
      >
        返回首页
      </NavigationLink>
    </div>
  );
}
