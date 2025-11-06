import { IsString, IsNumber, IsBoolean, IsArray, IsObject, IsOptional, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum UserRoleEnum {
  // TODO: 添加枚举值
}

export enum OperationStaffRoleEnum {
  // TODO: 添加枚举值
}

export enum ProductCategoryEnum {
  // TODO: 添加枚举值
}

export enum ProductTypeEnum {
  // TODO: 添加枚举值
}

export enum ProductStatusEnum {
  // TODO: 添加枚举值
}

export enum ProductApproveRequestActionEnum {
  // TODO: 添加枚举值
}

export enum ProductBatchApproveRequestActionEnum {
  // TODO: 添加枚举值
}

export enum OrderTypeEnum {
  // TODO: 添加枚举值
}

export enum OrderStatusEnum {
  // TODO: 添加枚举值
}

export enum OrderDeliveryTypeEnum {
  // TODO: 添加枚举值
}

export enum OrderStatusUpdateRequestStatusEnum {
  // TODO: 添加枚举值
}

export class User {
  @IsString()
  id: string;

  @IsString()
  @IsOptional()
  nickname?: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @IsEnum(String)
  role: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsBoolean()
  isVerified: boolean;

  @IsNumber()
  creditScore: number;

}

export class OperationStaff {
  @IsString()
  id: string;

  @IsString()
  username: string;

  @IsString()
  email: string;

  @IsEnum(String)
  role: string;

  @IsString()
  @IsOptional()
  realName?: string;

  @IsString()
  @IsOptional()
  phone?: string;

}

export class LoginResponse {
  @IsString()
  token: string;

  @ValidateNested()
  @Type(() => Types.User)
  user: User;

}

export class OperationLoginResponse {
  @IsString()
  token: string;

  @ValidateNested()
  @Type(() => Types.OperationStaff)
  staff: OperationStaff;

}

export class WechatLoginRequest {
  @IsString()
  code: string;

}

export class PhoneLoginRequest {
  @IsString()
  phone: string;

  @IsString()
  password: string;

}

export class PhoneRegisterRequest {
  @IsString()
  phone: string;

  @IsString()
  password: string;

  @IsString()
  @IsOptional()
  verifyCode?: string;

}

export class OperationLoginRequest {
  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsString()
  @IsOptional()
  verifyCode?: string;

}

export class ErrorResponse {
  @IsString()
  error: string;

}

export class SuccessResponse {
  @IsBoolean()
  success: boolean;

  @IsString()
  @IsOptional()
  message?: string;

}

export class Product {
  @IsString()
  id: string;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(String)
  category: string;

  @IsEnum(String)
  type: string;

  @IsString()
  price: string;

  @IsString()
  @IsOptional()
  deposit?: string;

  @IsEnum(String)
  status: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  images: string[];

  @IsString()
  @IsOptional()
  location?: string;

  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;

  @IsNumber()
  @IsOptional()
  viewCount?: number;

  @IsNumber()
  @IsOptional()
  likeCount?: number;

  @IsString()
  @IsOptional()
  createdAt?: string;

  @IsString()
  @IsOptional()
  updatedAt?: string;

}


export class ProductListResponse {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Types.ProductWithRelations)
  products: ProductWithRelations[];

  @ValidateNested()
  @Type(() => Types.Pagination)
  pagination: Pagination;

}

export class ProductDetailResponse {
  @ValidateNested()
  @Type(() => Types.ProductWithRelations)
  product: ProductWithRelations;

}

export class ProductApproveRequest {
  @IsEnum(String)
  action: string;

  @IsString()
  @IsOptional()
  reason?: string;

}

export class ProductBatchApproveRequest {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  ids: string[];

  @IsEnum(String)
  action: string;

  @IsString()
  @IsOptional()
  reason?: string;

}

export class Order {
  @IsString()
  id: string;

  @IsEnum(String)
  type: string;

  @IsEnum(String)
  status: string;

  @IsString()
  amount: string;

  @IsString()
  @IsOptional()
  deposit?: string;

  @IsString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  endDate?: string;

  @IsEnum(String)
  deliveryType: string;

  @IsString()
  @IsOptional()
  deliveryAddress?: string;

  @IsString()
  @IsOptional()
  remark?: string;

  @IsString()
  @IsOptional()
  createdAt?: string;

  @IsString()
  @IsOptional()
  updatedAt?: string;

}


export class OrderListResponse {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Types.OrderWithRelations)
  orders: OrderWithRelations[];

  @ValidateNested()
  @Type(() => Types.Pagination)
  pagination: Pagination;

}

export class OrderDetailResponse {
  @IsString()
  order: any;

}

export class OrderStatusUpdateRequest {
  @IsEnum(String)
  status: string;

  @IsString()
  @IsOptional()
  remark?: string;

}


export class UserListResponse {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Types.UserWithCount)
  users: UserWithCount[];

  @ValidateNested()
  @Type(() => Types.Pagination)
  pagination: Pagination;

}

export class UserDetailResponse {
  @IsString()
  user: any;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  @IsOptional()
  products?: any[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Types.OrderWithRelations)
  @IsOptional()
  orders?: OrderWithRelations[];

}

export class UserStatusUpdateRequest {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @IsOptional()
  creditScore?: number;

}

export class DashboardStats {
  @IsObject()
  gmv: any;

  @IsObject()
  users: any;

  @IsObject()
  communities: any;

  @IsObject()
  orders: any;

  @IsObject()
  pending: any;

}

export class DashboardTrends {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  gmv: any[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  users: any[];

}

export class PendingItems {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Types.ProductWithRelations)
  products: ProductWithRelations[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  approvals: any[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  complaints: any[];

}

export class Pagination {
  @IsNumber()
  page: number;

  @IsNumber()
  limit: number;

  @IsNumber()
  total: number;

  @IsNumber()
  totalPages: number;

}

