import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User, OperationStaff, UserRole, OperationRole } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// 小程序端用户Token payload
export interface UserTokenPayload {
  userId: string;
  role: UserRole;
  type: 'user';
}

// 运营系统Token payload
export interface OperationTokenPayload {
  staffId: string;
  role: OperationRole;
  type: 'operation';
}

export type TokenPayload = UserTokenPayload | OperationTokenPayload;

// 生成Token
export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

// 验证Token
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

// 密码加密
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// 验证密码
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// 验证用户Token
export function isUserToken(payload: TokenPayload): payload is UserTokenPayload {
  return payload.type === 'user';
}

// 验证运营系统Token
export function isOperationToken(payload: TokenPayload): payload is OperationTokenPayload {
  return payload.type === 'operation';
}

