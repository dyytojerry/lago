import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { apiRequest, HTTPResponse, jsonToFormData } from '@lago/common';
import * as Types from './types';
import { IsString, IsNumber, IsBoolean, IsArray, IsObject, IsOptional, IsEnum, ValidateNested } from 'class-validator';

export class AdminProductsQueryParams {
  @IsString()
  @IsOptional()
  page?: string;

  @IsString()
  @IsOptional()
  limit?: string;

  @IsEnum(Types.ProductStatus)
  @IsOptional()
  status?: Types.ProductStatus;

  @IsEnum(Types.ProductCategory)
  @IsOptional()
  category?: Types.ProductCategory;

  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  ownerId?: string;

}

export type AdminProductsResponse = Types.ProductListResponse;

export class AdminProductDetailPathParams {
  @IsString()
  id: string;

}

export type AdminProductDetailResponse = Types.ProductDetailResponse;

export class AdminProductsApprovePathParams {
  @IsString()
  id: string;

}

export type AdminProductsApproveResponse = Types.SuccessResponse;

export type AdminProductsBatchApproveResponse = Types.SuccessResponse;

/**
 * 获取商品列表
 */
export async function adminProducts(
  queryParams?: AdminProductsQueryParams,
  noAuthorize?: boolean
): Promise<HTTPResponse<AdminProductsResponse>> {
  return await apiRequest("/api/admin/products", {
    method: 'GET',
    noAuthorize: noAuthorize,
    params: queryParams,
  });
}

/**
 * 获取商品详情
 */
export async function adminProductDetail(
  pathParams: AdminProductDetailPathParams,
  noAuthorize?: boolean
): Promise<HTTPResponse<AdminProductDetailResponse>> {
  return await apiRequest(`/api/admin/products/${pathParams.id}`, {
    method: 'GET',
    noAuthorize: noAuthorize,
  });
}

/**
 * 审核商品
 */
export async function adminProductsApprove(
  pathParams: AdminProductsApprovePathParams,
  data: Types.ProductApproveRequest,
  noAuthorize?: boolean
): Promise<HTTPResponse<AdminProductsApproveResponse>> {
  return await apiRequest(`/api/admin/products/${pathParams.id}/approve`, {
    method: 'POST',
    body: JSON.stringify(data),
    noAuthorize: noAuthorize,
  });
}

/**
 * 批量审核商品
 */
export async function adminProductsBatchApprove(
  data: Types.ProductBatchApproveRequest,
  noAuthorize?: boolean
): Promise<HTTPResponse<AdminProductsBatchApproveResponse>> {
  return await apiRequest("/api/admin/products/batch-approve", {
    method: 'POST',
    body: JSON.stringify(data),
    noAuthorize: noAuthorize,
  });
}

/**
 * 获取商品列表 Hook
 */
export function useAdminProducts(
  queryParams?: AdminProductsQueryParams,
  options?: UseQueryOptions<HTTPResponse<AdminProductsResponse>, Error>
) {
  return useQuery({
    queryKey: ['adminproducts', '获取商品列表', queryParams?.page, queryParams?.limit, queryParams?.status, queryParams?.category, queryParams?.search, queryParams?.ownerId],
    queryFn: () => adminProducts(queryParams),
    ...options,
  });
}

/**
 * 获取商品详情 Hook
 */
export function useAdminProductDetail(
  pathParams: AdminProductDetailPathParams,
  options?: UseQueryOptions<HTTPResponse<AdminProductDetailResponse>, Error>
) {
  return useQuery({
    queryKey: ['adminproducts', '获取商品详情', pathParams.id],
    queryFn: () => adminProductDetail(pathParams),
    ...options,
  });
}

/**
 * 审核商品 Hook
 */
export function useAdminProductsApprove(
  pathParams: AdminProductsApprovePathParams,
  options?: UseMutationOptions<HTTPResponse<AdminProductsApproveResponse>, Error, Types.ProductApproveRequest>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => adminProductsApprove(pathParams, data),
    onSuccess: () => {
      // 清除相关缓存
      queryClient.invalidateQueries({ queryKey: ['adminproducts'] });
      queryClient.invalidateQueries({ queryKey: ['operation'] });
    },
    onError: (error: any) => {
      console.error('Mutation failed:', error);
    },
    ...options,
  });
}

/**
 * 批量审核商品 Hook
 */
export function useAdminProductsBatchApprove(
  options?: UseMutationOptions<HTTPResponse<AdminProductsBatchApproveResponse>, Error, Types.ProductBatchApproveRequest>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => adminProductsBatchApprove(data),
    onSuccess: () => {
      // 清除相关缓存
      queryClient.invalidateQueries({ queryKey: ['adminproducts'] });
      queryClient.invalidateQueries({ queryKey: ['operation'] });
    },
    onError: (error: any) => {
      console.error('Mutation failed:', error);
    },
    ...options,
  });
}

