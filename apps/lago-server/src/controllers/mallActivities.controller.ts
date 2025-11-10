import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';
import { createSuccessResponse, createErrorResponse } from '../lib/response';

function normalizeCommunityIds(ids: string[] = []) {
  const set = new Set(ids.filter(Boolean));
  return Array.from(set);
}

function parseDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function listMallActivities(req: Request, res: Response) {
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

    const where: Prisma.MallActivityWhereInput = {};

    if (status) {
      where.status = status as Prisma.MallActivityWhereInput['status'];
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [activities, total] = await Promise.all([
      prisma.mallActivity.findMany({
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
      prisma.mallActivity.count({ where }),
    ]);

    return createSuccessResponse(res, {
      activities,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('获取商城活动列表失败:', error);
    return createErrorResponse(res, '获取商城活动列表失败', 500);
  }
}

export async function createMallActivity(req: Request, res: Response) {
  try {
    const {
      title,
      description,
      coverImage,
      startTime,
      endTime,
      visibleCommunityIds = [],
      status = 'draft',
    } = req.body as {
      title: string;
      description?: string;
      coverImage?: string;
      startTime?: string;
      endTime?: string;
      visibleCommunityIds?: string[];
      status?: string;
    };

    const data: Prisma.MallActivityCreateInput = {
      title,
      description,
      coverImage,
      startTime: parseDate(startTime) ?? undefined,
      endTime: parseDate(endTime) ?? undefined,
      visibleCommunityIds: normalizeCommunityIds(visibleCommunityIds),
      status: status as Prisma.MallActivityCreateInput['status'],
    };

    if (req.operationStaff?.id) {
      data.createdBy = {
        connect: { id: req.operationStaff.id },
      };
    }

    const activity = await prisma.mallActivity.create({ data });

    return createSuccessResponse(res, { activity }, 201);
  } catch (error) {
    console.error('创建商城活动失败:', error);
    return createErrorResponse(res, '创建商城活动失败', 500);
  }
}

export async function updateMallActivity(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      coverImage,
      startTime,
      endTime,
      visibleCommunityIds,
      status,
    } = req.body as {
      title?: string;
      description?: string;
      coverImage?: string;
      startTime?: string;
      endTime?: string;
      visibleCommunityIds?: string[];
      status?: string;
    };

    const updateData: Prisma.MallActivityUpdateInput = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (startTime !== undefined) updateData.startTime = parseDate(startTime) ?? null;
    if (endTime !== undefined) updateData.endTime = parseDate(endTime) ?? null;
    if (visibleCommunityIds !== undefined) {
      updateData.visibleCommunityIds = {
        set: normalizeCommunityIds(visibleCommunityIds),
      };
    }
    if (status !== undefined) {
      updateData.status = status as Prisma.MallActivityUpdateInput['status'];
    }

    const activity = await prisma.mallActivity.update({
      where: { id },
      data: updateData,
    });

    return createSuccessResponse(res, { activity });
  } catch (error: any) {
    console.error('更新商城活动失败:', error);
    if (error?.code === 'P2025') {
      return createErrorResponse(res, '商城活动不存在', 404);
    }
    return createErrorResponse(res, '更新商城活动失败', 500);
  }
}

export async function removeMallActivity(req: Request, res: Response) {
  try {
    const { id } = req.params;

    await prisma.mallActivity.update({
      where: { id },
      data: {
        status: 'offline',
      },
    });

    return createSuccessResponse(res, { message: '商城活动已下架' });
  } catch (error: any) {
    console.error('下架商城活动失败:', error);
    if (error?.code === 'P2025') {
      return createErrorResponse(res, '商城活动不存在', 404);
    }
    return createErrorResponse(res, '下架商城活动失败', 500);
  }
}
