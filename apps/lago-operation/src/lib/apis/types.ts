import { IsString, IsNumber, IsBoolean, IsArray, IsObject, IsOptional, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum UserRole {
  USER = 'user',
  MERCHANT = 'merchant',
  PROPERTY = 'property',
  ADMIN = 'admin',
}

export enum OperationStaffRole {
  SUPER_ADMIN = 'super_admin',
  AUDIT_STAFF = 'audit_staff',
  SERVICE_STAFF = 'service_staff',
  OPERATION_STAFF = 'operation_staff',
  FINANCE_STAFF = 'finance_staff',
}

export enum ProductCategory {
  TOYS = 'toys',
  GAMING = 'gaming',
}

export enum ProductType {
  RENT = 'rent',
  SELL = 'sell',
  BOTH = 'both',
}

export enum ProductStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SOLD = 'sold',
  RENTED = 'rented',
  OFFLINE = 'offline',
}

export enum ProductApproveRequestAction {
  APPROVE = 'approve',
  REJECT = 'reject',
}

export enum OrderType {
  RENT = 'rent',
  SELL = 'sell',
}

export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum OrderDeliveryType {
  SELF_PICKUP = 'self_pickup',
  DELIVERY = 'delivery',
  CABINET = 'cabinet',
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

  @IsEnum(UserRole)
  role: UserRole;

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

  @IsEnum(OperationStaffRole)
  role: OperationStaffRole;

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
  user: User;

}

export class OperationLoginResponse {
  @IsString()
  token: string;

  @ValidateNested()
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

  @IsEnum(ProductCategory)
  category: ProductCategory;

  @IsEnum(ProductType)
  type: ProductType;

  @IsString()
  price: string;

  @IsString()
  @IsOptional()
  deposit?: string;

  @IsEnum(ProductStatus)
  status: ProductStatus;

  @IsArray()
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
  products: ProductWithRelations[];

  @ValidateNested()
  pagination: Pagination;

}

export class ProductDetailResponse {
  @ValidateNested()
  product: ProductWithRelations;

}

export class ProductApproveRequest {
  @IsEnum(ProductApproveRequestAction)
  action: ProductApproveRequestAction;

  @IsString()
  @IsOptional()
  reason?: string;

}

export class ProductBatchApproveRequest {
  @IsArray()
  ids: string[];

  @IsEnum(ProductApproveRequestAction)
  action: ProductApproveRequestAction;

  @IsString()
  @IsOptional()
  reason?: string;

}

export class Order {
  @IsString()
  id: string;

  @IsEnum(OrderType)
  type: OrderType;

  @IsEnum(OrderStatus)
  status: OrderStatus;

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

  @IsEnum(OrderDeliveryType)
  deliveryType: OrderDeliveryType;

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
  orders: OrderWithRelations[];

  @ValidateNested()
  pagination: Pagination;

}

export class OrderDetailResponse {
  @IsString()
  order: any;

}

export class OrderStatusUpdateRequest {
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsString()
  @IsOptional()
  remark?: string;

}


export class UserListResponse {
  @IsArray()
  users: UserWithCount[];

  @ValidateNested()
  pagination: Pagination;

}

export class UserDetailResponse {
  @IsString()
  user: any;

  @IsArray()
  @IsOptional()
  products?: any[];

  @IsArray()
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
  gmv: any[];

  @IsArray()
  users: any[];

}

export class PendingItems {
  @IsArray()
  products: ProductWithRelations[];

  @IsArray()
  approvals: any[];

  @IsArray()
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

