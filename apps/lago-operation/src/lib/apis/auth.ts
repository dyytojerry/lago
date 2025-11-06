import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { apiRequest, HTTPResponse, jsonToFormData } from '@lago/common';
import * as Types from './types';
import { IsString, IsNumber, IsBoolean, IsArray, IsObject, IsOptional, IsEnum, ValidateNested } from 'class-validator';

export type AuthOperationLoginResponse = Types.OperationLoginResponse;

export type AuthOperationMeResponse = any;

/**
 * 运营系统登录
 */
export async function authOperationLogin(
  data: Types.OperationLoginRequest,
  noAuthorize?: boolean
): Promise<HTTPResponse<AuthOperationLoginResponse>> {
  return await apiRequest("/api/auth/operation/login", {
    method: 'POST',
    body: JSON.stringify(data),
    noAuthorize: noAuthorize,
  });
}

/**
 * 获取当前运营人员信息
 */
export async function authOperationMe(
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest("/api/auth/operation/me", {
    method: 'GET',
    noAuthorize: noAuthorize,
  });
}

/**
 * 运营系统登录 Hook
 */
export function useAuthOperationLogin(
  options?: UseMutationOptions<HTTPResponse<AuthOperationLoginResponse>, Error, Types.OperationLoginRequest>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => authOperationLogin(data),
    onSuccess: () => {
      // 清除相关缓存
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      queryClient.invalidateQueries({ queryKey: ['operation'] });
    },
    onError: (error: any) => {
      console.error('Mutation failed:', error);
    },
    ...options,
  });
}

/**
 * 获取当前运营人员信息 Hook
 */
export function useAuthOperationMe(
  options?: UseQueryOptions<HTTPResponse<AuthOperationMeResponse>, Error>
) {
  return useQuery({
    queryKey: ['auth', '获取当前运营人员信息'],
    queryFn: () => authOperationMe(),
    ...options,
  });
}

