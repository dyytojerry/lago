import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { apiRequest, HTTPResponse, jsonToFormData } from '@lago/common';
import * as Types from './types';
import { IsString, IsNumber, IsBoolean, IsArray, IsObject, IsOptional, IsEnum, ValidateNested } from 'class-validator';

export type OnboardingResponse = any;

export type OnboardingCreateResponse = any;

export class OnboardingDetailPathParams {
  @IsString()
  id: string;

}

export type OnboardingDetailResponse = any;

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

