import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { apiRequest, HTTPResponse, jsonToFormData } from '@lago/common';
import * as Types from './types';
import { IsString, IsNumber, IsBoolean, IsArray, IsObject, IsOptional, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class GetApiAdminOrdersQueryParams {
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
  type?: string;

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

export class GetApiAdminOrders1PathParams {
  @IsString()
  id!: string;

}

export class PutApiAdminOrdersStatusPathParams {
  @IsString()
  id!: string;

}

/**
 * 获取订单列表
 */
export async function getApiAdminOrders(
  queryParams?: GetApiAdminOrdersQueryParams,
  noAuthorize?: boolean
): Promise<HTTPResponse<Types.OrderListResponse>> {
  return await apiRequest("/api/admin/orders", {
    method: 'GET',
    params: queryParams,
    noAuthorize,
  });
}

/**
 * 获取订单详情
 */
export async function getApiAdminOrders1(
  pathParams: GetApiAdminOrders1PathParams,
  noAuthorize?: boolean
): Promise<HTTPResponse<Types.OrderDetailResponse>> {
  return await apiRequest(`/api/admin/orders/${pathParams.id}`, {
    method: 'GET',
    noAuthorize,
  });
}

/**
 * 更新订单状态
 */
export async function putApiAdminOrdersStatus(
  pathParams: PutApiAdminOrdersStatusPathParams,
  data: Types.OrderStatusUpdateRequest,
  noAuthorize?: boolean
): Promise<HTTPResponse<Types.SuccessResponse>> {
  return await apiRequest(`/api/admin/orders/${pathParams.id}/status`, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
    noAuthorize,
  });
}

/**
 * 获取订单列表 - Query Hook
 */
export function useGetApiAdminOrders(
  vars: any,
  options?: UseQueryOptions<HTTPResponse<Types.OrderListResponse>, Error>
) {
  return useQuery({
    queryKey: ['getApiAdminOrders', vars],
    queryFn: () => getApiAdminOrders(...vars),
    ...options,
  });
}

/**
 * 获取订单详情 - Query Hook
 */
export function useGetApiAdminOrders1(
  vars: any,
  options?: UseQueryOptions<HTTPResponse<Types.OrderDetailResponse>, Error>
) {
  return useQuery({
    queryKey: ['getApiAdminOrders1', vars],
    queryFn: () => getApiAdminOrders1(...vars),
    ...options,
  });
}

/**
 * 更新订单状态 - Mutation Hook
 */
export function usePutApiAdminOrdersStatus(
  options?: UseMutationOptions<HTTPResponse<Types.SuccessResponse>, Error, any>
) {
  return useMutation({
    mutationFn: (vars: any) => putApiAdminOrdersStatus(...vars),
    ...options,
  });
}

