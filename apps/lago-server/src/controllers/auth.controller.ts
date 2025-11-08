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

function buildOperationAuthResponse(staff: any) {
  const accessToken = generateOperationToken({ staffId: staff.id, role: staff.role });
  const refreshToken = generateOperationRefreshToken({ staffId: staff.id, role: staff.role });

  return {
    accessToken,
    refreshToken,
    staff: {
      id: staff.id,
      username: staff.username,
      email: staff.email,
      role: staff.role,
      realName: staff.realName,
    },
  };
}

// 通用登录接口（支持手机号/邮箱/微信ID + 密码）
export async function universalLogin(req: Request, res: Response) {
  try {
    const { identifier, password, wechatOpenid } = req.body;

    // 如果没有提供任何标识符
    if (!identifier && !wechatOpenid) {
      return createErrorResponse(res, '请提供登录标识（手机号/邮箱/微信ID）', 400);
    }

    let user = null;

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
    } else if (identifier) {
      // 通过手机号、邮箱或微信ID查找用户
      const isEmail = identifier.includes('@');
      const isPhone = /^1[3-9]\d{9}$/.test(identifier);

      if (isEmail) {
        user = await prisma.user.findUnique({
          where: { email: identifier },
        });
      } else if (isPhone) {
        user = await prisma.user.findUnique({
          where: { phone: identifier },
        });
      } else {
        // 可能是微信ID
        user = await prisma.user.findUnique({
          where: { wechatOpenid: identifier },
        });
      }

      // 如果用户不存在且提供了密码，创建新用户
      if (!user && password) {
        if (isEmail) {
          user = await prisma.user.create({
            data: {
              email: identifier,
              password: await hashPassword(password),
              role: 'user',
            },
          });
        } else if (isPhone) {
          user = await prisma.user.create({
            data: {
              phone: identifier,
              password: await hashPassword(password),
              role: 'user',
            },
          });
        } else {
          return createErrorResponse(res, '无效的登录标识', 400);
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
            password: await hashPassword(password),
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

    const authPayload = buildOperationAuthResponse(staff);
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

    const staff = await prisma.operationStaff.findUnique({
      where: { id: req.operationStaff.id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        realName: true,
        phone: true,
        lastLoginAt: true,
      },
    });

    if (!staff) {
      return createErrorResponse(res, '运营人员不存在', 404);
    }
 
    const authPayload = buildOperationAuthResponse(staff);
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
      return createErrorResponse(res, 'refreshToken无效或已过期', 422);
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
      return createErrorResponse(res, '用户不存在或已被禁用', 422);
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
      return createErrorResponse(res, 'refreshToken无效或已过期', 422);
    }

    const staff = await prisma.operationStaff.findUnique({
      where: { id: payload.staffId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        realName: true,
        isActive: true,
      },
    });

    if (!staff || !staff.isActive) {
      return createErrorResponse(res, '运营人员不存在或已被禁用', 422);
    }

    const authPayload = buildOperationAuthResponse(staff);
    return createSuccessResponse(res, authPayload);
  } catch (error) {
    console.error('刷新运营端token失败:', error);
    return createErrorResponse(res, '刷新token失败', 500);
  }
}
