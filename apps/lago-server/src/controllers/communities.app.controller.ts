import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { createSuccessResponse, createErrorResponse } from '../lib/response';

/**
 * 获取附近小区
 */
export async function getNearbyCommunities(req: Request, res: Response) {
  try {
    const {
      latitude,
      longitude,
      radius = 5000,
    } = req.query;

    // 如果提供了经纬度，可以根据地理位置搜索
    // 这里简化处理，返回所有激活的小区
    const where: any = {
      isActive: true,
    };

    const communities = await prisma.community.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 获取统计信息
    const communityIds = communities.map(c => c.id);
    const _count = communityIds.length > 0 ? {
      products: await prisma.product.count({ 
        where: { 
          communityId: { in: communityIds },
          status: 'active',
        } 
      }),
    } : { products: 0 };

    return createSuccessResponse(res, { 
      communities,
      _count,
    });
  } catch (error) {
    console.error('获取附近小区失败:', error);
    return createErrorResponse(res, '获取附近小区失败', 500);
  }
}

/**
 * 获取小区详情
 */
export async function getCommunity(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const community = await prisma.community.findUnique({
      where: { id },
    });

    if (!community) {
      return createErrorResponse(res, '小区不存在', 404);
    }

    // 获取统计信息
    const _count = {
      products: await prisma.product.count({ 
        where: { 
          communityId: id,
          status: 'active',
        } 
      }),
    };

    return createSuccessResponse(res, { 
      community,
      _count,
    });
  } catch (error) {
    console.error('获取小区详情失败:', error);
    return createErrorResponse(res, '获取小区详情失败', 500);
  }
}

