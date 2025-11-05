import apiClient from './api';

export interface OperationStaff {
  id: string;
  username: string;
  email: string;
  role: 'super_admin' | 'audit_staff' | 'service_staff' | 'operation_staff' | 'finance_staff';
  realName: string | null;
  phone: string | null;
}

export interface OperationLoginResponse {
  token: string;
  staff: OperationStaff;
}

// 运营系统登录
export async function operationLogin(
  username: string,
  password: string,
  verifyCode?: string
): Promise<OperationLoginResponse> {
  const response = await apiClient.post<OperationLoginResponse>('/auth/operation/login', {
    username,
    password,
    verifyCode,
  });
  return response.data;
}

// 获取当前运营人员信息
export async function getCurrentStaff(): Promise<{ staff: OperationStaff }> {
  const response = await apiClient.get<{ staff: OperationStaff }>('/auth/operation/me');
  return response.data;
}

// 保存token和运营人员信息
export function saveAuth(token: string, staff: OperationStaff) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('operation_token', token);
    localStorage.setItem('operation_staff', JSON.stringify(staff));
  }
}

// 清除认证信息
export function clearAuth() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('operation_token');
    localStorage.removeItem('operation_staff');
  }
}

// 获取token
export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('operation_token');
  }
  return null;
}

// 获取运营人员信息
export function getStaff(): OperationStaff | null {
  if (typeof window !== 'undefined') {
    const staffStr = localStorage.getItem('operation_staff');
    if (staffStr) {
      return JSON.parse(staffStr);
    }
  }
  return null;
}

// 检查是否已登录
export function isAuthenticated(): boolean {
  return getToken() !== null;
}

// 检查权限
export function hasPermission(requiredRoles: string[]): boolean {
  const staff = getStaff();
  if (!staff) return false;
  return requiredRoles.includes(staff.role);
}

