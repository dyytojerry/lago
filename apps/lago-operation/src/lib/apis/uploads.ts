import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { apiRequest, HTTPResponse, jsonToFormData } from '@lago/common';
import * as Types from './types';
import { IsString, IsNumber, IsBoolean, IsArray, IsObject, IsOptional, IsEnum, ValidateNested } from 'class-validator';

export class UploadSingleDTO {
  @IsString()
  @IsOptional()
  file?: File;

  @IsEnum(Types.UploadSingleResponseKind)
  @IsOptional()
  kind?: Types.UploadSingleResponseKind;

}
export type UploadSingleResponse = any;

export class UploadMultipartInitDTO {
  @IsString()
  fileName: string;

  @IsString()
  @IsOptional()
  mimeType?: string;

  @IsEnum(Types.UploadSingleResponseKind)
  @IsOptional()
  kind?: Types.UploadSingleResponseKind;

}
export type UploadMultipartInitResponse = any;

export class UploadMultipartPartDTO {
  @IsString()
  uploadId: string;

  @IsString()
  objectKey: string;

  @IsNumber()
  partNumber: number;

  @IsString()
  file: File;

}
export type UploadMultipartPartResponse = any;

/**
 * 上传单个文件
 */
export async function uploadSingle(
  data: UploadSingleDTO,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest("/api/uploads/single", {
    method: 'POST',
    body: jsonToFormData(data),
    headers: { "Content-Type": null },
    noAuthorize: noAuthorize,
  });
}

/**
 * 初始化分片上传
 */
export async function uploadMultipartInit(
  data: UploadMultipartInitDTO,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest("/api/uploads/multipart/init", {
    method: 'POST',
    body: JSON.stringify(data),
    noAuthorize: noAuthorize,
  });
}

/**
 * 上传分片
 */
export async function uploadMultipartPart(
  data: UploadMultipartPartDTO,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest("/api/uploads/multipart/part", {
    method: 'POST',
    body: jsonToFormData(data),
    headers: { "Content-Type": null },
    noAuthorize: noAuthorize,
  });
}

/**
 * 完成分片上传
 */
export async function uploadMultipartComplete(
  data: Types.MultipartCompleteRequest,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest("/api/uploads/multipart/complete", {
    method: 'POST',
    body: JSON.stringify(data),
    noAuthorize: noAuthorize,
  });
}

/**
 * 取消分片上传
 */
export async function uploadMultipartAbort(
  data: Types.MultipartAbortRequest,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest("/api/uploads/multipart/abort", {
    method: 'POST',
    body: JSON.stringify(data),
    noAuthorize: noAuthorize,
  });
}

/**
 * 上传单个文件 Hook
 */
export function useUploadSingle(
  options?: UseMutationOptions<HTTPResponse<UploadSingleResponse>, Error, UploadSingleDTO>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => uploadSingle(data),
    onSuccess: () => {
      // 清除相关缓存
      queryClient.invalidateQueries({ queryKey: ['uploads'] });
      queryClient.invalidateQueries({ queryKey: ['app'] });
    },
    onError: (error: any) => {
      console.error('Mutation failed:', error);
    },
    ...options,
  });
}

/**
 * 初始化分片上传 Hook
 */
export function useUploadMultipartInit(
  options?: UseMutationOptions<HTTPResponse<UploadMultipartInitResponse>, Error, UploadMultipartInitDTO>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => uploadMultipartInit(data),
    onSuccess: () => {
      // 清除相关缓存
      queryClient.invalidateQueries({ queryKey: ['uploads'] });
      queryClient.invalidateQueries({ queryKey: ['app'] });
    },
    onError: (error: any) => {
      console.error('Mutation failed:', error);
    },
    ...options,
  });
}

/**
 * 上传分片 Hook
 */
export function useUploadMultipartPart(
  options?: UseMutationOptions<HTTPResponse<UploadMultipartPartResponse>, Error, UploadMultipartPartDTO>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => uploadMultipartPart(data),
    onSuccess: () => {
      // 清除相关缓存
      queryClient.invalidateQueries({ queryKey: ['uploads'] });
      queryClient.invalidateQueries({ queryKey: ['app'] });
    },
    onError: (error: any) => {
      console.error('Mutation failed:', error);
    },
    ...options,
  });
}

/**
 * 完成分片上传 Hook
 */
export function useUploadMultipartComplete(
  options?: UseMutationOptions<HTTPResponse<UploadMultipartCompleteResponse>, Error, Types.MultipartCompleteRequest>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => uploadMultipartComplete(data),
    onSuccess: () => {
      // 清除相关缓存
      queryClient.invalidateQueries({ queryKey: ['uploads'] });
      queryClient.invalidateQueries({ queryKey: ['app'] });
    },
    onError: (error: any) => {
      console.error('Mutation failed:', error);
    },
    ...options,
  });
}

/**
 * 取消分片上传 Hook
 */
export function useUploadMultipartAbort(
  options?: UseMutationOptions<HTTPResponse<UploadMultipartAbortResponse>, Error, Types.MultipartAbortRequest>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => uploadMultipartAbort(data),
    onSuccess: () => {
      // 清除相关缓存
      queryClient.invalidateQueries({ queryKey: ['uploads'] });
      queryClient.invalidateQueries({ queryKey: ['app'] });
    },
    onError: (error: any) => {
      console.error('Mutation failed:', error);
    },
    ...options,
  });
}

