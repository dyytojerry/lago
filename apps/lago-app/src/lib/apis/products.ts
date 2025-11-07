import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { apiRequest, HTTPResponse, jsonToFormData } from '@lago/common';
import * as Types from './types';
import { IsString, IsNumber, IsBoolean, IsArray, IsObject, IsOptional, IsEnum, ValidateNested } from 'class-validator';

export class ProductsQueryParams {
  @IsString()
  @IsOptional()
  page?: string;

  @IsString()
  @IsOptional()
  limit?: string;

  @IsEnum(Types.ProductCategory)
  @IsOptional()
  category?: Types.ProductCategory;

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

export class ProductsResponse {
  @IsArray()
  products: Types.Product[];

  @ValidateNested()
  pagination: Types.Pagination;

}
export class ProductCreateDTO {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(Types.ProductCategory)
  category: Types.ProductCategory;

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
export class ProductCreateResponse {
  @ValidateNested()
  product: Types.Product;

}
export class ProductRecommendedQueryParams {
  @IsString()
  @IsOptional()
  limit?: string;

}

export class ProductRecommendedResponse {
  @IsArray()
  products: Types.Product[];

}
export class ProductHotQueryParams {
  @IsString()
  @IsOptional()
  limit?: string;

}

export class ProductHotResponse {
  @IsArray()
  products: Types.Product[];

}
export class ProductDetailPathParams {
  @IsString()
  id: string;

}

export class ProductDetailResponse {
  @ValidateNested()
  product: Types.Product;

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

  @IsEnum(Types.ProductCategory)
  @IsOptional()
  category?: Types.ProductCategory;

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
/**
 * 获取商品列表（小程序端）
 */
export async function products(
  queryParams?: ProductsQueryParams,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest("/api/products", {
    method: 'GET',
    noAuthorize: noAuthorize,
    params: queryParams,
  });
}

/**
 * 创建商品
 */
export async function productCreate(
  data: ProductCreateDTO,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest("/api/products", {
    method: 'POST',
    body: JSON.stringify(data),
    noAuthorize: noAuthorize,
  });
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
 * 获取商品详情
 */
export async function productDetail(
  pathParams: ProductDetailPathParams,
  noAuthorize?: boolean
): Promise<HTTPResponse<any>> {
  return await apiRequest(`/api/products/${pathParams.id}`, {
    method: 'GET',
    noAuthorize: noAuthorize,
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
 * 获取商品列表（小程序端） Hook
 */
export function useProducts(
  queryParams?: ProductsQueryParams,
  options?: UseQueryOptions<HTTPResponse<ProductsResponse>, Error>
) {
  return useQuery({
    queryKey: ['products', '获取商品列表（小程序端）', queryParams?.page, queryParams?.limit, queryParams?.category, queryParams?.type, queryParams?.search, queryParams?.communityId, queryParams?.sortBy, queryParams?.sortOrder],
    queryFn: () => products(queryParams),
    ...options,
  });
}

/**
 * 创建商品 Hook
 */
export function useProductCreate(
  options?: UseMutationOptions<HTTPResponse<ProductCreateResponse>, Error, ProductCreateDTO>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => productCreate(data),
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
 * 获取热门商品 Hook
 */
export function useProductHot(
  queryParams?: ProductHotQueryParams,
  options?: UseQueryOptions<HTTPResponse<ProductHotResponse>, Error>
) {
  return useQuery({
    queryKey: ['products', '获取热门商品', queryParams?.limit],
    queryFn: () => productHot(queryParams),
    ...options,
  });
}

/**
 * 获取商品详情 Hook
 */
export function useProductDetail(
  pathParams: ProductDetailPathParams,
  options?: UseQueryOptions<HTTPResponse<ProductDetailResponse>, Error>
) {
  return useQuery({
    queryKey: ['products', '获取商品详情', pathParams.id],
    queryFn: () => productDetail(pathParams),
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

