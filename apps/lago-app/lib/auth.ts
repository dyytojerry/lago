import apiClient from './api';

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

// 微信登录
export async function wechatLogin(code: string): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/auth/wechat/login', {
    code,
  });
  return response.data;
}

// 手机号登录
export async function phoneLogin(phone: string, password: string): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/auth/phone/login', {
    phone,
    password,
  });
  return response.data;
}

// 手机号注册
export async function phoneRegister(
  phone: string,
  password: string,
  verifyCode?: string
): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/auth/phone/register', {
    phone,
    password,
    verifyCode,
  });
  return response.data;
}

// 获取当前用户信息
export async function getCurrentUser(): Promise<{ user: User }> {
  const response = await apiClient.get<{ user: User }>('/auth/me');
  return response.data;
}

// 保存token和用户信息
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

// 获取token
export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

// 获取用户信息
export function getUser(): User | null {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
  }
  return null;
}

// 检查是否已登录
export function isAuthenticated(): boolean {
  return getToken() !== null;
}

