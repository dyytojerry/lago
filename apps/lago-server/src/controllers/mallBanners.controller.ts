import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';
import { createSuccessResponse, createErrorResponse } from '../lib/response';

export async function listMallBanners(req: Request, res: Response) {
  try {
    const {
      page = 1,
      limit = 50,
      status,
    } = req.query as { page?: number; limit?: number; status?: string };

    const pageNum = Math.max(page ?? 1, 1);
    const limitNum = Math.min(Math.max(limit ?? 50, 1), 200);
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.MallBannerWhereInput = {};
    if (status) {
      where.status = status as Prisma.MallBannerWhereInput['status'];
    }

    const [banners, total] = await Promise.all([
      prisma.mallBanner.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: [
          { sortOrder: 'asc' },
          { createdAt: 'desc' },
        ],
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
      prisma.mallBanner.count({ where }),
    ]);

    return createSuccessResponse(res, {
      banners,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('获取商城钻石位失败:', error);
    return createErrorResponse(res, '获取商城钻石位失败', 500);
  }
}

export async function createMallBanner(req: Request, res: Response) {
  try {
    const {
      title,
      imageUrl,
      linkUrl,
      status = 'active',
      sortOrder = 0,
    } = req.body as {
      title: string;
      imageUrl: string;
      linkUrl?: string;
      status?: string;
      sortOrder?: number;
    };

    const data: Prisma.MallBannerCreateInput = {
      title,
      imageUrl,
      linkUrl,
      status: status as Prisma.MallBannerCreateInput['status'],
      sortOrder,
    };

    if (req.operationStaff?.id) {
      data.createdBy = {
        connect: { id: req.operationStaff.id },
      };
    }

    const banner = await prisma.mallBanner.create({ data });

    return createSuccessResponse(res, { banner }, 201);
  } catch (error) {
    console.error('创建商城钻石位失败:', error);
    return createErrorResponse(res, '创建商城钻石位失败', 500);
  }
}

export async function updateMallBanner(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const {
      title,
      imageUrl,
      linkUrl,
      status,
      sortOrder,
    } = req.body as {
      title?: string;
      imageUrl?: string;
      linkUrl?: string;
      status?: string;
      sortOrder?: number;
    };

    const updateData: Prisma.MallBannerUpdateInput = {};

    if (title !== undefined) updateData.title = title;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (linkUrl !== undefined) updateData.linkUrl = linkUrl;
    if (status !== undefined) {
      updateData.status = status as Prisma.MallBannerUpdateInput['status'];
    }
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

    const banner = await prisma.mallBanner.update({
      where: { id },
      data: updateData,
    });

    return createSuccessResponse(res, { banner });
  } catch (error: any) {
    console.error('更新商城钻石位失败:', error);
    if (error?.code === 'P2025') {
      return createErrorResponse(res, '商城钻石位不存在', 404);
    }
    return createErrorResponse(res, '更新商城钻石位失败', 500);
  }
}

export async function removeMallBanner(req: Request, res: Response) {
  try {
    const { id } = req.params;

    await prisma.mallBanner.delete({ where: { id } });

    return createSuccessResponse(res, { message: '商城钻石位已删除' });
  } catch (error: any) {
    console.error('删除商城钻石位失败:', error);
    if (error?.code === 'P2025') {
      return createErrorResponse(res, '商城钻石位不存在', 404);
    }
    return createErrorResponse(res, '删除商城钻石位失败', 500);
  }
}
