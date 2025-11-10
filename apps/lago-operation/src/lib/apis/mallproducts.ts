import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { apiRequest, HTTPResponse } from '@lago/common';
import * as Types from './types';
import { IsString, IsNumber, IsBoolean, IsArray, IsObject, IsOptional, IsEnum, ValidateNested } from 'class-validator';

export class AdminMallProductsQueryParams {
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

export class AdminMallProductsResponse {
  @IsArray()
  products: any[];

  @ValidateNested()
  pagination: Types.Pagination;

}
export class AdminMallProductDTO {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  price: number;

  @IsArray()
  @IsOptional()
  images?: string[];

  @IsArray()
  @IsOptional()
  visibleCommunityIds?: string[];

  @IsEnum(['draft', 'published', 'offline'])
  @IsOptional()
  status?: 'draft' | 'published' | 'offline';

}
export class AdminMallProductUpdatePathParams {
  @IsString()
  id: string;

}

export class AdminMallProductUpdateDTO {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsArray()
  @IsOptional()
  images?: string[];

  @IsArray()
  @IsOptional()
  visibleCommunityIds?: string[];

  @IsEnum(['draft', 'published', 'offline'])
  @IsOptional()
  status?: 'draft' | 'published' | 'offline';

}
export class AdminMallProductUpdateResponse {
  @IsObject()
  product: any;

}
export class AdminMallProductDeletePathParams {
  @IsString()
  id: string;

}

export class AdminMallProductDeleteResponse {
  @IsString()
  message: string;

}
/**
 * 获取商城商品列表
 */
export async function adminMallProducts(
  queryParams?: AdminMallProductsQueryParams,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest("/api/admin/mall/products", {
    method: 'GET',
    noAuthorize: noAuthorize,
    params: queryParams,
  });
}

/**
 * 创建商城商品
 */
export async function adminMallProduct(
  data: AdminMallProductDTO,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest("/api/admin/mall/products", {
    method: 'POST',
    body: JSON.stringify(data),
    noAuthorize: noAuthorize,
  });
}

/**
 * 更新商城商品
 */
export async function adminMallProductUpdate(
  pathParams: AdminMallProductUpdatePathParams,
  data: AdminMallProductUpdateDTO,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest(`/api/admin/mall/products/${pathParams.id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    noAuthorize: noAuthorize,
  });
}

/**
 * 下架商城商品
 */
export async function adminMallProductDelete(
  pathParams: AdminMallProductDeletePathParams,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest(`/api/admin/mall/products/${pathParams.id}`, {
    method: 'DELETE',
    noAuthorize: noAuthorize,
  });
}

/**
 * 获取商城商品列表 Hook
 */
export function useAdminMallProducts(
  queryParams?: AdminMallProductsQueryParams,
  options?: UseQueryOptions<HTTPResponse<AdminMallProductsResponse>, Error>
) {
  return useQuery({
    queryKey: ['mallproducts', '获取商城商品列表', queryParams?.page, queryParams?.limit, queryParams?.status, queryParams?.search],
    queryFn: () => adminMallProducts(queryParams),
    ...options,
  });
}

/**
 * 创建商城商品 Hook
 */
export function useAdminMallProduct(
  options?: UseMutationOptions<HTTPResponse<AdminMallProductResponse>, Error, AdminMallProductDTO>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => adminMallProduct(data),
    onSuccess: () => {
      // 清除相关缓存
      queryClient.invalidateQueries({ queryKey: ['mallproducts'] });
      queryClient.invalidateQueries({ queryKey: ['operation'] });
    },
    onError: (error: any) => {
      console.error('Mutation failed:', error);
    },
    ...options,
  });
}

/**
 * 更新商城商品 Hook
 */
export function useAdminMallProductUpdate(
  pathParams: AdminMallProductUpdatePathParams,
  options?: UseMutationOptions<HTTPResponse<AdminMallProductUpdateResponse>, Error, AdminMallProductUpdateDTO>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => adminMallProductUpdate(pathParams, data),
    onSuccess: () => {
      // 清除相关缓存
      queryClient.invalidateQueries({ queryKey: ['mallproducts'] });
      queryClient.invalidateQueries({ queryKey: ['operation'] });
    },
    onError: (error: any) => {
      console.error('Mutation failed:', error);
    },
    ...options,
  });
}

/**
 * 下架商城商品 Hook
 */
export function useAdminMallProductDelete(
  pathParams: AdminMallProductDeletePathParams,
  options?: UseMutationOptions<HTTPResponse<AdminMallProductDeleteResponse>, Error, any>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => adminMallProductDelete(pathParams),
    onSuccess: () => {
      // 清除相关缓存
      queryClient.invalidateQueries({ queryKey: ['mallproducts'] });
      queryClient.invalidateQueries({ queryKey: ['operation'] });
    },
    onError: (error: any) => {
      console.error('Mutation failed:', error);
    },
    ...options,
  });
}

