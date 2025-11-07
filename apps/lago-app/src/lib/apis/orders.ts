import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { apiRequest, HTTPResponse, jsonToFormData } from '@lago/common';
import * as Types from './types';
import { IsString, IsNumber, IsBoolean, IsArray, IsObject, IsOptional, IsEnum, ValidateNested } from 'class-validator';

export class OrdersQueryParams {
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

  @IsEnum(['buyer', 'seller'])
  @IsOptional()
  role?: 'buyer' | 'seller';

}

export class OrdersResponse {
  @IsArray()
  orders: Types.Order[];

  @ValidateNested()
  pagination: Types.Pagination;

}
export class OrderCreateDTO {
  @IsString()
  productId: string;

  @IsEnum(Types.OrderType)
  type: Types.OrderType;

  @IsString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  endDate?: string;

  @IsEnum(Types.OrderDeliveryType)
  @IsOptional()
  deliveryType?: Types.OrderDeliveryType;

  @IsString()
  @IsOptional()
  deliveryAddress?: string;

  @IsString()
  @IsOptional()
  remark?: string;

}
export class OrderCreateResponse {
  @IsString()
  order: any;

}
export class OrderDetailPathParams {
  @IsString()
  id: string;

}

export class OrderDetailResponse {
  @IsString()
  order: any;

}
export class OrderStatuPathParams {
  @IsString()
  id: string;

}

export class OrderStatuDTO {
  @IsEnum(['paid', 'confirmed', 'completed', 'cancelled'])
  @IsOptional()
  status?: 'paid' | 'confirmed' | 'completed' | 'cancelled';

}
export class OrderStatuResponse {
  @IsString()
  message: string;

}
export class OrderCancelPathParams {
  @IsString()
  id: string;

}

export class OrderCancelResponse {
  @IsString()
  message: string;

}
/**
 * 获取订单列表（小程序端）
 */
export async function orders(
  queryParams?: OrdersQueryParams,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest("/api/orders", {
    method: 'GET',
    noAuthorize: noAuthorize,
    params: queryParams,
  });
}

/**
 * 创建订单
 */
export async function orderCreate(
  data: OrderCreateDTO,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest("/api/orders", {
    method: 'POST',
    body: JSON.stringify(data),
    noAuthorize: noAuthorize,
  });
}

/**
 * 获取订单详情
 */
export async function orderDetail(
  pathParams: OrderDetailPathParams,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest(`/api/orders/${pathParams.id}`, {
    method: 'GET',
    noAuthorize: noAuthorize,
  });
}

/**
 * 更新订单状态
 */
export async function orderStatu(
  pathParams: OrderStatuPathParams,
  data: OrderStatuDTO,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest(`/api/orders/${pathParams.id}/status`, {
    method: 'PUT',
    body: JSON.stringify(data),
    noAuthorize: noAuthorize,
  });
}

/**
 * 取消订单
 */
export async function orderCancel(
  pathParams: OrderCancelPathParams,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest(`/api/orders/${pathParams.id}/cancel`, {
    method: 'POST',
    noAuthorize: noAuthorize,
  });
}

/**
 * 获取订单列表（小程序端） Hook
 */
export function useOrders(
  queryParams?: OrdersQueryParams,
  options?: UseQueryOptions<HTTPResponse<OrdersResponse>, Error>
) {
  return useQuery({
    queryKey: ['orders', '获取订单列表（小程序端）', queryParams?.page, queryParams?.limit, queryParams?.status, queryParams?.type, queryParams?.role],
    queryFn: () => orders(queryParams),
    ...options,
  });
}

/**
 * 创建订单 Hook
 */
export function useOrderCreate(
  options?: UseMutationOptions<HTTPResponse<OrderCreateResponse>, Error, OrderCreateDTO>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => orderCreate(data),
    onSuccess: () => {
      // 清除相关缓存
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['app'] });
    },
    onError: (error: any) => {
      console.error('Mutation failed:', error);
    },
    ...options,
  });
}

/**
 * 获取订单详情 Hook
 */
export function useOrderDetail(
  pathParams: OrderDetailPathParams,
  options?: UseQueryOptions<HTTPResponse<OrderDetailResponse>, Error>
) {
  return useQuery({
    queryKey: ['orders', '获取订单详情', pathParams.id],
    queryFn: () => orderDetail(pathParams),
    ...options,
  });
}

/**
 * 更新订单状态 Hook
 */
export function useOrderStatu(
  pathParams: OrderStatuPathParams,
  options?: UseMutationOptions<HTTPResponse<OrderStatuResponse>, Error, OrderStatuDTO>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => orderStatu(pathParams, data),
    onSuccess: () => {
      // 清除相关缓存
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['app'] });
    },
    onError: (error: any) => {
      console.error('Mutation failed:', error);
    },
    ...options,
  });
}

/**
 * 取消订单 Hook
 */
export function useOrderCancel(
  pathParams: OrderCancelPathParams,
  options?: UseMutationOptions<HTTPResponse<OrderCancelResponse>, Error, null>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => orderCancel(pathParams),
    onSuccess: () => {
      // 清除相关缓存
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['app'] });
    },
    onError: (error: any) => {
      console.error('Mutation failed:', error);
    },
    ...options,
  });
}

