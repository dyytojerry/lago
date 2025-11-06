import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { apiRequest, HTTPResponse, jsonToFormData } from '@lago/common';
import * as Types from './types';
import { IsString, IsNumber, IsBoolean, IsArray, IsObject, IsOptional, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class GetApiAdminDashboardTrendsQueryParams {
  @IsEnum(String)
  @IsOptional()
  period?: string;

}

/**
 * 获取仪表盘核心指标
 */
export async function getApiAdminDashboardStats(
  noAuthorize?: boolean
): Promise<HTTPResponse<Types.DashboardStats>> {
  return await apiRequest("/api/admin/dashboard/stats", {
    method: 'GET',
    noAuthorize,
  });
}

/**
 * 获取趋势数据
 */
export async function getApiAdminDashboardTrends(
  queryParams?: GetApiAdminDashboardTrendsQueryParams,
  noAuthorize?: boolean
): Promise<HTTPResponse<Types.DashboardTrends>> {
  return await apiRequest("/api/admin/dashboard/trends", {
    method: 'GET',
    params: queryParams,
    noAuthorize,
  });
}

/**
 * 获取待处理事项
 */
export async function getApiAdminDashboardPending(
  noAuthorize?: boolean
): Promise<HTTPResponse<Types.PendingItems>> {
  return await apiRequest("/api/admin/dashboard/pending", {
    method: 'GET',
    noAuthorize,
  });
}

/**
 * 获取仪表盘核心指标 - Query Hook
 */
export function useGetApiAdminDashboardStats(
  vars: any,
  options?: UseQueryOptions<HTTPResponse<Types.DashboardStats>, Error>
) {
  return useQuery({
    queryKey: ['getApiAdminDashboardStats', vars],
    queryFn: () => getApiAdminDashboardStats(...vars),
    ...options,
  });
}

/**
 * 获取趋势数据 - Query Hook
 */
export function useGetApiAdminDashboardTrends(
  vars: any,
  options?: UseQueryOptions<HTTPResponse<Types.DashboardTrends>, Error>
) {
  return useQuery({
    queryKey: ['getApiAdminDashboardTrends', vars],
    queryFn: () => getApiAdminDashboardTrends(...vars),
    ...options,
  });
}

/**
 * 获取待处理事项 - Query Hook
 */
export function useGetApiAdminDashboardPending(
  vars: any,
  options?: UseQueryOptions<HTTPResponse<Types.PendingItems>, Error>
) {
  return useQuery({
    queryKey: ['getApiAdminDashboardPending', vars],
    queryFn: () => getApiAdminDashboardPending(...vars),
    ...options,
  });
}

