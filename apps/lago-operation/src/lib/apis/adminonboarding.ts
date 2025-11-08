'use client';

import { useQuery, useMutation, UseMutationOptions, UseQueryOptions, useQueryClient } from '@tanstack/react-query';
import { apiRequest, HTTPResponse } from '@lago/common';
import * as Types from './types';
import { IsString, IsOptional, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class AdminOnboardingQueryParams {
  @IsString()
  @IsOptional()
  page?: string;

  @IsString()
  @IsOptional()
  limit?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  search?: string;
}

export class AdminOnboardingListResponse {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Types.OnboardingApplication)
  applications!: Types.OnboardingApplication[];

  @ValidateNested()
  pagination!: Types.Pagination;
}

export async function adminOnboardingList(
  queryParams?: AdminOnboardingQueryParams,
  noAuthorize?: boolean
): Promise<HTTPResponse<AdminOnboardingListResponse>> {
  return await apiRequest('/api/admin/onboarding', {
    method: 'GET',
    params: queryParams,
    noAuthorize,
  });
}

export async function adminOnboardingDetail(
  pathParams: { id: string },
  noAuthorize?: boolean
): Promise<HTTPResponse<{ application: Types.OnboardingApplication }>> {
  return await apiRequest(`/api/admin/onboarding/${pathParams.id}`, {
    method: 'GET',
    noAuthorize,
  });
}

export async function adminOnboardingApprove(
  pathParams: { id: string },
  noAuthorize?: boolean
): Promise<HTTPResponse<{ application: Types.OnboardingApplication }>> {
  return await apiRequest(`/api/admin/onboarding/${pathParams.id}/approve`, {
    method: 'POST',
    noAuthorize,
  });
}

export async function adminOnboardingReject(
  pathParams: { id: string },
  body: { reason: string },
  noAuthorize?: boolean
): Promise<HTTPResponse<{ application: Types.OnboardingApplication }>> {
  return await apiRequest(`/api/admin/onboarding/${pathParams.id}/reject`, {
    method: 'POST',
    body: JSON.stringify(body),
    noAuthorize,
  });
}

export function useAdminOnboardingList(
  queryParams?: AdminOnboardingQueryParams,
  options?: UseQueryOptions<HTTPResponse<AdminOnboardingListResponse>, Error>
) {
  return useQuery({
    queryKey: ['admin', 'onboarding', queryParams],
    queryFn: () => adminOnboardingList(queryParams),
    ...options,
  });
}

export function useAdminOnboardingDetail(
  pathParams: { id: string },
  options?: UseQueryOptions<HTTPResponse<{ application: Types.OnboardingApplication }>, Error>
) {
  return useQuery({
    queryKey: ['admin', 'onboarding', pathParams.id],
    queryFn: () => adminOnboardingDetail(pathParams),
    ...options,
  });
}

export function useAdminOnboardingApprove(
  pathParams: { id: string },
  options?: UseMutationOptions<HTTPResponse<{ application: Types.OnboardingApplication }>, Error, null>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => adminOnboardingApprove(pathParams),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'onboarding'] });
    },
    ...options,
  });
}

export function useAdminOnboardingReject(
  pathParams: { id: string },
  options?: UseMutationOptions<HTTPResponse<{ application: Types.OnboardingApplication }>, Error, { reason: string }>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body) => adminOnboardingReject(pathParams, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'onboarding'] });
    },
    ...options,
  });
}

