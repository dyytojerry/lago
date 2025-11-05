'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getUser } from '@/lib/auth';

export default function HomePage() {
  const router = useRouter();
  const user = getUser();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">欢迎来到 Lago</h1>
        {user && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">用户信息</h2>
            <div className="space-y-2">
              <p><strong>昵称:</strong> {user.nickname || '未设置'}</p>
              <p><strong>手机号:</strong> {user.phone || '未绑定'}</p>
              <p><strong>角色:</strong> {user.role}</p>
              <p><strong>信用积分:</strong> {user.creditScore}</p>
              <p><strong>实名认证:</strong> {user.isVerified ? '已认证' : '未认证'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

