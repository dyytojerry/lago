import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { apiRequest, HTTPResponse, jsonToFormData } from '@lago/common';
import * as Types from './types';
import { IsString, IsNumber, IsBoolean, IsArray, IsObject, IsOptional, IsEnum, ValidateNested } from 'class-validator';

export class ShareDTO {
  @IsEnum(['appMessage', 'timeline'])
  @IsOptional()
  type?: 'appMessage' | 'timeline';

  @IsString()
  @IsOptional()
  path?: string;

  @IsObject()
  @IsOptional()
  options?: any;

}
export class ShareResponse {
  @IsString()
  title: string;

  @IsString()
  desc: string;

  @IsString()
  path: string;

  @IsString()
  imageUrl: string;

}
/**
 * 获取分享数据
 */
export async function share(
  data: ShareDTO,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest("/api/share", {
    method: 'POST',
    body: JSON.stringify(data),
    noAuthorize: noAuthorize,
  });
}

/**
 * 获取分享数据 Hook
 */
export function useShare(
  options?: UseMutationOptions<HTTPResponse<ShareResponse>, Error, ShareDTO>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => share(data),
    onSuccess: () => {
      // 清除相关缓存
      queryClient.invalidateQueries({ queryKey: ['share'] });
      queryClient.invalidateQueries({ queryKey: ['app'] });
    },
    onError: (error: any) => {
      console.error('Mutation failed:', error);
    },
    ...options,
  });
}

