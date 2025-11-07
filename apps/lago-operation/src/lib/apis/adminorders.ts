import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { apiRequest, HTTPResponse, jsonToFormData } from '@lago/common';
import * as Types from './types';
import { IsString, IsNumber, IsBoolean, IsArray, IsObject, IsOptional, IsEnum, ValidateNested } from 'class-validator';

export class AdminOrdersQueryParams {
  @IsString()
  @IsOptional()
  page?: string;

  @IsString()
  @IsOptional()
  limit?: string;

  @IsEnum(Types.OrderStatus)
  @IsOptional()
  status?: Types.OrderStatus;

  @IsEnum(Types.OrderType)
  @IsOptional()
  type?: Types.OrderType;

  @IsString()
  @IsOptional()
  buyerId?: string;

  @IsString()
  @IsOptional()
  sellerId?: string;

  @IsString()
  @IsOptional()
  search?: string;

}

export class AdminOrderDetailPathParams {
  @IsString()
  id: string;

}

export class AdminOrdersStatuPathParams {
  @IsString()
  id: string;

}

export type AdminOrdersStatuResponse = Types.SuccessResponse;

/**
 * 获取订单列表
 */
export async function adminOrders(
  queryParams?: AdminOrdersQueryParams,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest("/api/admin/orders", {
    method: 'GET',
    noAuthorize: noAuthorize,
    params: queryParams,
  });
}

/**
 * 获取订单详情
 */
export async function adminOrderDetail(
  pathParams: AdminOrderDetailPathParams,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest(`/api/admin/orders/${pathParams.id}`, {
    method: 'GET',
    noAuthorize: noAuthorize,
  });
}

/**
 * 更新订单状态
 */
export async function adminOrdersStatu(
  pathParams: AdminOrdersStatuPathParams,
  data: Types.OrderStatusUpdateRequest,
  noAuthorize?: boolean
): Promise<HTTPResponse<AdminOrdersStatuResponse>> {
  return await apiRequest(`/api/admin/orders/${pathParams.id}/status`, {
    method: 'PUT',
    body: JSON.stringify(data),
    noAuthorize: noAuthorize,
  });
}

/**
 * 获取订单列表 Hook
 */
export function useAdminOrders(
  queryParams?: AdminOrdersQueryParams,
  options?: UseQueryOptions<HTTPResponse<AdminOrdersResponse>, Error>
) {
  return useQuery({
    queryKey: ['adminorders', '获取订单列表', queryParams?.page, queryParams?.limit, queryParams?.status, queryParams?.type, queryParams?.buyerId, queryParams?.sellerId, queryParams?.search],
    queryFn: () => adminOrders(queryParams),
    ...options,
  });
}

/**
 * 获取订单详情 Hook
 */
export function useAdminOrderDetail(
  pathParams: AdminOrderDetailPathParams,
  options?: UseQueryOptions<HTTPResponse<AdminOrderDetailResponse>, Error>
) {
  return useQuery({
    queryKey: ['adminorders', '获取订单详情', pathParams.id],
    queryFn: () => adminOrderDetail(pathParams),
    ...options,
  });
}

/**
 * 更新订单状态 Hook
 */
export function useAdminOrdersStatu(
  pathParams: AdminOrdersStatuPathParams,
  options?: UseMutationOptions<HTTPResponse<AdminOrdersStatuResponse>, Error, Types.OrderStatusUpdateRequest>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => adminOrdersStatu(pathParams, data),
    onSuccess: () => {
      // 清除相关缓存
      queryClient.invalidateQueries({ queryKey: ['adminorders'] });
      queryClient.invalidateQueries({ queryKey: ['operation'] });
    },
    onError: (error: any) => {
      console.error('Mutation failed:', error);
    },
    ...options,
  });
}

