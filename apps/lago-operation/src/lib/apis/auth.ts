import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { apiRequest, HTTPResponse, jsonToFormData } from '@lago/common';
import * as Types from './types';
import { IsString, IsNumber, IsBoolean, IsArray, IsObject, IsOptional, IsEnum, ValidateNested } from 'class-validator';

export type AuthWechatLoginResponse = Types.LoginResponse;

export type AuthPhoneLoginResponse = Types.LoginResponse;

export type AuthOperationLoginResponse = Types.OperationLoginResponse;

export type AuthMeResponse = any;

export type AuthOperationMeResponse = any;

/**
 * 微信登录（小程序端）
 */
export async function authWechatLogin(
  data: Types.WechatLoginRequest,
  noAuthorize?: boolean
): Promise<HTTPResponse<AuthWechatLoginResponse>> {
  return await apiRequest("/api/auth/wechat/login", {
    method: 'POST',
    body: JSON.stringify(data),
    noAuthorize: noAuthorize,
  });
}

/**
 * 手机号登录（小程序端）
 */
export async function authPhoneLogin(
  data: Types.PhoneLoginRequest,
  noAuthorize?: boolean
): Promise<HTTPResponse<AuthPhoneLoginResponse>> {
  return await apiRequest("/api/auth/phone/login", {
    method: 'POST',
    body: JSON.stringify(data),
    noAuthorize: noAuthorize,
  });
}

/**
 * 手机号注册（小程序端）
 */
export async function authPhoneRegister(
  data: Types.PhoneRegisterRequest,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest("/api/auth/phone/register", {
    method: 'POST',
    body: JSON.stringify(data),
    noAuthorize: noAuthorize,
  });
}

/**
 * 运营系统登录
 */
export async function authOperationLogin(
  data: Types.OperationLoginRequest,
  noAuthorize?: boolean
): Promise<HTTPResponse<AuthOperationLoginResponse>> {
  return await apiRequest("/api/auth/operation/login", {
    method: 'POST',
    body: JSON.stringify(data),
    noAuthorize: noAuthorize,
  });
}

/**
 * 获取当前用户信息（小程序端）
 */
export async function authMe(
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest("/api/auth/me", {
    method: 'GET',
    noAuthorize: noAuthorize,
  });
}

/**
 * 获取当前运营人员信息
 */
export async function authOperationMe(
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest("/api/auth/operation/me", {
    method: 'GET',
    noAuthorize: noAuthorize,
  });
}

/**
 * 微信登录（小程序端） Hook
 */
export function useAuthWechatLogin(
  options?: UseMutationOptions<HTTPResponse<AuthWechatLoginResponse>, Error, Types.WechatLoginRequest>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => authWechatLogin(data),
    onSuccess: () => {
      // 清除相关缓存
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      queryClient.invalidateQueries({ queryKey: ['app'] });
    },
    onError: (error: any) => {
      console.error('Mutation failed:', error);
    },
    ...options,
  });
}

/**
 * 手机号登录（小程序端） Hook
 */
export function useAuthPhoneLogin(
  options?: UseMutationOptions<HTTPResponse<AuthPhoneLoginResponse>, Error, Types.PhoneLoginRequest>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => authPhoneLogin(data),
    onSuccess: () => {
      // 清除相关缓存
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      queryClient.invalidateQueries({ queryKey: ['app'] });
    },
    onError: (error: any) => {
      console.error('Mutation failed:', error);
    },
    ...options,
  });
}

/**
 * 手机号注册（小程序端） Hook
 */
export function useAuthPhoneRegister(
  options?: UseMutationOptions<HTTPResponse<AuthPhoneRegisterResponse>, Error, Types.PhoneRegisterRequest>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => authPhoneRegister(data),
    onSuccess: () => {
      // 清除相关缓存
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      queryClient.invalidateQueries({ queryKey: ['app'] });
    },
    onError: (error: any) => {
      console.error('Mutation failed:', error);
    },
    ...options,
  });
}

/**
 * 运营系统登录 Hook
 */
export function useAuthOperationLogin(
  options?: UseMutationOptions<HTTPResponse<AuthOperationLoginResponse>, Error, Types.OperationLoginRequest>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => authOperationLogin(data),
    onSuccess: () => {
      // 清除相关缓存
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      queryClient.invalidateQueries({ queryKey: ['operation'] });
    },
    onError: (error: any) => {
      console.error('Mutation failed:', error);
    },
    ...options,
  });
}

/**
 * 获取当前用户信息（小程序端） Hook
 */
export function useAuthMe(
  options?: UseQueryOptions<HTTPResponse<AuthMeResponse>, Error>
) {
  return useQuery({
    queryKey: ['auth', '获取当前用户信息（小程序端）'],
    queryFn: () => authMe(),
    ...options,
  });
}

/**
 * 获取当前运营人员信息 Hook
 */
export function useAuthOperationMe(
  options?: UseQueryOptions<HTTPResponse<AuthOperationMeResponse>, Error>
) {
  return useQuery({
    queryKey: ['auth', '获取当前运营人员信息'],
    queryFn: () => authOperationMe(),
    ...options,
  });
}

