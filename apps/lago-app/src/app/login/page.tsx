'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { useAuthLogin, useAuthWechatLogin } from '@/lib/apis/auth';
import { useAuth } from '@lago/ui';
import { Mail, Phone, Lock, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { isLoggedIn, updateUser } = useAuth();
  const [loginMethod, setLoginMethod] = useState<'password' | 'wechat'>('password');
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    wechatCode: '',
  });

  const loginMutation = useAuthLogin({
    onSuccess: (result) => {
      if (result.data?.user && result.data?.token) {
        updateUser(result.data.user);
        localStorage.setItem('token', result.data.token);
        toast.success('登录成功');
        router.push('/');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || '登录失败');
    },
  });

  const wechatLoginMutation = useAuthWechatLogin({
    onSuccess: (result) => {
      if (result.data?.user && result.data?.token) {
        updateUser(result.data.user);
        localStorage.setItem('token', result.data.token);
        toast.success('登录成功');
        router.push('/');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || '登录失败');
    },
  });

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.identifier || !formData.password) {
      toast.error('请填写完整信息');
      return;
    }

    await loginMutation.mutateAsync({
      identifier: formData.identifier,
      password: formData.password,
    });
  };

  const handleWechatLogin = async () => {
    // TODO: 获取微信code
    const code = formData.wechatCode || 'mock_code';
    await wechatLoginMutation.mutateAsync({ code });
  };

  if (isLoggedIn) {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header title="登录" showBack={false} />

      <main className="max-w-md mx-auto px-4 py-8">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-text-primary mb-6 text-center">欢迎回来</h1>

          {/* 登录方式切换 */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setLoginMethod('password')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm transition-colors ${
                loginMethod === 'password'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-text-primary'
              }`}
            >
              账号登录
            </button>
            <button
              onClick={() => setLoginMethod('wechat')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm transition-colors ${
                loginMethod === 'wechat'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-text-primary'
              }`}
            >
              微信登录
            </button>
          </div>

          {/* 密码登录表单 */}
          {loginMethod === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  手机号/邮箱
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
                  <input
                    type="text"
                    value={formData.identifier}
                    onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                    placeholder="请输入手机号、邮箱或微信ID"
                    className="w-full pl-10 pr-4 py-2 bg-container rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  密码
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="请输入密码"
                    className="w-full pl-10 pr-4 py-2 bg-container rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full px-4 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <LogIn className="w-5 h-5" />
                <span>{loginMutation.isPending ? '登录中...' : '登录'}</span>
              </button>
            </form>
          )}

          {/* 微信登录 */}
          {loginMethod === 'wechat' && (
            <div className="space-y-4">
              <button
                onClick={handleWechatLogin}
                disabled={wechatLoginMutation.isPending}
                className="w-full px-4 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {wechatLoginMutation.isPending ? '登录中...' : '微信一键登录'}
              </button>
              <p className="text-xs text-text-secondary text-center">
                使用微信登录，无需密码
              </p>
            </div>
          )}

          {/* 注册链接 */}
          <div className="mt-6 text-center">
            <p className="text-sm text-text-secondary">
              还没有账号？{' '}
              <button
                onClick={() => router.push('/register')}
                className="text-primary font-medium hover:underline"
              >
                立即注册
              </button>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

