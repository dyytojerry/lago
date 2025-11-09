import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { createSuccessResponse, createErrorResponse } from '../lib/response';

/**
 * 获取商品列表
 */
export async function getProducts(req: Request, res: Response) {
  try {
    const { page = 1, limit = 20, status, category, search, ownerId } = req.query as {
      page?: number;
      limit?: number;
      status?: string;
      category?: string;
      search?: string;
      ownerId?: string;
    };

    const pageNum = page ?? 1;
    const limitNum = limit ?? 20;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (category) {
      where.category = category;
    }

    if (ownerId) {
      where.ownerId = ownerId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string } },
        { description: { contains: search as string } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: {
            select: {
              id: true,
              nickname: true,
              phone: true,
              role: true,
            },
          },
          community: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return createSuccessResponse(res, {
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('获取商品列表失败:', error);
    return createErrorResponse(res, '获取商品列表失败', 500);
  }
}

/**
 * 获取商品详情
 */
export async function getProduct(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            nickname: true,
            phone: true,
            email: true,
            role: true,
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
        orders: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            buyer: {
              select: {
                id: true,
                nickname: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      return createErrorResponse(res, '商品不存在', 404);
    }

    return createSuccessResponse(res, { product });
  } catch (error) {
    console.error('获取商品详情失败:', error);
    return createErrorResponse(res, '获取商品详情失败', 500);
  }
}

/**
 * 审核商品
 */
export async function approveProduct(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { action, reason } = req.body; // action: 'approve' | 'reject'
    const staff = req.operationStaff;

    if (!staff) {
      return createErrorResponse(res, '未认证', 401);
    }

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return createErrorResponse(res, '商品不存在', 404);
    }

    if (product.status !== 'pending') {
      return createErrorResponse(res, '商品状态不正确', 400);
    }

    // 更新商品状态
    const updateData: any = {};
    if (action === 'approve') {
      updateData.status = 'active';
    } else if (action === 'reject') {
      updateData.status = 'offline';
    }

    await prisma.product.update({
      where: { id },
      data: updateData,
    });

    // 记录操作日志
    await prisma.operationLog.create({
      data: {
        staffId: staff.id,
        action: `product_${action}`,
        targetType: 'product',
        targetId: id,
        details: JSON.stringify({ reason }),
        ip: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    return createSuccessResponse(res, { message: `商品已${action === 'approve' ? '通过' : '拒绝'}` });
  } catch (error) {
    console.error('审核商品失败:', error);
    return createErrorResponse(res, '审核商品失败', 500);
  }
}

/**
 * 批量审核商品
 */
export async function batchApproveProducts(req: Request, res: Response) {
  try {
    const { ids, action, reason } = req.body;
    const staff = req.operationStaff;

    if (!staff || !Array.isArray(ids) || ids.length === 0) {
      return createErrorResponse(res, '参数错误', 400);
    }

    const updateData: any = {};
    if (action === 'approve') {
      updateData.status = 'active';
    } else if (action === 'reject') {
      updateData.status = 'offline';
    }

    await prisma.product.updateMany({
      where: {
        id: { in: ids },
        status: 'pending',
      },
      data: updateData,
    });

    // 记录操作日志
    await prisma.operationLog.createMany({
      data: ids.map((productId: string) => ({
        staffId: staff.id,
        action: `product_batch_${action}`,
        targetType: 'product',
        targetId: productId,
        details: JSON.stringify({ reason }),
        ip: req.ip,
        userAgent: req.get('user-agent'),
      })),
    });

    return createSuccessResponse(res, { message: `已${action === 'approve' ? '通过' : '拒绝'} ${ids.length} 个商品` });
  } catch (error) {
    console.error('批量审核商品失败:', error);
    return createErrorResponse(res, '批量审核商品失败', 500);
  }
}

