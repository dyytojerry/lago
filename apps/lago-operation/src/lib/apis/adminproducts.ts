import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { apiRequest, HTTPResponse, jsonToFormData } from '@lago/common';
import * as Types from './types';
import { IsString, IsNumber, IsBoolean, IsArray, IsObject, IsOptional, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class GetApiAdminProductsQueryParams {
  @IsString()
  @IsOptional()
  page?: string;

  @IsString()
  @IsOptional()
  limit?: string;

  @IsEnum(String)
  @IsOptional()
  status?: string;

  @IsEnum(String)
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  ownerId?: string;

}

export class GetApiAdminProducts1PathParams {
  @IsString()
  id!: string;

}

export class PostApiAdminProductsApprovePathParams {
  @IsString()
  id!: string;

}

/**
 * 获取商品列表
 */
export async function getApiAdminProducts(
  queryParams?: GetApiAdminProductsQueryParams,
  noAuthorize?: boolean
): Promise<HTTPResponse<Types.ProductListResponse>> {
  return await apiRequest("/api/admin/products", {
    method: 'GET',
    params: queryParams,
    noAuthorize,
  });
}

/**
 * 获取商品详情
 */
export async function getApiAdminProducts1(
  pathParams: GetApiAdminProducts1PathParams,
  noAuthorize?: boolean
): Promise<HTTPResponse<Types.ProductDetailResponse>> {
  return await apiRequest(`/api/admin/products/${pathParams.id}`, {
    method: 'GET',
    noAuthorize,
  });
}

/**
 * 审核商品
 */
export async function postApiAdminProductsApprove(
  pathParams: PostApiAdminProductsApprovePathParams,
  data: Types.ProductApproveRequest,
  noAuthorize?: boolean
): Promise<HTTPResponse<Types.SuccessResponse>> {
  return await apiRequest(`/api/admin/products/${pathParams.id}/approve`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
    noAuthorize,
  });
}

/**
 * 批量审核商品
 */
export async function postApiAdminProductsBatch-approve(
  data: Types.ProductBatchApproveRequest,
  noAuthorize?: boolean
): Promise<HTTPResponse<Types.SuccessResponse>> {
  return await apiRequest("/api/admin/products/batch-approve", {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
    noAuthorize,
  });
}

/**
 * 获取商品列表 - Query Hook
 */
export function useGetApiAdminProducts(
  vars: any,
  options?: UseQueryOptions<HTTPResponse<Types.ProductListResponse>, Error>
) {
  return useQuery({
    queryKey: ['getApiAdminProducts', vars],
    queryFn: () => getApiAdminProducts(...vars),
    ...options,
  });
}

/**
 * 获取商品详情 - Query Hook
 */
export function useGetApiAdminProducts1(
  vars: any,
  options?: UseQueryOptions<HTTPResponse<Types.ProductDetailResponse>, Error>
) {
  return useQuery({
    queryKey: ['getApiAdminProducts1', vars],
    queryFn: () => getApiAdminProducts1(...vars),
    ...options,
  });
}

/**
 * 审核商品 - Mutation Hook
 */
export function usePostApiAdminProductsApprove(
  options?: UseMutationOptions<HTTPResponse<Types.SuccessResponse>, Error, any>
) {
  return useMutation({
    mutationFn: (vars: any) => postApiAdminProductsApprove(...vars),
    ...options,
  });
}

/**
 * 批量审核商品 - Mutation Hook
 */
export function usePostApiAdminProductsBatch-approve(
  options?: UseMutationOptions<HTTPResponse<Types.SuccessResponse>, Error, any>
) {
  return useMutation({
    mutationFn: (vars: any) => postApiAdminProductsBatch-approve(...vars),
    ...options,
  });
}

