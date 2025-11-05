import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { verifyToken, isUserToken, isOperationToken } from '../lib/auth';

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
      return res.status(401).json({ error: '未提供认证令牌' });
    }

    const payload = verifyToken(token);
    
    if (!payload || !isUserToken(payload)) {
      return res.status(401).json({ error: '无效的认证令牌' });
    }

    // 验证用户是否存在且激活
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: '用户不存在或已被禁用' });
    }

    req.user = {
      id: user.id,
      role: user.role,
      type: 'user',
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ error: '认证失败' });
  }
}

/**
 * 运营系统认证中间件
 */
export async function authOperation(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: '未提供认证令牌' });
    }

    const payload = verifyToken(token);
    
    if (!payload || !isOperationToken(payload)) {
      return res.status(401).json({ error: '无效的认证令牌' });
    }

    // 验证运营人员是否存在且激活
    const staff = await prisma.operationStaff.findUnique({
      where: { id: payload.staffId },
      select: { id: true, role: true, isActive: true },
    });

    if (!staff || !staff.isActive) {
      return res.status(401).json({ error: '运营人员不存在或已被禁用' });
    }

    req.operationStaff = {
      id: staff.id,
      role: staff.role,
      type: 'operation',
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ error: '认证失败' });
  }
}

/**
 * 角色权限检查中间件
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = req.user?.role || req.operationStaff?.role;
    
    if (!role || !allowedRoles.includes(role)) {
      return res.status(403).json({ error: '权限不足' });
    }
    
    next();
  };
}
