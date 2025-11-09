import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { apiRequest, HTTPResponse, jsonToFormData } from '@lago/common';
import * as Types from './types';
import { IsString, IsNumber, IsBoolean, IsArray, IsObject, IsOptional, IsEnum, ValidateNested } from 'class-validator';

export type UserProfileResponse = any;

export class UserProfileUpdateDTO {
  @IsString()
  @IsOptional()
  nickname?: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @IsString()
  @IsOptional()
  phone?: string;

}
export type UserProfileUpdateResponse = any;

export class UserProductsQueryParams {
  @IsNumber()
  @IsOptional()
  page?: number;

  @IsNumber()
  @IsOptional()
  limit?: number;

  @IsEnum(Types.ProductStatus)
  @IsOptional()
  status?: Types.ProductStatus;

}

export type UserProductsResponse = any;

export class UserOrdersQueryParams {
  @IsNumber()
  @IsOptional()
  page?: number;

  @IsNumber()
  @IsOptional()
  limit?: number;

  @IsEnum(['buyer', 'seller'])
  @IsOptional()
  role?: 'buyer' | 'seller';

}

export type UserOrdersResponse = any;

/**
 * 获取用户信息
 */
export async function userProfile(
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest("/api/users/profile", {
    method: 'GET',
    noAuthorize: noAuthorize,
  });
}

/**
 * 更新用户信息
 */
export async function userProfileUpdate(
  data: UserProfileUpdateDTO,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest("/api/users/profile", {
    method: 'PUT',
    body: JSON.stringify(data),
    noAuthorize: noAuthorize,
  });
}

/**
 * 获取用户发布的商品
 */
export async function userProducts(
  queryParams?: UserProductsQueryParams,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest("/api/users/products", {
    method: 'GET',
    noAuthorize: noAuthorize,
    params: queryParams,
  });
}

/**
 * 获取用户的订单（作为买家或卖家）
 */
export async function userOrders(
  queryParams?: UserOrdersQueryParams,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest("/api/users/orders", {
    method: 'GET',
    noAuthorize: noAuthorize,
    params: queryParams,
  });
}

/**
 * 获取用户信息 Hook
 */
export function useUserProfile(
  options?: UseQueryOptions<HTTPResponse<UserProfileResponse>, Error>
) {
  return useQuery({
    queryKey: ['users', '获取用户信息'],
    queryFn: () => userProfile(),
    ...options,
  });
}

/**
 * 更新用户信息 Hook
 */
export function useUserProfileUpdate(
  options?: UseMutationOptions<HTTPResponse<UserProfileUpdateResponse>, Error, UserProfileUpdateDTO>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => userProfileUpdate(data),
    onSuccess: () => {
      // 清除相关缓存
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['app'] });
    },
    onError: (error: any) => {
      console.error('Mutation failed:', error);
    },
    ...options,
  });
}

/**
 * 获取用户发布的商品 Hook
 */
export function useUserProducts(
  queryParams?: UserProductsQueryParams,
  options?: UseQueryOptions<HTTPResponse<UserProductsResponse>, Error>
) {
  return useQuery({
    queryKey: ['users', '获取用户发布的商品', queryParams?.page, queryParams?.limit, queryParams?.status],
    queryFn: () => userProducts(queryParams),
    ...options,
  });
}

/**
 * 获取用户的订单（作为买家或卖家） Hook
 */
export function useUserOrders(
  queryParams?: UserOrdersQueryParams,
  options?: UseQueryOptions<HTTPResponse<UserOrdersResponse>, Error>
) {
  return useQuery({
    queryKey: ['users', '获取用户的订单（作为买家或卖家）', queryParams?.page, queryParams?.limit, queryParams?.role],
    queryFn: () => userOrders(queryParams),
    ...options,
  });
}

