import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from './prisma';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET && process.env.NODE_ENV !== 'development') {
  throw new Error('JWT_SECRET environment variable is required');
}

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || JWT_SECRET;
if (!JWT_REFRESH_SECRET && process.env.NODE_ENV !== 'development') {
  throw new Error('JWT_REFRESH_SECRET environment variable is required');
}

// 应用端 Token Payload
export interface UserJWTPayload {
  userId: string;
  role: string;
  type: 'user';
  tokenKind?: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

// 运营端 Token Payload
export interface OperationJWTPayload {
  staffId: string;
  type: 'operation';
  tokenKind?: 'access' | 'refresh';
  roles?: string[];
  permissions?: string[];
  isSuperAdmin?: boolean;
  iat?: number;
  exp?: number;
}

// 通用 Token Payload（用于验证）
export type JWTPayload = UserJWTPayload | OperationJWTPayload;

/**
 * 生成应用端用户 Token
 */
export function generateUserToken(payload: { userId: string; role: string }): string {
  const secret = JWT_SECRET || 'dev-secret-key';
  return jwt.sign(
    {
      ...payload,
      type: 'user',
      tokenKind: 'access',
    },
    secret,
    { expiresIn: '7d' }
  );
}

/**
 * 生成运营端 Token
 */
export function generateOperationToken(payload: { staffId: string; roles?: string[]; permissions?: string[]; isSuperAdmin?: boolean }): string {
  const secret = JWT_SECRET || 'dev-secret-key';
  return jwt.sign(
    {
      ...payload,
      type: 'operation',
      tokenKind: 'access',
    },
    secret,
    { expiresIn: '1d' }
  );
}

/**
 * 生成应用端用户 Refresh Token
 */
export function generateUserRefreshToken(payload: { userId: string; role: string }): string {
  const secret = JWT_REFRESH_SECRET || 'dev-refresh-secret';
  return jwt.sign(
    {
      ...payload,
      type: 'user',
      tokenKind: 'refresh',
    },
    secret,
    { expiresIn: '30d' }
  );
}

/**
 * 生成运营端 Refresh Token
 */
export function generateOperationRefreshToken(payload: { staffId: string; roles?: string[]; permissions?: string[]; isSuperAdmin?: boolean }): string {
  const secret = JWT_REFRESH_SECRET || 'dev-refresh-secret';
  return jwt.sign(
    {
      ...payload,
      type: 'operation',
      tokenKind: 'refresh',
    },
    secret,
    { expiresIn: '14d' }
  );
}

/**
 * 验证 Token（通用）
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const secret = JWT_SECRET || 'dev-secret-key';
    const decoded = jwt.verify(token, secret) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

/**
 * 验证 Refresh Token
 */
export function verifyRefreshToken(token: string): JWTPayload | null {
  try {
    const secret = JWT_REFRESH_SECRET || 'dev-refresh-secret';
    const decoded = jwt.verify(token, secret) as JWTPayload;
    if (decoded.tokenKind !== 'refresh') {
      return null;
    }
    return decoded;
  } catch (error) {
    console.error('Refresh token verification error:', error);
    return null;
  }
}

/**
 * 检查是否为应用端 Token
 */
export function isUserToken(payload: JWTPayload): payload is UserJWTPayload {
  return payload.type === 'user' && 'userId' in payload;
}

/**
 * 检查是否为运营端 Token
 */
export function isOperationToken(payload: JWTPayload): payload is OperationJWTPayload {
  return payload.type === 'operation' && 'staffId' in payload;
}

/**
 * 密码加密
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * 密码比较
 */
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * 从 Token 获取应用端用户信息
 */
export async function getUserFromToken(authHeader: string) {
  const token = authHeader.replace('Bearer ', '');
  const payload = verifyToken(token);
  
  if (!payload || !isUserToken(payload)) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      wechatOpenid: true,
      nickname: true,
      avatarUrl: true,
      role: true,
      phone: true,
      email: true,
      isVerified: true,
      creditScore: true,
      communityIds: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    }
  });

  return user;
}

/**
 * 从 Token 获取运营端人员信息
 */
export async function getOperationStaffFromToken(authHeader: string) {
  const token = authHeader.replace('Bearer ', '');
  const payload = verifyToken(token);
  
  if (!payload || !isOperationToken(payload)) {
    return null;
  }

  const staff = await prisma.operationStaff.findUnique({
    where: { id: payload.staffId },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      realName: true,
      phone: true,
      isActive: true,
      lastLoginAt: true,
      lastLoginIp: true,
      createdAt: true,
      updatedAt: true,
    }
  });

  return staff;
}

// 兼容性导出（为了向后兼容）
export const generateToken = generateUserToken;
