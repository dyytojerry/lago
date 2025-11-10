import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { apiRequest, HTTPResponse } from '@lago/common';
import * as Types from './types';
import { IsString, IsNumber, IsBoolean, IsArray, IsObject, IsOptional, IsEnum, ValidateNested } from 'class-validator';

export class AdminMallBannersQueryParams {
  @IsNumber()
  @IsOptional()
  page?: number;

  @IsNumber()
  @IsOptional()
  limit?: number;

  @IsEnum(['inactive', 'active'])
  @IsOptional()
  status?: 'inactive' | 'active';

}

export class AdminMallBannersResponse {
  @IsArray()
  banners: any[];

  @ValidateNested()
  pagination: Types.Pagination;

}
export class AdminMallBannerDTO {
  @IsString()
  title: string;

  @IsString()
  imageUrl: string;

  @IsString()
  @IsOptional()
  linkUrl?: string;

  @IsEnum(['inactive', 'active'])
  @IsOptional()
  status?: 'inactive' | 'active';

  @IsNumber()
  @IsOptional()
  sortOrder?: number;

}
export class AdminMallBannerUpdatePathParams {
  @IsString()
  id: string;

}

export class AdminMallBannerUpdateDTO {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  linkUrl?: string;

  @IsEnum(['inactive', 'active'])
  @IsOptional()
  status?: 'inactive' | 'active';

  @IsNumber()
  @IsOptional()
  sortOrder?: number;

}
export class AdminMallBannerUpdateResponse {
  @IsObject()
  banner: any;

}
export class AdminMallBannerDeletePathParams {
  @IsString()
  id: string;

}

export class AdminMallBannerDeleteResponse {
  @IsString()
  message: string;

}
/**
 * 获取商城钻石位列表
 */
export async function adminMallBanners(
  queryParams?: AdminMallBannersQueryParams,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest("/api/admin/mall/banners", {
    method: 'GET',
    noAuthorize: noAuthorize,
    params: queryParams,
  });
}

/**
 * 创建商城钻石位
 */
export async function adminMallBanner(
  data: AdminMallBannerDTO,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest("/api/admin/mall/banners", {
    method: 'POST',
    body: JSON.stringify(data),
    noAuthorize: noAuthorize,
  });
}

/**
 * 更新商城钻石位
 */
export async function adminMallBannerUpdate(
  pathParams: AdminMallBannerUpdatePathParams,
  data: AdminMallBannerUpdateDTO,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest(`/api/admin/mall/banners/${pathParams.id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    noAuthorize: noAuthorize,
  });
}

/**
 * 删除商城钻石位
 */
export async function adminMallBannerDelete(
  pathParams: AdminMallBannerDeletePathParams,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest(`/api/admin/mall/banners/${pathParams.id}`, {
    method: 'DELETE',
    noAuthorize: noAuthorize,
  });
}

/**
 * 获取商城钻石位列表 Hook
 */
export function useAdminMallBanners(
  queryParams?: AdminMallBannersQueryParams,
  options?: UseQueryOptions<HTTPResponse<AdminMallBannersResponse>, Error>
) {
  return useQuery({
    queryKey: ['mallbanners', '获取商城钻石位列表', queryParams?.page, queryParams?.limit, queryParams?.status],
    queryFn: () => adminMallBanners(queryParams),
    ...options,
  });
}

/**
 * 创建商城钻石位 Hook
 */
export function useAdminMallBanner(
  options?: UseMutationOptions<HTTPResponse<any>, Error, AdminMallBannerDTO>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => adminMallBanner(data),
    onSuccess: () => {
      // 清除相关缓存
      queryClient.invalidateQueries({ queryKey: ['mallbanners'] });
      queryClient.invalidateQueries({ queryKey: ['operation'] });
    },
    onError: (error: any) => {
      console.error('Mutation failed:', error);
    },
    ...options,
  });
}

/**
 * 更新商城钻石位 Hook
 */
export function useAdminMallBannerUpdate(
  pathParams: AdminMallBannerUpdatePathParams,
  options?: UseMutationOptions<HTTPResponse<any>, Error, AdminMallBannerUpdateDTO>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => adminMallBannerUpdate(pathParams, data),
    onSuccess: () => {
      // 清除相关缓存
      queryClient.invalidateQueries({ queryKey: ['mallbanners'] });
      queryClient.invalidateQueries({ queryKey: ['operation'] });
    },
    onError: (error: any) => {
      console.error('Mutation failed:', error);
    },
    ...options,
  });
}

/**
 * 删除商城钻石位 Hook
 */
export function useAdminMallBannerDelete(
  pathParams: AdminMallBannerDeletePathParams,
  options?: UseMutationOptions<HTTPResponse<any>, Error, any>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => adminMallBannerDelete(pathParams),
    onSuccess: () => {
      // 清除相关缓存
      queryClient.invalidateQueries({ queryKey: ['mallbanners'] });
      queryClient.invalidateQueries({ queryKey: ['operation'] });
    },
    onError: (error: any) => {
      console.error('Mutation failed:', error);
    },
    ...options,
  });
}

