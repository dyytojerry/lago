import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { createSuccessResponse, createErrorResponse } from '../lib/response';

/**
 * 获取订单列表（小程序端）
 */
export async function getOrdersForApp(req: Request, res: Response) {
  try {
    const {
      page = '1',
      limit = '20',
      status,
      type,
      role = 'buyer',
    } = req.query;

    const userId = req.user?.id;
    if (!userId) {
      return createErrorResponse(res, '未认证', 401);
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (role === 'buyer') {
      where.buyerId = userId;
    } else {
      where.sellerId = userId;
    }

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
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
              phone: true,
            },
          },
          seller: {
            select: {
              id: true,
              nickname: true,
              avatarUrl: true,
              phone: true,
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return createSuccessResponse(res, {
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
    return createErrorResponse(res, '获取订单列表失败', 500);
  }
}

/**
 * 获取订单详情（小程序端）
 */
export async function getOrderForApp(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      return createErrorResponse(res, '未认证', 401);
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            owner: {
              select: {
                id: true,
                nickname: true,
                avatarUrl: true,
                phone: true,
                creditScore: true,
                isVerified: true,
              },
            },
            community: {
              select: {
                id: true,
                name: true,
                location: true,
                address: true,
              },
            },
          },
        },
        buyer: {
          select: {
            id: true,
            nickname: true,
            avatarUrl: true,
            phone: true,
            email: true,
          },
        },
        seller: {
          select: {
            id: true,
            nickname: true,
            avatarUrl: true,
            phone: true,
            email: true,
          },
        },
        depositRecord: true,
      },
    });

    if (!order) {
      return createErrorResponse(res, '订单不存在', 404);
    }

    // 检查权限：只有买家或卖家可以查看
    if (order.buyerId !== userId && order.sellerId !== userId) {
      return createErrorResponse(res, '无权限查看此订单', 403);
    }

    return createSuccessResponse(res, { order });
  } catch (error) {
    console.error('获取订单详情失败:', error);
    return createErrorResponse(res, '获取订单详情失败', 500);
  }
}

/**
 * 创建订单
 */
export async function createOrder(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return createErrorResponse(res, '未认证', 401);
    }

    const {
      productId,
      type,
      startDate,
      endDate,
      deliveryType,
      deliveryAddress,
      remark,
    } = req.body;

    // 检查商品是否存在且可购买
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return createErrorResponse(res, '商品不存在', 404);
    }

    if (product.status !== 'active') {
      return createErrorResponse(res, '商品不可购买', 400);
    }

    if (product.ownerId === userId) {
      return createErrorResponse(res, '不能购买自己的商品', 400);
    }

    // 检查商品类型是否匹配
    if (type === 'rent' && product.type !== 'rent' && product.type !== 'both') {
      return createErrorResponse(res, '该商品不支持租赁', 400);
    }

    if (type === 'sell' && product.type !== 'sell' && product.type !== 'both') {
      return createErrorResponse(res, '该商品不支持购买', 400);
    }

    // 计算订单金额
    let amount = product.price;
    if (type === 'rent' && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      amount = product.price * days;
    }

    // 创建订单
    const order = await prisma.order.create({
      data: {
        productId,
        buyerId: userId,
        sellerId: product.ownerId,
        type,
        amount,
        deposit: type === 'rent' ? product.deposit : null,
        status: 'pending',
        startDate: type === 'rent' ? new Date(startDate) : null,
        endDate: type === 'rent' ? new Date(endDate) : null,
        deliveryType,
        deliveryAddress,
        remark,
      },
      include: {
        product: {
          include: {
            owner: {
              select: {
                id: true,
                nickname: true,
                avatarUrl: true,
                phone: true,
              },
            },
            community: {
              select: {
                id: true,
                name: true,
                location: true,
              },
            },
          },
        },
        buyer: {
          select: {
            id: true,
            nickname: true,
            avatarUrl: true,
            phone: true,
          },
        },
        seller: {
          select: {
            id: true,
            nickname: true,
            avatarUrl: true,
            phone: true,
          },
        },
      },
    });

    // 如果是租赁订单，创建押金记录
    if (type === 'rent' && product.deposit) {
      await prisma.deposit.create({
        data: {
          orderId: order.id,
          amount: product.deposit,
        },
      });
    }

    return createSuccessResponse(res, { order }, 201);
  } catch (error) {
    console.error('创建订单失败:', error);
    return createErrorResponse(res, '创建订单失败', 500);
  }
}

/**
 * 更新订单状态（小程序端）
 */
export async function updateOrderStatusForApp(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user?.id;
    if (!userId) {
      return createErrorResponse(res, '未认证', 401);
    }

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return createErrorResponse(res, '订单不存在', 404);
    }

    // 检查权限：只有买家或卖家可以更新
    if (order.buyerId !== userId && order.sellerId !== userId) {
      return createErrorResponse(res, '无权限更新此订单', 403);
    }

    // 状态流转验证
    const validTransitions: Record<string, string[]> = {
      pending: ['paid', 'cancelled'],
      paid: ['confirmed', 'cancelled'],
      confirmed: ['completed', 'cancelled'],
      completed: [],
      cancelled: [],
      refunded: [],
    };

    if (!validTransitions[order.status]?.includes(status)) {
      return createErrorResponse(res, `订单状态不能从 ${order.status} 变更为 ${status}`, 400);
    }

    await prisma.order.update({
      where: { id },
      data: { status },
    });

    return createSuccessResponse(res, { message: '订单状态已更新' });
  } catch (error) {
    console.error('更新订单状态失败:', error);
    return createErrorResponse(res, '更新订单状态失败', 500);
  }
}

/**
 * 取消订单
 */
export async function cancelOrder(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      return createErrorResponse(res, '未认证', 401);
    }

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return createErrorResponse(res, '订单不存在', 404);
    }

    // 检查权限
    if (order.buyerId !== userId && order.sellerId !== userId) {
      return createErrorResponse(res, '无权限取消此订单', 403);
    }

    // 只有待支付或已支付的订单可以取消
    if (!['pending', 'paid'].includes(order.status)) {
      return createErrorResponse(res, '当前订单状态无法取消', 400);
    }

    await prisma.order.update({
      where: { id },
      data: { status: 'cancelled' },
    });

    // 如果是已支付订单，需要退款
    if (order.status === 'paid') {
      // TODO: 实现退款逻辑
    }

    return createSuccessResponse(res, { message: '订单已取消' });
  } catch (error) {
    console.error('取消订单失败:', error);
    return createErrorResponse(res, '取消订单失败', 500);
  }
}

