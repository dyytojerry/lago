import { Request, Response } from 'express';
import prisma from '../lib/prisma';

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
      include: {
        _count: {
          select: {
            products: {
              where: {
                status: 'active',
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({ communities });
  } catch (error) {
    console.error('获取附近小区失败:', error);
    res.status(500).json({ error: '获取附近小区失败' });
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
      include: {
        _count: {
          select: {
            products: {
              where: {
                status: 'active',
              },
            },
          },
        },
      },
    });

    if (!community) {
      return res.status(404).json({ error: '小区不存在' });
    }

    res.json({ community });
  } catch (error) {
    console.error('获取小区详情失败:', error);
    res.status(500).json({ error: '获取小区详情失败' });
  }
}

