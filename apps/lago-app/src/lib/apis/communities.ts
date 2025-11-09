import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { apiRequest, HTTPResponse, jsonToFormData } from '@lago/common';
import * as Types from './types';
import { IsString, IsNumber, IsBoolean, IsArray, IsObject, IsOptional, IsEnum, ValidateNested } from 'class-validator';

export class CommunitieMyResponse {
  @IsArray()
  communities: Types.Community[];

}
export class CommunitieJoinPathParams {
  @IsString()
  id: string;

}

export type CommunitieJoinResponse = Types.SuccessResponse;

export class CommunitieLeavePathParams {
  @IsString()
  id: string;

}

export type CommunitieLeaveResponse = Types.SuccessResponse;

export class CommunitieVerifyPathParams {
  @IsString()
  id: string;

}

export class CommunitieVerifyDTO {
  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsOptional()
  contactName?: string;

  @IsString()
  @IsOptional()
  contactPhone?: string;

  @IsString()
  @IsOptional()
  licenseUrl?: string;

  @IsString()
  @IsOptional()
  proofUrl?: string;

}
export type CommunitieVerifyResponse = Types.SuccessResponse;

export class CommunitieNearbyQueryParams {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsNumber()
  @IsOptional()
  radius?: number;

}

export class CommunitieNearbyResponse {
  @IsArray()
  communities: Types.Community[];

}
export class CommunitieSearchQueryParams {
  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  provinceId?: string;

  @IsString()
  @IsOptional()
  cityId?: string;

  @IsString()
  @IsOptional()
  districtId?: string;

  @IsEnum(Types.CommunityVerificationStatus)
  @IsOptional()
  verificationStatus?: Types.CommunityVerificationStatus;

  @IsNumber()
  @IsOptional()
  page?: number;

  @IsNumber()
  @IsOptional()
  limit?: number;

}

export class CommunitieSearchResponse {
  @IsArray()
  communities: Types.Community[];

  @ValidateNested()
  pagination: Types.Pagination;

}
export class CommunitieActivitiesQueryParams {
  @IsString()
  communityIds: string;

  @IsNumber()
  @IsOptional()
  page?: number;

  @IsNumber()
  @IsOptional()
  limit?: number;

}

export class CommunitieActivitiesResponse {
  @IsArray()
  activities: any[];

  @ValidateNested()
  pagination: Types.Pagination;

}
export class CommunitieActivitiesFeedQueryParams {
  @IsNumber()
  @IsOptional()
  page?: number;

  @IsNumber()
  @IsOptional()
  limit?: number;

  @IsString()
  @IsOptional()
  communityId?: string;

}

export class CommunitieActivitiesFeedResponse {
  @IsArray()
  activities: any[];

  @ValidateNested()
  pagination: Types.Pagination;

}
export class CommunitiesPathParams {
  @IsString()
  id: string;

}

export class CommunitiesResponse {
  @ValidateNested()
  community: Types.Community;

}
/**
 * 获取用户加入的小区
 */
export async function communitieMy(
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest("/api/communities/my", {
    method: 'GET',
    noAuthorize: noAuthorize,
  });
}

/**
 * 加入小区
 */
export async function communitieJoin(
  pathParams: CommunitieJoinPathParams,
  noAuthorize?: boolean
): Promise<HTTPResponse<CommunitieJoinResponse>> {
  return await apiRequest(`/api/communities/${pathParams.id}/join`, {
    method: 'POST',
    noAuthorize: noAuthorize,
  });
}

/**
 * 退出小区
 */
export async function communitieLeave(
  pathParams: CommunitieLeavePathParams,
  noAuthorize?: boolean
): Promise<HTTPResponse<CommunitieLeaveResponse>> {
  return await apiRequest(`/api/communities/${pathParams.id}/leave`, {
    method: 'POST',
    noAuthorize: noAuthorize,
  });
}

/**
 * 申请小区认证
 */
export async function communitieVerify(
  pathParams: CommunitieVerifyPathParams,
  data: CommunitieVerifyDTO,
  noAuthorize?: boolean
): Promise<HTTPResponse<CommunitieVerifyResponse>> {
  return await apiRequest(`/api/communities/${pathParams.id}/verify`, {
    method: 'POST',
    body: JSON.stringify(data),
    noAuthorize: noAuthorize,
  });
}

/**
 * 获取附近小区（1公里内）
 */
export async function communitieNearby(
  queryParams?: CommunitieNearbyQueryParams,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest("/api/communities/nearby", {
    method: 'GET',
    noAuthorize: noAuthorize,
    params: queryParams,
  });
}

/**
 * 搜索小区
 */
export async function communitieSearch(
  queryParams?: CommunitieSearchQueryParams,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest("/api/communities/search", {
    method: 'GET',
    noAuthorize: noAuthorize,
    params: queryParams,
  });
}

/**
 * 根据小区ID批量获取活动
 */
export async function communitieActivities(
  queryParams?: CommunitieActivitiesQueryParams,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest("/api/communities/activities", {
    method: 'GET',
    noAuthorize: noAuthorize,
    params: queryParams,
  });
}

