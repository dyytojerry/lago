import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { verifyToken, isUserToken, isOperationToken } from '../lib/auth';
import { createErrorResponse } from '../lib/response';
import { isTokenBlacklisted } from '../lib/token-blacklist';

// 扩展Express Request类型
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        type: 'user';
      };
      operationStaff?: {
        id: string;
        role: string;
        type: 'operation';
      };
    }
  }
}

/**
 * 应用端用户认证中间件
 */
export async function authUser(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return createErrorResponse(res, '未提供认证令牌', 401);
    }
 
    // 检查token是否在黑名单中
    const isBlacklisted = await isTokenBlacklisted(token);
    if (isBlacklisted) {
      return createErrorResponse(res, '认证令牌已失效', 422);
    }
 
    const payload = verifyToken(token);
    
    if (!payload || !isUserToken(payload)) {
      return createErrorResponse(res, '认证令牌无效或已过期', 422);
    }
 
    // 验证用户是否存在且激活
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, role: true, isActive: true },
    });
 
    if (!user || !user.isActive) {
      return createErrorResponse(res, '用户不存在或已被禁用', 422);
    }
 
    req.user = {
      id: user.id,
      role: user.role,
      type: 'user',
    };
 
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return createErrorResponse(res, '认证失败', 500);
  }
}

/**
 * 运营系统认证中间件
 */
export async function authOperation(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return createErrorResponse(res, '未提供认证令牌', 401);
    }
 
    // 检查token是否在黑名单中
    const isBlacklisted = await isTokenBlacklisted(token);
    if (isBlacklisted) {
      return createErrorResponse(res, '认证令牌已失效', 422);
    }
 
    const payload = verifyToken(token);
    
    if (!payload || !isOperationToken(payload)) {
      return createErrorResponse(res, '认证令牌无效或已过期', 422);
    }
 
    // 验证运营人员是否存在且激活
    const staff = await prisma.operationStaff.findUnique({
      where: { id: payload.staffId },
      select: { id: true, role: true, isActive: true },
    });
 
    if (!staff || !staff.isActive) {
      return createErrorResponse(res, '运营人员不存在或已被禁用', 422);
    }
 
    req.operationStaff = {
      id: staff.id,
      role: staff.role,
      type: 'operation',
    };
 
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return createErrorResponse(res, '认证失败', 500);
  }
}

/**
 * 角色权限检查中间件
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = req.user?.role || req.operationStaff?.role;
    
    if (!role || !allowedRoles.includes(role)) {
      return createErrorResponse(res, '权限不足', 403);
    }
    
    next();
  };
}
