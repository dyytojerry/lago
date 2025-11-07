import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { apiRequest, HTTPResponse, jsonToFormData } from '@lago/common';
import * as Types from './types';
import { IsString, IsNumber, IsBoolean, IsArray, IsObject, IsOptional, IsEnum, ValidateNested } from 'class-validator';

export class AdminDashboardTrendsQueryParams {
  @IsEnum(['7d', '30d', '90d'])
  @IsOptional()
  period?: '7d' | '30d' | '90d';

}

/**
 * 获取仪表盘核心指标
 */
export async function adminDashboardStats(
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest("/api/admin/dashboard/stats", {
    method: 'GET',
    noAuthorize: noAuthorize,
  });
}

/**
 * 获取趋势数据
 */
export async function adminDashboardTrends(
  queryParams?: AdminDashboardTrendsQueryParams,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest("/api/admin/dashboard/trends", {
    method: 'GET',
    noAuthorize: noAuthorize,
    params: queryParams,
  });
}

/**
 * 获取待处理事项
 */
export async function adminDashboardPending(
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest("/api/admin/dashboard/pending", {
    method: 'GET',
    noAuthorize: noAuthorize,
  });
}

/**
 * 获取仪表盘核心指标 Hook
 */
export function useAdminDashboardStats(
  options?: UseQueryOptions<HTTPResponse<AdminDashboardStatsResponse>, Error>
) {
  return useQuery({
    queryKey: ['admindashboard', '获取仪表盘核心指标'],
    queryFn: () => adminDashboardStats(),
    ...options,
  });
}

/**
 * 获取趋势数据 Hook
 */
export function useAdminDashboardTrends(
  queryParams?: AdminDashboardTrendsQueryParams,
  options?: UseQueryOptions<HTTPResponse<AdminDashboardTrendsResponse>, Error>
) {
  return useQuery({
    queryKey: ['admindashboard', '获取趋势数据', queryParams?.period],
    queryFn: () => adminDashboardTrends(queryParams),
    ...options,
  });
}

/**
 * 获取待处理事项 Hook
 */
export function useAdminDashboardPending(
  options?: UseQueryOptions<HTTPResponse<AdminDashboardPendingResponse>, Error>
) {
  return useQuery({
    queryKey: ['admindashboard', '获取待处理事项'],
    queryFn: () => adminDashboardPending(),
    ...options,
  });
}

