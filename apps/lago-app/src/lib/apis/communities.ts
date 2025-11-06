import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { apiRequest, HTTPResponse, jsonToFormData } from '@lago/common';
import * as Types from './types';
import { IsString, IsNumber, IsBoolean, IsArray, IsObject, IsOptional, IsEnum, ValidateNested } from 'class-validator';

export class CommunitieNearbyQueryParams {
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  @IsNumber()
  @IsOptional()
  radius?: number;

}

export type CommunitieNearbyResponse = any;

export class CommunitiesPathParams {
  @IsString()
  id: string;

}

export type CommunitiesResponse = any;

/**
 * 获取附近小区
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
 * 获取附近小区 Hook
 */
export function useCommunitieNearby(
  queryParams?: CommunitieNearbyQueryParams,
  options?: UseQueryOptions<HTTPResponse<CommunitieNearbyResponse>, Error>
) {
  return useQuery({
    queryKey: ['communities', '获取附近小区', queryParams?.latitude, queryParams?.longitude, queryParams?.radius],
    queryFn: () => communitieNearby(queryParams),
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

