import { Request, Response } from 'express';
import prisma from '../lib/prisma';

/**
 * 获取订单列表
 */
export async function getOrders(req: Request, res: Response) {
  try {
    const {
      page = '1',
      limit = '20',
      status,
      type,
      buyerId,
      sellerId,
      search,
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    if (buyerId) {
      where.buyerId = buyerId;
    }

    if (sellerId) {
      where.sellerId = sellerId;
    }

    if (search) {
      where.OR = [
        { id: { contains: search as string } },
        { product: { title: { contains: search as string } } },
      ];
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
            },
          },
          buyer: {
            select: {
              id: true,
              nickname: true,
              phone: true,
            },
          },
          seller: {
            select: {
              id: true,
              nickname: true,
              phone: true,
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
    console.error('获取订单列表失败:', error);
    res.status(500).json({ error: '获取订单列表失败' });
  }
}

/**
 * 获取订单详情
 */
export async function getOrder(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            owner: {
              select: {
                id: true,
                nickname: true,
                phone: true,
              },
            },
          },
        },
        buyer: {
          select: {
            id: true,
            nickname: true,
            phone: true,
            email: true,
          },
        },
        seller: {
          select: {
            id: true,
            nickname: true,
            phone: true,
            email: true,
          },
        },
        depositRecord: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: '订单不存在' });
    }

    res.json({ order });
  } catch (error) {
    console.error('获取订单详情失败:', error);
    res.status(500).json({ error: '获取订单详情失败' });
  }
}

/**
 * 更新订单状态
 */
export async function updateOrderStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status, remark } = req.body;
    const staff = req.operationStaff;

    if (!staff) {
      return res.status(401).json({ error: '未认证' });
    }

    await prisma.order.update({
      where: { id },
      data: { status, remark },
    });

    // 记录操作日志
    await prisma.operationLog.create({
      data: {
        staffId: staff.id,
        action: 'update_order_status',
        targetType: 'order',
        targetId: id,
        details: JSON.stringify({ status, remark }),
        ip: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    res.json({ success: true, message: '订单状态已更新' });
  } catch (error) {
    console.error('更新订单状态失败:', error);
    res.status(500).json({ error: '更新订单状态失败' });
  }
}

