import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { apiRequest, HTTPResponse, jsonToFormData } from '@lago/common';
import * as Types from './types';
import { IsString, IsNumber, IsBoolean, IsArray, IsObject, IsOptional, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 运营系统登录
 */
export async function postApiAuthOperationLogin(
  data: Types.OperationLoginRequest,
  noAuthorize?: boolean
): Promise<HTTPResponse<Types.OperationLoginResponse>> {
  return await apiRequest("/api/auth/operation/login", {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
    noAuthorize,
  });
}

/**
 * 获取当前运营人员信息
 */
export async function getApiAuthOperationMe(
  noAuthorize?: boolean
): Promise<HTTPResponse<Types.GetApiAuthOperationMeResponse>> {
  return await apiRequest("/api/auth/operation/me", {
    method: 'GET',
    noAuthorize,
  });
}

/**
 * 运营系统登录 - Mutation Hook
 */
export function usePostApiAuthOperationLogin(
  options?: UseMutationOptions<HTTPResponse<Types.OperationLoginResponse>, Error, any>
) {
  return useMutation({
    mutationFn: (vars: any) => postApiAuthOperationLogin(...vars),
    ...options,
  });
}

/**
 * 获取当前运营人员信息 - Query Hook
 */
export function useGetApiAuthOperationMe(
  vars: any,
  options?: UseQueryOptions<HTTPResponse<Types.GetApiAuthOperationMeResponse>, Error>
) {
  return useQuery({
    queryKey: ['getApiAuthOperationMe', vars],
    queryFn: () => getApiAuthOperationMe(...vars),
    ...options,
  });
}

