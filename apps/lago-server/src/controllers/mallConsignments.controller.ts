import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { createSuccessResponse, createErrorResponse } from '../lib/response';

export async function listConsignmentOrders(req: Request, res: Response) {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      search,
    } = req.query as {
      page?: number;
      limit?: number;
      status?: string;
      search?: string;
    };

    const pageNum = Math.max(page ?? 1, 1);
    const limitNum = Math.min(Math.max(limit ?? 20, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { productTitle: { contains: search, mode: 'insensitive' } },
        { user: { nickname: { contains: search, mode: 'insensitive' } } },
        { user: { phone: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.consignmentOrder.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              nickname: true,
              phone: true,
              email: true,
            },
          },
          assignedStaff: {
            select: {
              id: true,
              username: true,
              realName: true,
            },
          },
          mallProduct: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
        },
      }),
      prisma.consignmentOrder.count({ where }),
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
    console.error('获取寄售订单失败:', error);
    return createErrorResponse(res, '获取寄售订单失败', 500);
  }
}

export async function updateConsignmentOrder(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const {
      status,
      assignedStaffId,
      mallProductId,
    } = req.body as {
      status?: string;
      assignedStaffId?: string;
      mallProductId?: string | null;
    };

    const updateData: any = {};

    if (status !== undefined) {
      updateData.status = status;
    }

    if (assignedStaffId === undefined && req.operationStaff?.id) {
      updateData.assignedStaff = {
        connect: { id: req.operationStaff.id },
      };
    } else if (assignedStaffId) {
      updateData.assignedStaff = {
        connect: { id: assignedStaffId },
      };
    } else if (assignedStaffId === null) {
      updateData.assignedStaff = {
        disconnect: true,
      };
    }

    if (mallProductId !== undefined) {
      updateData.mallProduct = mallProductId
        ? { connect: { id: mallProductId } }
        : { disconnect: true };
    }

    const order = await prisma.consignmentOrder.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            phone: true,
            email: true,
          },
        },
        assignedStaff: {
          select: {
            id: true,
            username: true,
            realName: true,
          },
        },
        mallProduct: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });

    return createSuccessResponse(res, { order });
  } catch (error: any) {
    console.error('更新寄售订单失败:', error);
    if (error?.code === 'P2025') {
      return createErrorResponse(res, '寄售订单不存在', 404);
    }
    return createErrorResponse(res, '更新寄售订单失败', 500);
  }
}
