import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import {
  generateUserToken,
  generateOperationToken,
  generateUserRefreshToken,
  generateOperationRefreshToken,
  verifyRefreshToken,
  isUserToken,
  isOperationToken,
  hashPassword,
  comparePassword,
} from '../lib/auth';
import { createSuccessResponse, createErrorResponse } from '../lib/response';
import { addTokenToBlacklist } from '../lib/token-blacklist';

function buildUserAuthResponse(user: any) {
  const accessToken = generateUserToken({ userId: user.id, role: user.role });
  const refreshToken = generateUserRefreshToken({ userId: user.id, role: user.role });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
      role: user.role,
      phone: user.phone,
      email: user.email,
      isVerified: user.isVerified,
      creditScore: user.creditScore ?? 0,
      communityIds: user.communityIds ?? [],
    },
  };
}

const operationStaffAuthInclude = {
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
} as const;

const prismaAny = prisma as any;

async function loadOperationStaffAuthContext(staffId: string) {
  return prisma.operationStaff.findUnique({
    where: { id: staffId },
    include: operationStaffAuthInclude as any,
  });
}

async function buildOperationAuthResponse(staff: any) {
  if (!staff) {
    throw new Error('Operation staff not found');
  }

  const roles: {
    id: string;
    name: string;
    description: string | null;
    isSystem: boolean;
    permissions: string[];
  }[] = [];
  const permissionsSet = new Set<string>();

  for (const assignment of staff.roles ?? []) {
    const rolePermissions = assignment.role.rolePermissions ?? [];
    const permissions: string[] = [];

    for (const rp of rolePermissions) {
      if (rp.permission?.code) {
        permissions.push(rp.permission.code);
        permissionsSet.add(rp.permission.code);
      }
    }

    roles.push({
      id: assignment.role.id,
      name: assignment.role.name,
      description: assignment.role.description,
      isSystem: assignment.role.isSystem,
      permissions,
    });
  }

  if (staff.isSuperAdmin) {
    const allPermissions = await prismaAny.operationPermission.findMany({ select: { code: true } });
    for (const { code } of allPermissions) {
      permissionsSet.add(code);
    }
  }

  const permissions = Array.from(permissionsSet).sort((a, b) => a.localeCompare(b));
  const roleIds = roles.map((role) => role.id);

  const tokenPayload = {
    staffId: staff.id,
    roles: roleIds,
    permissions,
    isSuperAdmin: staff.isSuperAdmin ?? false,
  };

  const accessToken = generateOperationToken(tokenPayload);
  const refreshToken = generateOperationRefreshToken(tokenPayload);

  return {
    accessToken,
    refreshToken,
    staff: {
      id: staff.id,
      username: staff.username,
      email: staff.email,
      realName: staff.realName,
      phone: staff.phone,
      isActive: staff.isActive,
      isSuperAdmin: staff.isSuperAdmin ?? false,
      roles,
      permissions,
    },
  };
}

// 通用登录接口（支持手机号/邮箱/微信ID + 密码）
export async function universalLogin(req: Request, res: Response) {
  try {
    const { identifier, nickname, password, wechatOpenid } = req.body;

    let user = null;

    const hashedPassword = await hashPassword(password);
    // 优先处理微信登录
    if (wechatOpenid) {
      user = await prisma.user.findUnique({
        where: { wechatOpenid },
      });

      // 如果用户不存在，创建新用户
      if (!user) {
        // TODO: 调用微信API获取unionid等信息
        const mockUnionid = `mock_unionid_${Date.now()}`;
        
        user = await prisma.user.create({
          data: {
            wechatOpenid,
            wechatUnionid: mockUnionid,
            role: 'user',
          },
        });
      }
    } else if (identifier || nickname) {
      // 通过手机号、邮箱或微信ID查找用户
      const isEmail = identifier && identifier.includes('@');
      const isPhone = identifier && /^1[3-9]\d{9}$/.test(identifier);

      if (isEmail) {
        user = await prisma.user.findUnique({
          where: { email: identifier },
        });
      } else if (isPhone) {
        user = await prisma.user.findUnique({
          where: { phone: identifier },
        });
      } else if (nickname) {
        // 昵称登录
        user = await prisma.user.findFirst({
          where: { nickname, password: hashedPassword },
        });
      }

      // 如果用户不存在且提供了密码，创建新用户
      if (!user && password) {
        if (isEmail) {
          user = await prisma.user.create({
            data: {
              nickname,
              email: identifier,
              password: hashedPassword,
              role: 'user',
            },
          });
        } else if (isPhone) {
          user = await prisma.user.create({
            data: {
              nickname,
              phone: identifier,
              password: hashedPassword,
              role: 'user',
            },
          });
        } else {
          user = await prisma.user.create({
            data: {
              nickname,
              password: hashedPassword,
              role: 'user',
            },
          });
        }
      } else if (!user) {
        return createErrorResponse(res, '账号不存在', 404);
      }

      // 如果提供了密码，验证密码
      if (password && user.password) {
        const isValid = await comparePassword(password, user.password);
        if (!isValid) {
          return createErrorResponse(res, '密码错误', 401);
        }
      } else if (password && !user.password) {
        // 用户存在但没有设置密码，设置密码
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            password: hashedPassword,
          },
        });
      }
    }
    
    if (!user) {
      return createErrorResponse(res, '登录失败', 400);
    }
 
     if (!user.isActive) {
       return createErrorResponse(res, '账号已被禁用', 403);
     }
 
    const authPayload = buildUserAuthResponse(user);
    return createSuccessResponse(res, authPayload);
  } catch (error) {
    console.error('通用登录失败:', error);
    return createErrorResponse(res, '登录失败', 500);
  }
}

