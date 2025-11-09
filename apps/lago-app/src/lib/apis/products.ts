import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { apiRequest, HTTPResponse, jsonToFormData } from '@lago/common';
import * as Types from './types';
import { IsString, IsNumber, IsBoolean, IsArray, IsObject, IsOptional, IsEnum, ValidateNested } from 'class-validator';

export class ProductRecommendedQueryParams {
  @IsNumber()
  @IsOptional()
  limit?: number;

}

export class ProductRecommendedResponse {
  @IsArray()
  products: Types.Product[];

}
export class ProductsDTO {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['toys', 'gaming'])
  category: 'toys' | 'gaming';

  @IsEnum(Types.ProductType)
  type: Types.ProductType;

  @IsNumber()
  price: number;

  @IsNumber()
  @IsOptional()
  deposit?: number;

  @IsArray()
  @IsOptional()
  images?: string[];

  @IsString()
  @IsOptional()
  communityId?: string;

  @IsString()
  @IsOptional()
  location?: string;

}
export class ProductsResponse {
  @ValidateNested()
  product: Types.Product;

}
export class ProductDetailQueryParams {
  @IsNumber()
  @IsOptional()
  page?: number;

  @IsNumber()
  @IsOptional()
  limit?: number;

  @IsEnum(['toys', 'gaming'])
  @IsOptional()
  category?: 'toys' | 'gaming';

  @IsEnum(Types.ProductType)
  @IsOptional()
  type?: Types.ProductType;

  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  communityId?: string;

  @IsEnum(['createdAt', 'price', 'viewCount', 'likeCount'])
  @IsOptional()
  sortBy?: 'createdAt' | 'price' | 'viewCount' | 'likeCount';

  @IsEnum(['asc', 'desc'])
  @IsOptional()
  sortOrder?: 'asc' | 'desc';

}

export class ProductDetailResponse {
  @IsArray()
  products: Types.Product[];

  @ValidateNested()
  pagination: Types.Pagination;

}
export class ProductUpdatePathParams {
  @IsString()
  id: string;

}

export class ProductUpdateDTO {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['toys', 'gaming'])
  @IsOptional()
  category?: 'toys' | 'gaming';

  @IsEnum(Types.ProductType)
  @IsOptional()
  type?: Types.ProductType;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsNumber()
  @IsOptional()
  deposit?: number;

  @IsArray()
  @IsOptional()
  images?: string[];

  @IsEnum(Types.ProductStatus)
  @IsOptional()
  status?: Types.ProductStatus;

}
export class ProductUpdateResponse {
  @ValidateNested()
  product: Types.Product;

}
export class ProductDeletePathParams {
  @IsString()
  id: string;

}

export class ProductDeleteResponse {
  @IsString()
  message: string;

}
export class ProductDetail1PathParams {
  @IsString()
  id: string;

}

export class ProductDetail1Response {
  @ValidateNested()
  product: Types.Product;

}
export class ProductLikePathParams {
  @IsString()
  id: string;

}

export class ProductLikeResponse {
  @IsString()
  message: string;

}
export class ProductUnlikePathParams {
  @IsString()
  id: string;

}

export class ProductUnlikeResponse {
  @IsString()
  message: string;

}
export class ProductHotQueryParams {
  @IsNumber()
  @IsOptional()
  page?: number;

  @IsNumber()
  @IsOptional()
  limit?: number;

  @IsEnum(['viewCount', 'likeCount', 'createdAt', 'price'])
  @IsOptional()
  sortBy?: 'viewCount' | 'likeCount' | 'createdAt' | 'price';

  @IsEnum(['asc', 'desc'])
  @IsOptional()
  sortOrder?: 'asc' | 'desc';

  @IsString()
  @IsOptional()
  cityId?: string;

  @IsEnum(['toys', 'gaming'])
  @IsOptional()
  category?: 'toys' | 'gaming';

  @IsString()
  @IsOptional()
  search?: string;

}

export class ProductHotResponse {
  @IsArray()
  products: Types.Product[];

  @ValidateNested()
  pagination: Types.Pagination;

}
/**
 * 获取推荐商品
 */
export async function productRecommended(
  queryParams?: ProductRecommendedQueryParams,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest("/api/products/recommended", {
    method: 'GET',
    noAuthorize: noAuthorize,
    params: queryParams,
  });
}

/**
 * 创建商品
 */
export async function products(
  data: ProductsDTO,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest("/api/products", {
    method: 'POST',
    body: JSON.stringify(data),
    noAuthorize: noAuthorize,
  });
}

/**
 * 获取商品列表
 */
export async function productDetail(
  queryParams?: ProductDetailQueryParams,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest("/api/products", {
    method: 'GET',
    noAuthorize: noAuthorize,
    params: queryParams,
  });
}

/**
 * 更新商品
 */
