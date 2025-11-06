import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { apiRequest, HTTPResponse, jsonToFormData } from '@lago/common';
import * as Types from './types';
import { IsString, IsNumber, IsBoolean, IsArray, IsObject, IsOptional, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class GetApiAdminUsersQueryParams {
  @IsString()
  @IsOptional()
  page?: string;

  @IsString()
  @IsOptional()
  limit?: string;

  @IsEnum(String)
  @IsOptional()
  role?: string;

  @IsEnum(String)
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  search?: string;

}

export class GetApiAdminUsers1PathParams {
  @IsString()
  id!: string;

}

export class PutApiAdminUsersStatusPathParams {
  @IsString()
  id!: string;

}

/**
 * 获取用户列表
 */
export async function getApiAdminUsers(
  queryParams?: GetApiAdminUsersQueryParams,
  noAuthorize?: boolean
): Promise<HTTPResponse<Types.UserListResponse>> {
  return await apiRequest("/api/admin/users", {
    method: 'GET',
    params: queryParams,
    noAuthorize,
  });
}

/**
 * 获取用户详情
 */
export async function getApiAdminUsers1(
  pathParams: GetApiAdminUsers1PathParams,
  noAuthorize?: boolean
): Promise<HTTPResponse<Types.UserDetailResponse>> {
  return await apiRequest(`/api/admin/users/${pathParams.id}`, {
    method: 'GET',
    noAuthorize,
  });
}

/**
 * 更新用户状态
 */
export async function putApiAdminUsersStatus(
  pathParams: PutApiAdminUsersStatusPathParams,
  data: Types.UserStatusUpdateRequest,
  noAuthorize?: boolean
): Promise<HTTPResponse<Types.SuccessResponse>> {
  return await apiRequest(`/api/admin/users/${pathParams.id}/status`, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
    noAuthorize,
  });
}

/**
 * 获取用户列表 - Query Hook
 */
export function useGetApiAdminUsers(
  vars: any,
  options?: UseQueryOptions<HTTPResponse<Types.UserListResponse>, Error>
) {
  return useQuery({
    queryKey: ['getApiAdminUsers', vars],
    queryFn: () => getApiAdminUsers(...vars),
    ...options,
  });
}

/**
 * 获取用户详情 - Query Hook
 */
export function useGetApiAdminUsers1(
  vars: any,
  options?: UseQueryOptions<HTTPResponse<Types.UserDetailResponse>, Error>
) {
  return useQuery({
    queryKey: ['getApiAdminUsers1', vars],
    queryFn: () => getApiAdminUsers1(...vars),
    ...options,
  });
}

/**
 * 更新用户状态 - Mutation Hook
 */
export function usePutApiAdminUsersStatus(
  options?: UseMutationOptions<HTTPResponse<Types.SuccessResponse>, Error, any>
) {
  return useMutation({
    mutationFn: (vars: any) => putApiAdminUsersStatus(...vars),
    ...options,
  });
}

