import axios from 'axios';
import { wechatLogin as wxLogin } from './wechat';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface User {
  id: string;
  nickname: string | null;
  avatarUrl: string | null;
  role: 'user' | 'merchant' | 'property' | 'admin';
  phone: string | null;
  isVerified: boolean;
  creditScore: number;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// 微信登录（小程序）
export async function wechatLogin(): Promise<LoginResponse> {
  try {
    // 获取微信登录code
    const code = await wxLogin();
    
    // 调用后端API
    const response = await apiClient.post<LoginResponse>('/auth/wechat/login', {
      code,
    });
    
    // 保存token和用户信息
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || '微信登录失败');
  }
}

// 获取当前用户信息
export async function getCurrentUser(): Promise<{ user: User }> {
  const token = localStorage.getItem('token');
  const response = await apiClient.get<{ user: User }>('/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

// 保存认证信息
export function saveAuth(token: string, user: User) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }
}

// 清除认证信息
export function clearAuth() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}

// 检查是否已登录
export function isAuthenticated(): boolean {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token') !== null;
  }
  return false;
}