// 小程序端：微信登录
export async function wechatLogin(req: Request, res: Response) {
  try {
    const { code } = req.body;

    // TODO: 调用微信API获取openid和unionid
    // 这里先用模拟数据
    const mockOpenid = `mock_openid_${Date.now()}`;
    const mockUnionid = `mock_unionid_${Date.now()}`;

    // 查找或创建用户
    let user = await prisma.user.findUnique({
      where: { wechatOpenid: mockOpenid },
    });

    if (!user) {
      // 新用户，创建账号
      user = await prisma.user.create({
        data: {
          wechatOpenid: mockOpenid,
          wechatUnionid: mockUnionid,
          role: 'user',
        },
      });
    }

    if (!user.isActive) {
      return createErrorResponse(res, '账号已被禁用', 403);
    }
 
    const authPayload = buildUserAuthResponse(user);
    return createSuccessResponse(res, authPayload);
  } catch (error) {
    console.error('微信登录失败:', error);
    return createErrorResponse(res, '登录失败', 500);
  }
}

// 小程序端：手机号登录
export async function phoneLogin(req: Request, res: Response) {
  try {
    const { phone, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user || !user.password) {
      return createErrorResponse(res, '手机号或密码错误', 401);
    }

    if (!user.isActive) {
      return createErrorResponse(res, '账号已被禁用', 403);
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return createErrorResponse(res, '手机号或密码错误', 401);
    }
 
    const authPayload = buildUserAuthResponse(user);
    return createSuccessResponse(res, authPayload);
  } catch (error) {
    console.error('手机号登录失败:', error);
    return createErrorResponse(res, '登录失败', 500);
  }
}

// 小程序端：手机号注册
export async function phoneRegister(req: Request, res: Response) {
  try {
    const { phone, password } = req.body;

    // 检查手机号是否已注册
    const existingUser = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      return createErrorResponse(res, '手机号已被注册', 400);
    }

    // 加密密码
    const hashedPassword = await hashPassword(password);

    // 创建用户
    const user = await prisma.user.create({
      data: {
        phone,
        password: hashedPassword,
        role: 'user',
      },
    });
 
    const authPayload = buildUserAuthResponse(user);

    return createSuccessResponse(res, authPayload, 201);
  } catch (error) {
    console.error('注册失败:', error);
    return createErrorResponse(res, '注册失败', 500);
  }
}

// 运营系统：登录
export async function operationLogin(req: Request, res: Response) {
  try {
    const { username, password } = req.body;

    // 查找运营人员（支持用户名或邮箱登录）
    const staff = await prisma.operationStaff.findFirst({
      where: {
        OR: [
          { username },
          { email: username },
        ],
      },
    });

    if (!staff) {
      return createErrorResponse(res, '用户名或密码错误', 401);
    }

    if (!staff.isActive) {
      return createErrorResponse(res, '账号已被禁用', 403);
    }

    const isValid = await comparePassword(password, staff.password);
    if (!isValid) {
      // 记录登录失败日志
      await prisma.loginLog.create({
        data: {
          staffId: staff.id,
          success: false,
          reason: '密码错误',
          ip: req.ip,
          userAgent: req.get('user-agent'),
        },
      });
      return createErrorResponse(res, '用户名或密码错误', 401);
    }

    // 更新最后登录信息
    await prisma.operationStaff.update({
      where: { id: staff.id },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: req.ip || undefined,
      },
    });

    // 记录登录成功日志
    await prisma.loginLog.create({
      data: {
        staffId: staff.id,
        success: true,
        ip: req.ip,
        userAgent: req.get('user-agent'),
      },
    });
 
    const staffWithRelations = await loadOperationStaffAuthContext(staff.id);
    if (!staffWithRelations) {
      return createErrorResponse(res, '账号状态异常，请联系管理员', 401);
    }

    const authPayload = await buildOperationAuthResponse(staffWithRelations);
    return createSuccessResponse(res, authPayload);
  } catch (error) {
    console.error('运营系统登录失败:', error);
    return createErrorResponse(res, '登录失败', 500);
  }
}

