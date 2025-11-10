import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { apiRequest, HTTPResponse, jsonToFormData } from '@lago/common';
import * as Types from './types';
import { IsString, IsNumber, IsBoolean, IsArray, IsObject, IsOptional, IsEnum, ValidateNested } from 'class-validator';

export class AdminMallConsignmentsQueryParams {
  @IsNumber()
  @IsOptional()
  page?: number;

  @IsNumber()
  @IsOptional()
  limit?: number;

  @IsEnum(['submitted', 'received', 'refurbishing', 'listed', 'sold', 'settled', 'cancelled'])
  @IsOptional()
  status?: 'submitted' | 'received' | 'refurbishing' | 'listed' | 'sold' | 'settled' | 'cancelled';

  @IsString()
  @IsOptional()
  search?: string;

}

export class AdminMallConsignmentsResponse {
  @IsArray()
  orders: any[];

  @ValidateNested()
  pagination: Types.Pagination;

}
export class AdminMallConsignmentPathParams {
  @IsString()
  id: string;

}

export class AdminMallConsignmentDTO {
  @IsEnum(['submitted', 'received', 'refurbishing', 'listed', 'sold', 'settled', 'cancelled'])
  @IsOptional()
  status?: 'submitted' | 'received' | 'refurbishing' | 'listed' | 'sold' | 'settled' | 'cancelled';

  @IsString()
  @IsOptional()
  assignedStaffId?: string;

  @IsString()
  @IsOptional()
  mallProductId?: string;

}
export class AdminMallConsignmentResponse {
  @IsObject()
  order: any;

}
/**
 * 获取寄售订单列表
 */
export async function adminMallConsignments(
  queryParams?: AdminMallConsignmentsQueryParams,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest("/api/admin/mall/consignments", {
    method: 'GET',
    noAuthorize: noAuthorize,
    params: queryParams,
  });
}

/**
 * 更新寄售订单信息
 */
export async function adminMallConsignment(
  pathParams: AdminMallConsignmentPathParams,
  data: AdminMallConsignmentDTO,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest(`/api/admin/mall/consignments/${pathParams.id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    noAuthorize: noAuthorize,
  });
}

/**
 * 获取寄售订单列表 Hook
 */
export function useAdminMallConsignments(
  queryParams?: AdminMallConsignmentsQueryParams,
  options?: UseQueryOptions<HTTPResponse<AdminMallConsignmentsResponse>, Error>
) {
  return useQuery({
    queryKey: ['mallconsignments', '获取寄售订单列表', queryParams?.page, queryParams?.limit, queryParams?.status, queryParams?.search],
    queryFn: () => adminMallConsignments(queryParams),
    ...options,
  });
}

/**
 * 更新寄售订单信息 Hook
 */
export function useAdminMallConsignment(
  pathParams: AdminMallConsignmentPathParams,
  options?: UseMutationOptions<HTTPResponse<AdminMallConsignmentResponse>, Error, AdminMallConsignmentDTO>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => adminMallConsignment(pathParams, data),
    onSuccess: () => {
      // 清除相关缓存
      queryClient.invalidateQueries({ queryKey: ['mallconsignments'] });
      queryClient.invalidateQueries({ queryKey: ['operation'] });
    },
    onError: (error: any) => {
      console.error('Mutation failed:', error);
    },
    ...options,
  });
}