/**
 * 获取跳蚤市场地摊活动
 */
export async function communitieActivitiesFeed(
  queryParams?: CommunitieActivitiesFeedQueryParams,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest("/api/communities/activities/feed", {
    method: 'GET',
    noAuthorize: noAuthorize,
    params: queryParams,
  });
}

/**
 * 获取小区详情
 */
export async function communities(
  pathParams: CommunitiesPathParams,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest(`/api/communities/${pathParams.id}`, {
    method: 'GET',
    noAuthorize: noAuthorize,
  });
}

/**
 * 获取用户加入的小区 Hook
 */
export function useCommunitieMy(
  options?: UseQueryOptions<HTTPResponse<CommunitieMyResponse>, Error>
) {
  return useQuery({
    queryKey: ['communities', '获取用户加入的小区'],
    queryFn: () => communitieMy(),
    ...options,
  });
}

/**
 * 加入小区 Hook
 */
export function useCommunitieJoin(
  pathParams: CommunitieJoinPathParams,
  options?: UseMutationOptions<HTTPResponse<CommunitieJoinResponse>, Error, null>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => communitieJoin(pathParams),
    onSuccess: () => {
      // 清除相关缓存
      queryClient.invalidateQueries({ queryKey: ['communities'] });
      queryClient.invalidateQueries({ queryKey: ['app'] });
    },
    onError: (error: any) => {
      console.error('Mutation failed:', error);
    },
    ...options,
  });
}

/**
 * 退出小区 Hook
 */
export function useCommunitieLeave(
  pathParams: CommunitieLeavePathParams,
  options?: UseMutationOptions<HTTPResponse<CommunitieLeaveResponse>, Error, null>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => communitieLeave(pathParams),
    onSuccess: () => {
      // 清除相关缓存
      queryClient.invalidateQueries({ queryKey: ['communities'] });
      queryClient.invalidateQueries({ queryKey: ['app'] });
    },
    onError: (error: any) => {
      console.error('Mutation failed:', error);
    },
    ...options,
  });
}

/**
 * 申请小区认证 Hook
 */
export function useCommunitieVerify(
  pathParams: CommunitieVerifyPathParams,
  options?: UseMutationOptions<HTTPResponse<CommunitieVerifyResponse>, Error, CommunitieVerifyDTO>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => communitieVerify(pathParams, data),
    onSuccess: () => {
      // 清除相关缓存
      queryClient.invalidateQueries({ queryKey: ['communities'] });
      queryClient.invalidateQueries({ queryKey: ['app'] });
    },
    onError: (error: any) => {
      console.error('Mutation failed:', error);
    },
    ...options,
  });
}

/**
 * 获取附近小区（1公里内） Hook
 */
export function useCommunitieNearby(
  queryParams?: CommunitieNearbyQueryParams,
  options?: UseQueryOptions<HTTPResponse<CommunitieNearbyResponse>, Error>
) {
  return useQuery({
    queryKey: ['communities', '获取附近小区（1公里内）', queryParams?.latitude, queryParams?.longitude, queryParams?.radius],
    queryFn: () => communitieNearby(queryParams),
    ...options,
  });
}

/**
 * 搜索小区 Hook
 */
export function useCommunitieSearch(
  queryParams?: CommunitieSearchQueryParams,
  options?: UseQueryOptions<HTTPResponse<CommunitieSearchResponse>, Error>
) {
  return useQuery({
    queryKey: ['communities', '搜索小区', queryParams?.search, queryParams?.provinceId, queryParams?.cityId, queryParams?.districtId, queryParams?.verificationStatus, queryParams?.page, queryParams?.limit],
    queryFn: () => communitieSearch(queryParams),
    ...options,
  });
}

/**
 * 根据小区ID批量获取活动 Hook
 */
export function useCommunitieActivities(
  queryParams?: CommunitieActivitiesQueryParams,
  options?: UseQueryOptions<HTTPResponse<CommunitieActivitiesResponse>, Error>
) {
  return useQuery({
    queryKey: ['communities', '根据小区id批量获取活动', queryParams?.communityIds, queryParams?.page, queryParams?.limit],
    queryFn: () => communitieActivities(queryParams),
    ...options,
  });
}

/**
 * 获取跳蚤市场地摊活动 Hook
 */
export function useCommunitieActivitiesFeed(
  queryParams?: CommunitieActivitiesFeedQueryParams,
  options?: UseQueryOptions<HTTPResponse<CommunitieActivitiesFeedResponse>, Error>
) {
  return useQuery({
    queryKey: ['communities', '获取跳蚤市场地摊活动', queryParams?.page, queryParams?.limit, queryParams?.communityId],
    queryFn: () => communitieActivitiesFeed(queryParams),
    ...options,
  });
}

/**
 * 获取小区详情 Hook
 */
export function useCommunities(
  pathParams: CommunitiesPathParams,
  options?: UseQueryOptions<HTTPResponse<CommunitiesResponse>, Error>
) {
  return useQuery({
    queryKey: ['communities', '获取小区详情', pathParams.id],
    queryFn: () => communities(pathParams),
    ...options,
  });
}