// C端用户：退出登录
export async function userLogout(req: Request, res: Response) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return createErrorResponse(res, '未提供认证令牌', 401);
    }

    // 将token加入黑名单
    await addTokenToBlacklist(token);

    return createSuccessResponse(res, { message: '退出登录成功' });
  } catch (error) {
    console.error('退出登录失败:', error);
    return createErrorResponse(res, '退出登录失败', 500);
  }
}

// 运营系统：退出登录
export async function operationLogout(req: Request, res: Response) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return createErrorResponse(res, '未提供认证令牌', 401);
    }

    // 将token加入黑名单
    await addTokenToBlacklist(token);

    return createSuccessResponse(res, { message: '退出登录成功' });
  } catch (error) {
    console.error('退出登录失败:', error);
    return createErrorResponse(res, '退出登录失败', 500);
  }
}

// 获取当前用户信息（小程序端）
export async function getCurrentUser(req: Request, res: Response) {
  try {
    if (!req.user) {
      return createErrorResponse(res, '未认证', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        nickname: true,
        avatarUrl: true,
        role: true,
        phone: true,
        email: true,
        isVerified: true,
        creditScore: true,
        communityIds: true,
      },
    });

    if (!user) {
      return createErrorResponse(res, '用户不存在', 404);
    }
 
    const authPayload = buildUserAuthResponse(user);
    return createSuccessResponse(res, authPayload);
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return createErrorResponse(res, '获取用户信息失败', 500);
  }
}

// 获取当前运营人员信息
export async function getCurrentStaff(req: Request, res: Response) {
  try {
    if (!req.operationStaff) {
      return createErrorResponse(res, '未认证', 401);
    }

    const staff = await loadOperationStaffAuthContext(req.operationStaff.id);

    if (!staff || !staff.isActive) {
      return createErrorResponse(res, '运营人员不存在', 404);
    }

    const authPayload = await buildOperationAuthResponse(staff);
    return createSuccessResponse(res, authPayload);
  } catch (error) {
    console.error('获取运营人员信息失败:', error);
    return createErrorResponse(res, '获取运营人员信息失败', 500);
  }
}

export async function refreshUserToken(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return createErrorResponse(res, 'refreshToken不能为空', 400);
    }

    const payload = verifyRefreshToken(refreshToken);

    if (!payload || !isUserToken(payload)) {
      return createErrorResponse(res, 'refreshToken无效或已过期', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        nickname: true,
        avatarUrl: true,
        role: true,
        phone: true,
        email: true,
        isVerified: true,
        creditScore: true,
        communityIds: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      return createErrorResponse(res, '用户不存在或已被禁用', 401);
    }

    const authPayload = buildUserAuthResponse(user);
    return createSuccessResponse(res, authPayload);
  } catch (error) {
    console.error('刷新用户token失败:', error);
    return createErrorResponse(res, '刷新token失败', 500);
  }
}

export async function refreshOperationToken(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return createErrorResponse(res, 'refreshToken不能为空', 400);
    }

    const payload = verifyRefreshToken(refreshToken);

    if (!payload || !isOperationToken(payload)) {
      return createErrorResponse(res, 'refreshToken无效或已过期', 401);
    }

    const staff = await loadOperationStaffAuthContext(payload.staffId);

    if (!staff || !staff.isActive) {
      return createErrorResponse(res, '运营人员不存在或已被禁用', 401);
    }

    const authPayload = await buildOperationAuthResponse(staff);
    return createSuccessResponse(res, authPayload);
  } catch (error) {
    console.error('刷新运营端token失败:', error);
    return createErrorResponse(res, '刷新token失败', 500);
  }
}
