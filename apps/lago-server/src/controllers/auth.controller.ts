import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { generateUserToken, generateOperationToken, hashPassword, comparePassword } from '../lib/auth';

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
      return res.status(403).json({ error: '账号已被禁用' });
    }

    const token = generateUserToken({
      userId: user.id,
      role: user.role,
    });

    res.json({
      token,
      user: {
        id: user.id,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
        role: user.role,
        phone: user.phone,
        isVerified: user.isVerified,
        creditScore: user.creditScore,
      },
    });
  } catch (error) {
    console.error('微信登录失败:', error);
    res.status(500).json({ error: '登录失败' });
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
      return res.status(401).json({ error: '手机号或密码错误' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: '账号已被禁用' });
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: '手机号或密码错误' });
    }

    const token = generateUserToken({
      userId: user.id,
      role: user.role,
    });

    res.json({
      token,
      user: {
        id: user.id,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
        role: user.role,
        phone: user.phone,
        isVerified: user.isVerified,
        creditScore: user.creditScore,
      },
    });
  } catch (error) {
    console.error('手机号登录失败:', error);
    res.status(500).json({ error: '登录失败' });
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
      return res.status(400).json({ error: '手机号已被注册' });
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

    const token = generateUserToken({
      userId: user.id,
      role: user.role,
    });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
        role: user.role,
        phone: user.phone,
        isVerified: user.isVerified,
        creditScore: user.creditScore,
      },
    });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({ error: '注册失败' });
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
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    if (!staff.isActive) {
      return res.status(403).json({ error: '账号已被禁用' });
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
      return res.status(401).json({ error: '用户名或密码错误' });
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

    const token = generateOperationToken({
      staffId: staff.id,
      role: staff.role,
    });

    res.json({
      token,
      staff: {
        id: staff.id,
        username: staff.username,
        email: staff.email,
        role: staff.role,
        realName: staff.realName,
      },
    });
  } catch (error) {
    console.error('运营系统登录失败:', error);
    res.status(500).json({ error: '登录失败' });
  }
}

// 获取当前用户信息（小程序端）
export async function getCurrentUser(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
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
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json({ user });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({ error: '获取用户信息失败' });
  }
}

// 获取当前运营人员信息
export async function getCurrentStaff(req: Request, res: Response) {
  try {
    if (!req.operationStaff) {
      return res.status(401).json({ error: '未认证' });
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
      return res.status(404).json({ error: '运营人员不存在' });
    }

    res.json({ staff });
  } catch (error) {
    console.error('获取运营人员信息失败:', error);
    res.status(500).json({ error: '获取运营人员信息失败' });
  }
}

