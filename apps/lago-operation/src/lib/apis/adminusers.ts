import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { apiRequest, HTTPResponse, jsonToFormData } from '@lago/common';
import * as Types from './types';
import { IsString, IsNumber, IsBoolean, IsArray, IsObject, IsOptional, IsEnum, ValidateNested } from 'class-validator';

export class AdminUsersQueryParams {
  @IsString()
  @IsOptional()
  page?: string;

  @IsString()
  @IsOptional()
  limit?: string;

  @IsEnum(Types.UserRole)
  @IsOptional()
  role?: Types.UserRole;

  @IsEnum(['active', 'inactive'])
  @IsOptional()
  status?: 'active' | 'inactive';

  @IsString()
  @IsOptional()
  search?: string;

}

export class AdminUserDetailPathParams {
  @IsString()
  id: string;

}

export class AdminUsersStatuPathParams {
  @IsString()
  id: string;

}

export type AdminUsersStatuResponse = Types.SuccessResponse;

/**
 * 获取用户列表
 */
export async function adminUsers(
  queryParams?: AdminUsersQueryParams,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest("/api/admin/users", {
    method: 'GET',
    noAuthorize: noAuthorize,
    params: queryParams,
  });
}

/**
 * 获取用户详情
 */
export async function adminUserDetail(
  pathParams: AdminUserDetailPathParams,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest(`/api/admin/users/${pathParams.id}`, {
    method: 'GET',
    noAuthorize: noAuthorize,
  });
}

/**
 * 更新用户状态
 */
export async function adminUsersStatu(
  pathParams: AdminUsersStatuPathParams,
  data: Types.UserStatusUpdateRequest,
  noAuthorize?: boolean
): Promise<HTTPResponse<AdminUsersStatuResponse>> {
  return await apiRequest(`/api/admin/users/${pathParams.id}/status`, {
    method: 'PUT',
    body: JSON.stringify(data),
    noAuthorize: noAuthorize,
  });
}

/**
 * 获取用户列表 Hook
 */
export function useAdminUsers(
  queryParams?: AdminUsersQueryParams,
  options?: UseQueryOptions<HTTPResponse<AdminUsersResponse>, Error>
) {
  return useQuery({
    queryKey: ['adminusers', '获取用户列表', queryParams?.page, queryParams?.limit, queryParams?.role, queryParams?.status, queryParams?.search],
    queryFn: () => adminUsers(queryParams),
    ...options,
  });
}

/**
 * 获取用户详情 Hook
 */
export function useAdminUserDetail(
  pathParams: AdminUserDetailPathParams,
  options?: UseQueryOptions<HTTPResponse<AdminUserDetailResponse>, Error>
) {
  return useQuery({
    queryKey: ['adminusers', '获取用户详情', pathParams.id],
    queryFn: () => adminUserDetail(pathParams),
    ...options,
  });
}

/**
 * 更新用户状态 Hook
 */
export function useAdminUsersStatu(
  pathParams: AdminUsersStatuPathParams,
  options?: UseMutationOptions<HTTPResponse<AdminUsersStatuResponse>, Error, Types.UserStatusUpdateRequest>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => adminUsersStatu(pathParams, data),
    onSuccess: () => {
      // 清除相关缓存
      queryClient.invalidateQueries({ queryKey: ['adminusers'] });
      queryClient.invalidateQueries({ queryKey: ['operation'] });
    },
    onError: (error: any) => {
      console.error('Mutation failed:', error);
    },
    ...options,
  });
}

