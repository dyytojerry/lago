import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { apiRequest, HTTPResponse, jsonToFormData } from '@lago/common';
import * as Types from './types';
import { IsString, IsNumber, IsBoolean, IsArray, IsObject, IsOptional, IsEnum, ValidateNested } from 'class-validator';

export class AdminCommunitiesQueryParams {
  @IsString()
  @IsOptional()
  page?: string;

  @IsString()
  @IsOptional()
  limit?: string;

  @IsString()
  @IsOptional()
  search?: string;

  @IsEnum(Types.CommunityVerificationStatus)
  @IsOptional()
  verificationStatus?: Types.CommunityVerificationStatus;

}

export class AdminCommunitiesResponse {
  @IsArray()
  communities: Types.Community[];

  @ValidateNested()
  pagination: Types.Pagination;

}
export class AdminCommunitiesVerificationsQueryParams {
  @IsString()
  @IsOptional()
  page?: string;

  @IsString()
  @IsOptional()
  limit?: string;

  @IsEnum(Types.CommunityVerificationStatus)
  @IsOptional()
  status?: Types.CommunityVerificationStatus;

}

export class AdminCommunitiesVerificationsResponse {
  @IsArray()
  verifications: any[];

  @ValidateNested()
  pagination: Types.Pagination;

}
export class AdminCommunitieDetailPathParams {
  @IsString()
  id: string;

}

export class AdminCommunitieDetailResponse {
  @ValidateNested()
  community: Types.Community;

}
export class AdminCommunitiesApprovePathParams {
  @IsString()
  id: string;

}

export class AdminCommunitiesApproveResponse {
  @IsString()
  message: string;

}
export class AdminCommunitiesRejectPathParams {
  @IsString()
  id: string;

}

export class AdminCommunitiesRejectDTO {
  @IsString()
  @IsOptional()
  reason?: string;

}
export class AdminCommunitiesRejectResponse {
  @IsString()
  message: string;

}
/**
 * 获取小区列表
 */
export async function adminCommunities(
  queryParams?: AdminCommunitiesQueryParams,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest("/api/admin/communities", {
    method: 'GET',
    noAuthorize: noAuthorize,
    params: queryParams,
  });
}

/**
 * 获取小区认证申请列表
 */
export async function adminCommunitiesVerifications(
  queryParams?: AdminCommunitiesVerificationsQueryParams,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest("/api/admin/communities/verifications", {
    method: 'GET',
    noAuthorize: noAuthorize,
    params: queryParams,
  });
}

/**
 * 获取小区详情
 */
export async function adminCommunitieDetail(
  pathParams: AdminCommunitieDetailPathParams,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest(`/api/admin/communities/${pathParams.id}`, {
    method: 'GET',
    noAuthorize: noAuthorize,
  });
}

/**
 * 审批小区认证（通过）
 */
export async function adminCommunitiesApprove(
  pathParams: AdminCommunitiesApprovePathParams,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest(`/api/admin/communities/${pathParams.id}/approve`, {
    method: 'POST',
    noAuthorize: noAuthorize,
  });
}

/**
 * 审批小区认证（拒绝）
 */
export async function adminCommunitiesReject(
  pathParams: AdminCommunitiesRejectPathParams,
  data: AdminCommunitiesRejectDTO,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest(`/api/admin/communities/${pathParams.id}/reject`, {
    method: 'POST',
    body: JSON.stringify(data),
    noAuthorize: noAuthorize,
  });
}

/**
 * 获取小区列表 Hook
 */
export function useAdminCommunities(
  queryParams?: AdminCommunitiesQueryParams,
  options?: UseQueryOptions<HTTPResponse<AdminCommunitiesResponse>, Error>
) {
  return useQuery({
    queryKey: ['admincommunities', '获取小区列表', queryParams?.page, queryParams?.limit, queryParams?.search, queryParams?.verificationStatus],
    queryFn: () => adminCommunities(queryParams),
    ...options,
  });
}

/**
 * 获取小区认证申请列表 Hook
 */
export function useAdminCommunitiesVerifications(
  queryParams?: AdminCommunitiesVerificationsQueryParams,
  options?: UseQueryOptions<HTTPResponse<AdminCommunitiesVerificationsResponse>, Error>
) {
  return useQuery({
    queryKey: ['admincommunities', '获取小区认证申请列表', queryParams?.page, queryParams?.limit, queryParams?.status],
    queryFn: () => adminCommunitiesVerifications(queryParams),
    ...options,
  });
}

/**
 * 获取小区详情 Hook
 */
export function useAdminCommunitieDetail(
  pathParams: AdminCommunitieDetailPathParams,
  options?: UseQueryOptions<HTTPResponse<AdminCommunitieDetailResponse>, Error>
) {
  return useQuery({
    queryKey: ['admincommunities', '获取小区详情', pathParams.id],
    queryFn: () => adminCommunitieDetail(pathParams),
    ...options,
  });
}

/**
 * 审批小区认证（通过） Hook
 */
export function useAdminCommunitiesApprove(
  pathParams: AdminCommunitiesApprovePathParams,
  options?: UseMutationOptions<HTTPResponse<AdminCommunitiesApproveResponse>, Error, null>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => adminCommunitiesApprove(pathParams),
    onSuccess: () => {
      // 清除相关缓存
      queryClient.invalidateQueries({ queryKey: ['admincommunities'] });
      queryClient.invalidateQueries({ queryKey: ['operation'] });
    },
    onError: (error: any) => {
      console.error('Mutation failed:', error);
    },
    ...options,
  });
}

/**
 * 审批小区认证（拒绝） Hook
 */
export function useAdminCommunitiesReject(
  pathParams: AdminCommunitiesRejectPathParams,
  options?: UseMutationOptions<HTTPResponse<AdminCommunitiesRejectResponse>, Error, AdminCommunitiesRejectDTO>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => adminCommunitiesReject(pathParams, data),
    onSuccess: () => {
      // 清除相关缓存
      queryClient.invalidateQueries({ queryKey: ['admincommunities'] });
      queryClient.invalidateQueries({ queryKey: ['operation'] });
    },
    onError: (error: any) => {
      console.error('Mutation failed:', error);
    },
    ...options,
  });
}

