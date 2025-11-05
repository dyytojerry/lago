import { Request, Response } from 'express';
import prisma from '../lib/prisma';

/**
 * 获取用户列表
 */
export async function getUsers(req: Request, res: Response) {
  try {
    const {
      page = '1',
      limit = '20',
      role,
      status,
      search,
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (role) {
      where.role = role;
    }

    if (status !== undefined) {
      if (status === 'active') {
        where.isActive = true;
      } else if (status === 'inactive') {
        where.isActive = false;
      }
    }

    if (search) {
      where.OR = [
        { nickname: { contains: search as string } },
        { phone: { contains: search as string } },
        { email: { contains: search as string } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          nickname: true,
          avatarUrl: true,
          phone: true,
          email: true,
          role: true,
          creditScore: true,
          isVerified: true,
          isActive: true,
          communityIds: true,
          createdAt: true,
          _count: {
            select: {
              products: true,
              ordersAsBuyer: true,
              ordersAsSeller: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({ error: '获取用户列表失败' });
  }
}

/**
 * 获取用户详情
 */
export async function getUser(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        nickname: true,
        avatarUrl: true,
        phone: true,
        email: true,
        role: true,
        creditScore: true,
        isVerified: true,
        isActive: true,
        communityIds: true,
        wechatOpenid: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            products: true,
            ordersAsBuyer: true,
            ordersAsSeller: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 获取用户商品列表（最近10个）
    const products = await prisma.product.findMany({
      where: { ownerId: id },
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        price: true,
        createdAt: true,
      },
    });

    // 获取用户订单列表（最近10个）
    const orders = await prisma.order.findMany({
      where: {
        OR: [{ buyerId: id }, { sellerId: id }],
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        status: true,
        amount: true,
        createdAt: true,
        buyer: {
          select: { id: true, nickname: true },
        },
        seller: {
          select: { id: true, nickname: true },
        },
      },
    });

    res.json({
      user,
      products,
      orders,
    });
  } catch (error) {
    console.error('获取用户详情失败:', error);
    res.status(500).json({ error: '获取用户详情失败' });
  }
}

/**
 * 更新用户状态
 */
export async function updateUserStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { isActive, creditScore } = req.body;
    const staff = req.operationStaff;

    if (!staff) {
      return res.status(401).json({ error: '未认证' });
    }

    const updateData: any = {};
    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }
    if (creditScore !== undefined) {
      updateData.creditScore = parseInt(creditScore);
    }

    await prisma.user.update({
      where: { id },
      data: updateData,
    });

    // 记录操作日志
    await prisma.operationLog.create({
      data: {
        staffId: staff.id,
        action: 'update_user_status',
        targetType: 'user',
        targetId: id,
        details: JSON.stringify(updateData),
        ip: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    res.json({ success: true, message: '用户状态已更新' });
  } catch (error) {
    console.error('更新用户状态失败:', error);
    res.status(500).json({ error: '更新用户状态失败' });
  }
}

