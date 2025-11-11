import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { apiRequest, HTTPResponse, jsonToFormData } from '@lago/common';
import * as Types from './types';
import { IsString, IsNumber, IsBoolean, IsArray, IsObject, IsOptional, IsEnum, ValidateNested } from 'class-validator';

export class AdminMallActivitiesQueryParams {
  @IsNumber()
  @IsOptional()
  page?: number;

  @IsNumber()
  @IsOptional()
  limit?: number;

  @IsEnum(['draft', 'published', 'offline'])
  @IsOptional()
  status?: 'draft' | 'published' | 'offline';

  @IsString()
  @IsOptional()
  search?: string;

}

export class AdminMallActivitiesResponse {
  @IsArray()
  activities: any[];

  @ValidateNested()
  pagination: Types.Pagination;

}
export class AdminMallActivitieDTO {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  coverImage?: string;

  @IsString()
  @IsOptional()
  startTime?: string;

  @IsString()
  @IsOptional()
  endTime?: string;

  @IsArray()
  @IsOptional()
  visibleCommunityIds?: string[];

  @IsEnum(['draft', 'published', 'offline'])
  @IsOptional()
  status?: 'draft' | 'published' | 'offline';

}
export class AdminMallActivitieUpdatePathParams {
  @IsString()
  id: string;

}

export class AdminMallActivitieUpdateDTO {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  coverImage?: string;

  @IsString()
  @IsOptional()
  startTime?: string;

  @IsString()
  @IsOptional()
  endTime?: string;

  @IsArray()
  @IsOptional()
  visibleCommunityIds?: string[];

  @IsEnum(['draft', 'published', 'offline'])
  @IsOptional()
  status?: 'draft' | 'published' | 'offline';

}
export class AdminMallActivitieUpdateResponse {
  @IsObject()
  activity: any;

}
export class AdminMallActivitieDeletePathParams {
  @IsString()
  id: string;

}

export class AdminMallActivitieDeleteResponse {
  @IsString()
  message: string;

}
/**
 * 获取商城活动列表
 */
export async function adminMallActivities(
  queryParams?: AdminMallActivitiesQueryParams,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest("/api/admin/mall/activities", {
    method: 'GET',
    noAuthorize: noAuthorize,
    params: queryParams,
  });
}

/**
 * 创建商城活动
 */
export async function adminMallActivitie(
  data: AdminMallActivitieDTO,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest("/api/admin/mall/activities", {
    method: 'POST',
    body: JSON.stringify(data),
    noAuthorize: noAuthorize,
  });
}

/**
 * 更新商城活动
 */
export async function adminMallActivitieUpdate(
  pathParams: AdminMallActivitieUpdatePathParams,
  data: AdminMallActivitieUpdateDTO,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest(`/api/admin/mall/activities/${pathParams.id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    noAuthorize: noAuthorize,
  });
}

/**
 * 下架商城活动
 */
export async function adminMallActivitieDelete(
  pathParams: AdminMallActivitieDeletePathParams,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest(`/api/admin/mall/activities/${pathParams.id}`, {
    method: 'DELETE',
    noAuthorize: noAuthorize,
  });
}

/**
 * 获取商城活动列表 Hook
 */
export function useAdminMallActivities(
  queryParams?: AdminMallActivitiesQueryParams,
  options?: UseQueryOptions<HTTPResponse<AdminMallActivitiesResponse>, Error>
) {
  return useQuery({
    queryKey: ['mallactivities', '获取商城活动列表', queryParams?.page, queryParams?.limit, queryParams?.status, queryParams?.search],
    queryFn: () => adminMallActivities(queryParams),
    ...options,
  });
}

/**
 * 创建商城活动 Hook
 */
export function useAdminMallActivitie(
  options?: UseMutationOptions<HTTPResponse<AdminMallActivitieResponse>, Error, AdminMallActivitieDTO>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => adminMallActivitie(data),
    onSuccess: () => {
      // 清除相关缓存
      queryClient.invalidateQueries({ queryKey: ['mallactivities'] });
      queryClient.invalidateQueries({ queryKey: ['operation'] });
    },
    onError: (error: any) => {
      console.error('Mutation failed:', error);
    },
    ...options,
  });
}

/**
 * 更新商城活动 Hook
 */
export function useAdminMallActivitieUpdate(
  pathParams: AdminMallActivitieUpdatePathParams,
  options?: UseMutationOptions<HTTPResponse<AdminMallActivitieUpdateResponse>, Error, AdminMallActivitieUpdateDTO>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => adminMallActivitieUpdate(pathParams, data),
    onSuccess: () => {
      // 清除相关缓存
      queryClient.invalidateQueries({ queryKey: ['mallactivities'] });
      queryClient.invalidateQueries({ queryKey: ['operation'] });
    },
    onError: (error: any) => {
      console.error('Mutation failed:', error);
    },
    ...options,
  });
}

/**
 * 下架商城活动 Hook
 */
export function useAdminMallActivitieDelete(
  pathParams: AdminMallActivitieDeletePathParams,
  options?: UseMutationOptions<HTTPResponse<AdminMallActivitieDeleteResponse>, Error, any>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => adminMallActivitieDelete(pathParams),
    onSuccess: () => {
      // 清除相关缓存
      queryClient.invalidateQueries({ queryKey: ['mallactivities'] });
      queryClient.invalidateQueries({ queryKey: ['operation'] });
    },
    onError: (error: any) => {
      console.error('Mutation failed:', error);
    },
    ...options,
  });
}

