import { Request, Response } from 'express';
import prisma from '../lib/prisma';

/**
 * 获取用户信息
 */
export async function getUserProfile(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: '未认证' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
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

/**
 * 更新用户信息
 */
export async function updateUserProfile(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: '未认证' });
    }

    const { nickname, avatarUrl, phone } = req.body;

    const updateData: any = {};
    if (nickname !== undefined) updateData.nickname = nickname;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (phone !== undefined) {
      // 检查手机号是否已被使用
      if (phone) {
        const existingUser = await prisma.user.findUnique({
          where: { phone },
        });
        if (existingUser && existingUser.id !== userId) {
          return res.status(400).json({ error: '手机号已被使用' });
        }
      }
      updateData.phone = phone;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
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
      },
    });

    res.json({ user });
  } catch (error) {
    console.error('更新用户信息失败:', error);
    res.status(500).json({ error: '更新用户信息失败' });
  }
}

/**
 * 获取用户发布的商品
 */
export async function getUserProducts(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: '未认证' });
    }

    const {
      page = '1',
      limit = '20',
      status,
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      ownerId: userId,
    };

    if (status) {
      where.status = status;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          community: {
            select: {
              id: true,
              name: true,
              location: true,
            },
          },
          _count: {
            select: {
              orders: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('获取用户商品失败:', error);
    res.status(500).json({ error: '获取用户商品失败' });
  }
}

/**
 * 获取用户的订单
 */
export async function getUserOrders(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: '未认证' });
    }

    const {
      page = '1',
      limit = '20',
      role = 'buyer',
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (role === 'buyer') {
      where.buyerId = userId;
    } else {
      where.sellerId = userId;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: {
              id: true,
              title: true,
              images: true,
              price: true,
              deposit: true,
            },
          },
          buyer: {
            select: {
              id: true,
              nickname: true,
              avatarUrl: true,
            },
          },
          seller: {
            select: {
              id: true,
              nickname: true,
              avatarUrl: true,
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('获取用户订单失败:', error);
    res.status(500).json({ error: '获取用户订单失败' });
  }
}

