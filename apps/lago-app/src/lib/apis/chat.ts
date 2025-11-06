import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { apiRequest, HTTPResponse, jsonToFormData } from '@lago/common';
import * as Types from './types';
import { IsString, IsNumber, IsBoolean, IsArray, IsObject, IsOptional, IsEnum, ValidateNested } from 'class-validator';

export type ChatRoomsResponse = any;

export class ChatRoomDTO {
  @IsString()
  @IsOptional()
  productId?: string;

  @IsString()
  @IsOptional()
  otherUserId?: string;

}
export class ChatRoomDetailPathParams {
  @IsString()
  id: string;

}

export type ChatRoomDetailResponse = any;

export class ChatRoomsMessagesPathParams {
  @IsString()
  id: string;

}

export class ChatRoomsMessagesQueryParams {
  @IsString()
  @IsOptional()
  page?: string;

  @IsString()
  @IsOptional()
  limit?: string;

}

export type ChatRoomsMessagesResponse = any;

export class ChatRoomsMessagePathParams {
  @IsString()
  id: string;

}

export class ChatRoomsMessageDTO {
  @IsString()
  @IsOptional()
  content?: string;

  @IsEnum(['text', 'image', 'product_card'])
  @IsOptional()
  type?: 'text' | 'image' | 'product_card';

  @IsString()
  @IsOptional()
  fileUrl?: string;

  @IsString()
  @IsOptional()
  productId?: string;

}
/**
 * 获取聊天室列表
 */
export async function chatRooms(
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest("/api/chat/rooms", {
    method: 'GET',
    noAuthorize: noAuthorize,
  });
}

/**
 * 创建聊天室
 */
export async function chatRoom(
  data: ChatRoomDTO,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest("/api/chat/rooms", {
    method: 'POST',
    body: JSON.stringify(data),
    noAuthorize: noAuthorize,
  });
}

/**
 * 获取聊天室详情
 */
export async function chatRoomDetail(
  pathParams: ChatRoomDetailPathParams,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest(`/api/chat/rooms/${pathParams.id}`, {
    method: 'GET',
    noAuthorize: noAuthorize,
  });
}

/**
 * 获取聊天消息列表
 */
export async function chatRoomsMessages(
  pathParams: ChatRoomsMessagesPathParams,
  queryParams?: ChatRoomsMessagesQueryParams,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest(`/api/chat/rooms/${pathParams.id}/messages`, {
    method: 'GET',
    noAuthorize: noAuthorize,
    params: queryParams,
  });
}

/**
 * 发送消息
 */
export async function chatRoomsMessage(
  pathParams: ChatRoomsMessagePathParams,
  data: ChatRoomsMessageDTO,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest(`/api/chat/rooms/${pathParams.id}/messages`, {
    method: 'POST',
    body: JSON.stringify(data),
    noAuthorize: noAuthorize,
  });
}

/**
 * 获取聊天室列表 Hook
 */
export function useChatRooms(
  options?: UseQueryOptions<HTTPResponse<ChatRoomsResponse>, Error>
) {
  return useQuery({
    queryKey: ['chat', '获取聊天室列表'],
    queryFn: () => chatRooms(),
    ...options,
  });
}

/**
 * 创建聊天室 Hook
 */
export function useChatRoom(
  options?: UseMutationOptions<HTTPResponse<ChatRoomResponse>, Error, ChatRoomDTO>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => chatRoom(data),
    onSuccess: () => {
      // 清除相关缓存
      queryClient.invalidateQueries({ queryKey: ['chat'] });
      queryClient.invalidateQueries({ queryKey: ['app'] });
    },
    onError: (error: any) => {
      console.error('Mutation failed:', error);
    },
    ...options,
  });
}

/**
 * 获取聊天室详情 Hook
 */
export function useChatRoomDetail(
  pathParams: ChatRoomDetailPathParams,
  options?: UseQueryOptions<HTTPResponse<ChatRoomDetailResponse>, Error>
) {
  return useQuery({
    queryKey: ['chat', '获取聊天室详情', pathParams.id],
    queryFn: () => chatRoomDetail(pathParams),
    ...options,
  });
}

/**
 * 获取聊天消息列表 Hook
 */
export function useChatRoomsMessages(
  pathParams: ChatRoomsMessagesPathParams,
  queryParams?: ChatRoomsMessagesQueryParams,
  options?: UseQueryOptions<HTTPResponse<ChatRoomsMessagesResponse>, Error>
) {
  return useQuery({
    queryKey: ['chat', '获取聊天消息列表', pathParams.id, queryParams?.page, queryParams?.limit],
    queryFn: () => chatRoomsMessages(pathParams, queryParams),
    ...options,
  });
}

/**
 * 发送消息 Hook
 */
export function useChatRoomsMessage(
  pathParams: ChatRoomsMessagePathParams,
  options?: UseMutationOptions<HTTPResponse<ChatRoomsMessageResponse>, Error, ChatRoomsMessageDTO>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => chatRoomsMessage(pathParams, data),
    onSuccess: () => {
      // 清除相关缓存
      queryClient.invalidateQueries({ queryKey: ['chat'] });
      queryClient.invalidateQueries({ queryKey: ['app'] });
    },
    onError: (error: any) => {
      console.error('Mutation failed:', error);
    },
    ...options,
  });
}

