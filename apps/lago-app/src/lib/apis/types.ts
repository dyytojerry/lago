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

export enum ChatMessageType {
  TEXT = 'text',
  IMAGE = 'image',
  SYSTEM = 'system',
  PRODUCT_CARD = 'product_card',
}

export enum ChatRoomType {
  PRIVATE = 'private',
  GROUP = 'group',
}

export enum CommunityVerificationStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  APPROVED = 'approved',
  REJECTED = 'rejected',
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

  @IsArray()
  @IsOptional()
  communityIds?: string[];

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
  @IsBoolean()
  success: boolean;

  @IsObject()
  data: any;

}

export class OperationLoginResponse {
  @IsBoolean()
  success: boolean;

  @IsObject()
  data: any;

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

export class UniversalLoginRequest {
  @IsString()
  @IsOptional()
  identifier?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  wechatOpenid?: string;

}

export class ErrorResponse {
  @IsBoolean()
  success: boolean;

  @IsString()
  error: string;

}

export class SuccessResponse {
  @IsBoolean()
  success: boolean;

  @IsObject()
  @IsOptional()
  data?: any;

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

export class OrderStatusUpdateRequest {
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsString()
  @IsOptional()
  remark?: string;

}

export class ChatMessage {
  @IsString()
  id: string;

  @IsString()
  chatRoomId: string;

  @IsString()
  senderId: string;

  @IsString()
  @IsOptional()
  receiverId?: string;

  @IsEnum(ChatMessageType)
  type: ChatMessageType;

  @IsString()
  content: string;

  @IsString()
  @IsOptional()
  fileUrl?: string;

  @IsString()
  @IsOptional()
  productId?: string;

  @IsBoolean()
  isRead: boolean;

  @IsString()
  createdAt: string;

  @IsString()
  @IsOptional()
  readAt?: string;

  @IsObject()
  @IsOptional()
  sender?: any;

}

export class ChatRoom {
  @IsString()
  id: string;

  @IsString()
  @IsOptional()
  productId?: string;

  @IsEnum(ChatRoomType)
  type: ChatRoomType;

  @IsBoolean()
  isActive: boolean;

  @ValidateNested()
  @IsOptional()
  product?: Product;

  @IsArray()
  @IsOptional()
  members?: any[];

  @IsArray()
  @IsOptional()
  messages?: ChatMessage[];

  @IsString()
  createdAt: string;

  @IsString()
  updatedAt: string;

}

export class Community {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  location: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsEnum(CommunityVerificationStatus)
  verificationStatus: CommunityVerificationStatus;

  @IsArray()
  @IsOptional()
  images?: string[];

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  distance?: number;

  @IsObject()
  @IsOptional()
  _count?: any;

  @IsObject()
  @IsOptional()
  province?: any;

  @IsObject()
  @IsOptional()
  city?: any;

  @IsObject()
  @IsOptional()
  district?: any;

}

export class Province {
  @IsString()
  id: string;

  @IsString()
  code: string;

  @IsString()
  name: string;

}

export class City {
  @IsString()
  id: string;

  @IsString()
  provinceId: string;

  @IsString()
  code: string;

  @IsString()
  name: string;

}

export class District {
  @IsString()
  id: string;

  @IsString()
  cityId: string;

  @IsString()
  code: string;

  @IsString()
  name: string;

}

export class UserStatusUpdateRequest {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @IsOptional()
  creditScore?: number;

}

