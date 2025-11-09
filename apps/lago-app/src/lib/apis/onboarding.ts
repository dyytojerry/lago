import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { apiRequest, HTTPResponse, jsonToFormData } from '@lago/common';
import * as Types from './types';
import { IsString, IsNumber, IsBoolean, IsArray, IsObject, IsOptional, IsEnum, ValidateNested } from 'class-validator';

export class AdminOnboardingQueryParams {
  @IsNumber()
  @IsOptional()
  page?: number;

  @IsNumber()
  @IsOptional()
  limit?: number;

  @IsEnum(Types.OnboardingApplicationType)
  @IsOptional()
  type?: Types.OnboardingApplicationType;

  @IsEnum(Types.OnboardingApplicationStatus)
  @IsOptional()
  status?: Types.OnboardingApplicationStatus;

  @IsString()
  @IsOptional()
  search?: string;

}

export type AdminOnboardingResponse = any;

export class AdminOnboardingDetailPathParams {
  @IsString()
  id: string;

}

export type AdminOnboardingDetailResponse = any;

export class AdminOnboardingApprovePathParams {
  @IsString()
  id: string;

}

export class AdminOnboardingRejectPathParams {
  @IsString()
  id: string;

}

export type OnboardingResponse = any;

export type OnboardingCreateResponse = any;

export class OnboardingDetailPathParams {
  @IsString()
  id: string;

}

export type OnboardingDetailResponse = any;

/**
 * 获取入驻申请列表
 */
export async function adminOnboarding(
  queryParams?: AdminOnboardingQueryParams,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest("/api/admin/onboarding", {
    method: 'GET',
    noAuthorize: noAuthorize,
    params: queryParams,
  });
}

/**
 * 获取入驻申请详情
 */
export async function adminOnboardingDetail(
  pathParams: AdminOnboardingDetailPathParams,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest(`/api/admin/onboarding/${pathParams.id}`, {
    method: 'GET',
    noAuthorize: noAuthorize,
  });
}

/**
 * 通过入驻申请
 */
export async function adminOnboardingApprove(
  pathParams: AdminOnboardingApprovePathParams,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest(`/api/admin/onboarding/${pathParams.id}/approve`, {
    method: 'POST',
    noAuthorize: noAuthorize,
  });
}

/**
 * 拒绝入驻申请
 */
export async function adminOnboardingReject(
  pathParams: AdminOnboardingRejectPathParams,
  data: Types.OnboardingReviewRequest,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest(`/api/admin/onboarding/${pathParams.id}/reject`, {
    method: 'POST',
    body: JSON.stringify(data),
    noAuthorize: noAuthorize,
  });
}

/**
 * 获取当前用户的入驻申请
 */
export async function onboarding(
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest("/api/onboarding", {
    method: 'GET',
    noAuthorize: noAuthorize,
  });
}

/**
 * 提交入驻申请
 */
export async function onboardingCreate(
  data: Types.OnboardingApplicationCreateRequest,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest("/api/onboarding", {
    method: 'POST',
    body: JSON.stringify(data),
    noAuthorize: noAuthorize,
  });
}

/**
 * 获取入驻申请详情
 */
export async function onboardingDetail(
  pathParams: OnboardingDetailPathParams,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest(`/api/onboarding/${pathParams.id}`, {
    method: 'GET',
    noAuthorize: noAuthorize,
  });
}

/**
 * 获取入驻申请列表 Hook
 */
export function useAdminOnboarding(
  queryParams?: AdminOnboardingQueryParams,
  options?: UseQueryOptions<HTTPResponse<AdminOnboardingResponse>, Error>
) {
  return useQuery({
    queryKey: ['onboarding', '获取入驻申请列表', queryParams?.page, queryParams?.limit, queryParams?.type, queryParams?.status, queryParams?.search],
    queryFn: () => adminOnboarding(queryParams),
    ...options,
  });
}

/**
 * 获取入驻申请详情 Hook
 */
export function useAdminOnboardingDetail(
  pathParams: AdminOnboardingDetailPathParams,
  options?: UseQueryOptions<HTTPResponse<AdminOnboardingDetailResponse>, Error>
) {
  return useQuery({
    queryKey: ['onboarding', '获取入驻申请详情', pathParams.id],
    queryFn: () => adminOnboardingDetail(pathParams),
    ...options,
  });
}

/**
 * 通过入驻申请 Hook
 */
export function useAdminOnboardingApprove(
  pathParams: AdminOnboardingApprovePathParams,
  options?: UseMutationOptions<HTTPResponse<AdminOnboardingApproveResponse>, Error, null>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => adminOnboardingApprove(pathParams),
    onSuccess: () => {
      // 清除相关缓存
      queryClient.invalidateQueries({ queryKey: ['onboarding'] });
      queryClient.invalidateQueries({ queryKey: ['operation'] });
    },
    onError: (error: any) => {
      console.error('Mutation failed:', error);
    },
    ...options,
  });
}

/**
 * 拒绝入驻申请 Hook
 */
export function useAdminOnboardingReject(
  pathParams: AdminOnboardingRejectPathParams,
  options?: UseMutationOptions<HTTPResponse<AdminOnboardingRejectResponse>, Error, Types.OnboardingReviewRequest>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => adminOnboardingReject(pathParams, data),
    onSuccess: () => {
      // 清除相关缓存
      queryClient.invalidateQueries({ queryKey: ['onboarding'] });
      queryClient.invalidateQueries({ queryKey: ['operation'] });
    },
    onError: (error: any) => {
      console.error('Mutation failed:', error);
    },
    ...options,
  });
}

/**
 * 获取当前用户的入驻申请 Hook
 */
export function useOnboarding(
  options?: UseQueryOptions<HTTPResponse<OnboardingResponse>, Error>
) {
  return useQuery({
    queryKey: ['onboarding', '获取当前用户的入驻申请'],
    queryFn: () => onboarding(),
    ...options,
  });
}

/**
 * 提交入驻申请 Hook
 */
export function useOnboardingCreate(
  options?: UseMutationOptions<HTTPResponse<OnboardingCreateResponse>, Error, Types.OnboardingApplicationCreateRequest>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => onboardingCreate(data),
    onSuccess: () => {
      // 清除相关缓存
      queryClient.invalidateQueries({ queryKey: ['onboarding'] });
      queryClient.invalidateQueries({ queryKey: ['app'] });
    },
    onError: (error: any) => {
      console.error('Mutation failed:', error);
    },
    ...options,
  });
}

/**
 * 获取入驻申请详情 Hook
 */
export function useOnboardingDetail(
  pathParams: OnboardingDetailPathParams,
  options?: UseQueryOptions<HTTPResponse<OnboardingDetailResponse>, Error>
) {
  return useQuery({
    queryKey: ['onboarding', '获取入驻申请详情', pathParams.id],
    queryFn: () => onboardingDetail(pathParams),
    ...options,
  });
}

