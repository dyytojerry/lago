/**
 * 认证工具函数
 * 使用 @lago/common 的 storage 和 apiRequest
 */

import { storage } from '@lago/common';
import { apiRequest, HTTPResponse } from '@lago/common';

export interface User {
  id: string;
  nickname?: string;
  phone?: string;
  role: string;
  creditScore: number;
  isVerified: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

/**
 * 保存认证信息
 */
export function saveAuth(token: string, user: User): void {
  storage.setItem(TOKEN_KEY, token);
  storage.setItem(USER_KEY, user);
}

/**
 * 获取 token
 */
export async function getToken(): Promise<string | null> {
  return await storage.getItem<string>(TOKEN_KEY);
}

/**
 * 获取用户信息
 */
export async function getUser(): Promise<User | null> {
  return await storage.getItem<User>(USER_KEY);
}

/**
 * 检查是否已认证
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getToken();
  return !!token;
}

/**
 * 清除认证信息
 */
export function clearAuth(): void {
  storage.removeItem(TOKEN_KEY);
  storage.removeItem(USER_KEY);
}

/**
 * 手机号登录
 */
export async function phoneLogin(
  phone: string,
  password: string
): Promise<AuthResponse> {
  const response = await apiRequest<AuthResponse>('/api/auth/phone/login', {
    method: 'POST',
    body: JSON.stringify({ phone, password }),
    noAuthorize: true,
  });

  if (response.success && response.data) {
    saveAuth(response.data.token, response.data.user);
    return response.data;
  }

  throw new Error(response.error || '登录失败');
}

/**
 * 手机号注册
 */
export async function phoneRegister(
  phone: string,
  password: string
): Promise<AuthResponse> {
  const response = await apiRequest<AuthResponse>('/api/auth/phone/register', {
    method: 'POST',
    body: JSON.stringify({ phone, password }),
    noAuthorize: true,
  });

  if (response.success && response.data) {
    saveAuth(response.data.token, response.data.user);
    return response.data;
  }

  throw new Error(response.error || '注册失败');
}