export async function productUpdate(
  pathParams: ProductUpdatePathParams,
  data: ProductUpdateDTO,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest(`/api/products/${pathParams.id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    noAuthorize: noAuthorize,
  });
}

/**
 * 删除商品
 */
export async function productDelete(
  pathParams: ProductDeletePathParams,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest(`/api/products/${pathParams.id}`, {
    method: 'DELETE',
    noAuthorize: noAuthorize,
  });
}

/**
 * 获取商品详情
 */
export async function productDetail1(
  pathParams: ProductDetail1PathParams,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest(`/api/products/${pathParams.id}`, {
    method: 'GET',
    noAuthorize: noAuthorize,
  });
}

/**
 * 收藏商品
 */
export async function productLike(
  pathParams: ProductLikePathParams,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest(`/api/products/${pathParams.id}/like`, {
    method: 'POST',
    noAuthorize: noAuthorize,
  });
}

/**
 * 取消收藏商品
 */
export async function productUnlike(
  pathParams: ProductUnlikePathParams,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest(`/api/products/${pathParams.id}/unlike`, {
    method: 'POST',
    noAuthorize: noAuthorize,
  });
}

/**
 * 获取热门商品
 */
export async function productHot(
  queryParams?: ProductHotQueryParams,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest("/api/products/hot", {
    method: 'GET',
    noAuthorize: noAuthorize,
    params: queryParams,
  });
}

/**
 * 获取推荐商品 Hook
 */
export function useProductRecommended(
  queryParams?: ProductRecommendedQueryParams,
  options?: UseQueryOptions<HTTPResponse<ProductRecommendedResponse>, Error>
) {
  return useQuery({
    queryKey: ['products', '获取推荐商品', queryParams?.limit],
    queryFn: () => productRecommended(queryParams),
    ...options,
  });
}

/**
 * 创建商品 Hook
 */
export function useProducts(
  options?: UseMutationOptions<HTTPResponse<ProductsResponse>, Error, ProductsDTO>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => products(data),
    onSuccess: () => {
      // 清除相关缓存
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['app'] });
    },
    onError: (error: any) => {
      console.error('Mutation failed:', error);
    },
    ...options,
  });
}

/**
 * 获取商品列表 Hook
 */
export function useProductDetail(
  queryParams?: ProductDetailQueryParams,
  options?: UseQueryOptions<HTTPResponse<ProductDetailResponse>, Error>
) {
  return useQuery({
    queryKey: ['products', '获取商品列表', queryParams?.page, queryParams?.limit, queryParams?.category, queryParams?.type, queryParams?.search, queryParams?.communityId, queryParams?.sortBy, queryParams?.sortOrder],
    queryFn: () => productDetail(queryParams),
    ...options,
  });
}

/**
 * 更新商品 Hook
 */
export function useProductUpdate(
  pathParams: ProductUpdatePathParams,
  options?: UseMutationOptions<HTTPResponse<ProductUpdateResponse>, Error, ProductUpdateDTO>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => productUpdate(pathParams, data),
    onSuccess: () => {
      // 清除相关缓存
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['app'] });
    },
    onError: (error: any) => {
      console.error('Mutation failed:', error);
    },
    ...options,
  });
}

/**
 * 删除商品 Hook
 */
export function useProductDelete(
  pathParams: ProductDeletePathParams,
  options?: UseMutationOptions<HTTPResponse<ProductDeleteResponse>, Error, any>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => productDelete(pathParams),
    onSuccess: () => {
      // 清除相关缓存
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['app'] });
    },
    onError: (error: any) => {
      console.error('Mutation failed:', error);
    },
    ...options,
  });
}

/**
 * 获取商品详情 Hook
 */
export function useProductDetail1(
  pathParams: ProductDetail1PathParams,
  options?: UseQueryOptions<HTTPResponse<ProductDetail1Response>, Error>
) {
  return useQuery({
    queryKey: ['products', '获取商品详情', pathParams.id],
    queryFn: () => productDetail1(pathParams),
    ...options,
  });
}

/**
 * 收藏商品 Hook
 */
export function useProductLike(
  pathParams: ProductLikePathParams,
  options?: UseMutationOptions<HTTPResponse<ProductLikeResponse>, Error, null>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => productLike(pathParams),
    onSuccess: () => {
      // 清除相关缓存
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['app'] });
    },
    onError: (error: any) => {
      console.error('Mutation failed:', error);
    },
    ...options,
  });
}

/**
 * 取消收藏商品 Hook
 */
export function useProductUnlike(
  pathParams: ProductUnlikePathParams,
  options?: UseMutationOptions<HTTPResponse<ProductUnlikeResponse>, Error, null>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => productUnlike(pathParams),
    onSuccess: () => {
      // 清除相关缓存
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['app'] });
    },
    onError: (error: any) => {
      console.error('Mutation failed:', error);
    },
    ...options,
  });
}

/**
 * 获取热门商品 Hook
 */
export function useProductHot(
  queryParams?: ProductHotQueryParams,
  options?: UseQueryOptions<HTTPResponse<ProductHotResponse>, Error>
) {
  return useQuery({
    queryKey: ['products', '获取热门商品', queryParams?.page, queryParams?.limit, queryParams?.sortBy, queryParams?.sortOrder, queryParams?.cityId, queryParams?.category, queryParams?.search],
    queryFn: () => productHot(queryParams),
    ...options,
  });
}

