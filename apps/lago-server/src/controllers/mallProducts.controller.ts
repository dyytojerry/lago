import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';
import { createSuccessResponse, createErrorResponse } from '../lib/response';

function normalizeCommunityIds(ids: string[] = []) {
  const set = new Set(ids.filter(Boolean));
  return Array.from(set);
}

export async function listMallProducts(req: Request, res: Response) {
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

    const where: Prisma.MallProductWhereInput = {};

    if (status) {
      where.status = status as Prisma.MallProductWhereInput['status'];
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.mallProduct.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: {
            select: {
              id: true,
              username: true,
              realName: true,
            },
          },
        },
      }),
      prisma.mallProduct.count({ where }),
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
    console.error('获取商城商品列表失败:', error);
    return createErrorResponse(res, '获取商城商品列表失败', 500);
  }
}

export async function createMallProduct(req: Request, res: Response) {
  try {
    const {
      title,
      description,
      price,
      images = [],
      visibleCommunityIds = [],
      status = 'draft',
    } = req.body as {
      title: string;
      description?: string;
      price: number;
      images?: string[];
      visibleCommunityIds?: string[];
      status?: string;
    };

    const data: Prisma.MallProductCreateInput = {
      title,
      description,
      price: new Prisma.Decimal(price),
      images,
      visibleCommunityIds: normalizeCommunityIds(visibleCommunityIds),
      status: status as Prisma.MallProductCreateInput['status'],
    };

    if (req.operationStaff?.id) {
      data.createdBy = {
        connect: { id: req.operationStaff.id },
      };
    }

    const product = await prisma.mallProduct.create({ data });

    return createSuccessResponse(res, { product }, 201);
  } catch (error) {
    console.error('创建商城商品失败:', error);
    return createErrorResponse(res, '创建商城商品失败', 500);
  }
}

export async function updateMallProduct(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      price,
      images,
      visibleCommunityIds,
      status,
    } = req.body as {
      title?: string;
      description?: string;
      price?: number;
      images?: string[];
      visibleCommunityIds?: string[];
      status?: string;
    };

    const updateData: Prisma.MallProductUpdateInput = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = new Prisma.Decimal(price);
    if (images !== undefined) {
      updateData.images = { set: images };
    }
    if (visibleCommunityIds !== undefined) {
      updateData.visibleCommunityIds = {
        set: normalizeCommunityIds(visibleCommunityIds),
      };
    }
    if (status !== undefined) {
      updateData.status = status as Prisma.MallProductUpdateInput['status'];
    }

    const product = await prisma.mallProduct.update({
      where: { id },
      data: updateData,
    });

    return createSuccessResponse(res, { product });
  } catch (error: any) {
    console.error('更新商城商品失败:', error);
    if (error?.code === 'P2025') {
      return createErrorResponse(res, '商城商品不存在', 404);
    }
    return createErrorResponse(res, '更新商城商品失败', 500);
  }
}

export async function removeMallProduct(req: Request, res: Response) {
  try {
    const { id } = req.params;

    await prisma.mallProduct.update({
      where: { id },
      data: {
        status: 'offline',
      },
    });

    return createSuccessResponse(res, { message: '商城商品已下架' });
  } catch (error: any) {
    console.error('下架商城商品失败:', error);
    if (error?.code === 'P2025') {
      return createErrorResponse(res, '商城商品不存在', 404);
    }
    return createErrorResponse(res, '下架商城商品失败', 500);
  }
}
