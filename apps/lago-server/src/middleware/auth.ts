import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { verifyToken, isUserToken, isOperationToken } from '../lib/auth';
import { createErrorResponse } from '../lib/response';
import { isTokenBlacklisted } from '../lib/token-blacklist';

const prismaAny = prisma as any;

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
        isSuperAdmin: boolean;
        roleIds: string[];
        permissions: string[];
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
      return createErrorResponse(res, '认证令牌已失效', 401);
    }
 
    const payload = verifyToken(token);
    
    if (!payload || !isUserToken(payload)) {
      return createErrorResponse(res, '认证令牌无效或已过期', 401);
    }
 
    // 验证用户是否存在且激活
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, role: true, isActive: true },
    });
 
    if (!user || !user.isActive) {
      return createErrorResponse(res, '用户不存在或已被禁用', 401);
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
      return createErrorResponse(res, '认证令牌已失效', 401);
    }
 
    const payload = verifyToken(token);
    
    if (!payload || !isOperationToken(payload)) {
      return createErrorResponse(res, '认证令牌无效或已过期', 401);
    }
 
    // 验证运营人员是否存在且激活
    const staff = await prisma.operationStaff.findUnique({
      where: { id: payload.staffId },
      include: {
        roles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });
 
    if (!staff || !staff.isActive) {
      return createErrorResponse(res, '运营人员不存在或已被禁用', 401);
    }

    const permissionsSet = new Set<string>();
    const roleIds = (staff.roles ?? []).map((assignment) => {
      assignment.role.rolePermissions?.forEach((rp) => {
        if (rp.permission?.code) {
          permissionsSet.add(rp.permission.code);
        }
      });
      return assignment.role.id;
    });

    if (staff.isSuperAdmin) {
      const allPermissions = await prismaAny.operationPermission.findMany({ select: { code: true } });
      allPermissions.forEach(({ code }: { code: string }) => permissionsSet.add(code));
    }

    req.operationStaff = {
      id: staff.id,
      isSuperAdmin: staff.isSuperAdmin ?? false,
      roleIds,
      permissions: Array.from(permissionsSet).sort(),
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
export function requirePermissions(...requiredPermissions: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const context = req.operationStaff;

    if (!context) {
      return createErrorResponse(res, '未认证', 401);
    }

    if (context.isSuperAdmin) {
      return next();
    }

    const permissionSet = new Set(context.permissions ?? []);
    const hasAll = requiredPermissions.every((permission) => permissionSet.has(permission));

    if (!hasAll) {
      return createErrorResponse(res, '权限不足', 403);
    }

    next();
  };
}

export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.operationStaff?.isSuperAdmin) {
    return createErrorResponse(res, '需要超级管理员权限', 403);
  }
  next();
}
