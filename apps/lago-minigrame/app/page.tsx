'use client';

import { useEffect, useState } from 'react';
import { wechatLogin, isAuthenticated, getUser } from '@/lib/auth';

export default function MiniProgramPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const user = getUser();

  useEffect(() => {
    // 如果未登录，自动尝试微信登录
    if (!isAuthenticated()) {
      handleWechatLogin();
    }
  }, []);

  const handleWechatLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      await wechatLogin();
      // 登录成功后刷新页面
      window.location.reload();
    } catch (err: any) {
      setError(err.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>正在登录...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={handleWechatLogin}
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
          >
            重试登录
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">欢迎来到 Lago</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">用户信息</h2>
          <div className="space-y-2">
            <p><strong>昵称:</strong> {user.nickname || '未设置'}</p>
            <p><strong>手机号:</strong> {user.phone || '未绑定'}</p>
            <p><strong>角色:</strong> {user.role}</p>
            <p><strong>信用积分:</strong> {user.creditScore}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

