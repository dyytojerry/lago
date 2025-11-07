import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { createSuccessResponse, createErrorResponse } from '../lib/response';

/**
 * 计算两点之间的距离（米）
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // 地球半径（米）
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * 获取附近小区（1公里内）
 */
export async function getNearbyCommunities(req: Request, res: Response) {
  try {
    const {
      latitude,
      longitude,
      radius = 1000, // 默认1公里
    } = req.query;

    if (!latitude || !longitude) {
      return createErrorResponse(res, '请提供经纬度', 400);
    }

    const lat = parseFloat(latitude as string);
    const lng = parseFloat(longitude as string);
    const radiusMeters = parseFloat(radius as string);

    // 获取所有激活的小区
    const allCommunities = await prisma.community.findMany({
      where: {
        isActive: true,
        // verificationStatus: 'approved', // 只返回已认证的小区
      },
      include: {
        province: { select: { name: true } },
        city: { select: { name: true } },
        district: { select: { name: true } },
        _count: {
          select: {
            members: true,
            products: {
              where: { status: 'active' },
            },
          },
        },
      },
    });

    // 计算距离并筛选
    const nearbyCommunities = allCommunities
      .map((community) => {
        const [communityLat, communityLng] = community.location.split(',').map(Number);
        const distance = calculateDistance(lat, lng, communityLat, communityLng);
        return {
          ...community,
          distance: Math.round(distance), // 距离（米）
        };
      })
      .filter((c) => c.distance <= radiusMeters)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 20); // 最多返回20个

    return createSuccessResponse(res, {
      communities: nearbyCommunities,
    });
  } catch (error) {
    console.error('获取附近小区失败:', error);
    return createErrorResponse(res, '获取附近小区失败', 500);
  }
}

/**
 * 搜索小区
 */
export async function searchCommunities(req: Request, res: Response) {
  try {
    const {
      search,
      provinceId,
      cityId,
      districtId,
      verificationStatus,
      page = '1',
      limit = '20',
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      isActive: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { address: { contains: search as string } },
      ];
    }

    if (provinceId) {
      where.provinceId = provinceId as string;
    }

    if (cityId) {
      where.cityId = cityId as string;
    }

    if (districtId) {
      where.districtId = districtId as string;
    }

    if (verificationStatus) {
      where.verificationStatus = verificationStatus;
    }

    const [communities, total] = await Promise.all([
      prisma.community.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          province: { select: { name: true } },
          city: { select: { name: true } },
          district: { select: { name: true } },
          _count: {
            select: {
              members: true,
              products: {
                where: { status: 'active' },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.community.count({ where }),
    ]);

    return createSuccessResponse(res, {
      communities,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('搜索小区失败:', error);
    return createErrorResponse(res, '搜索小区失败', 500);
  }
}

/**
 * 获取用户加入的小区
 */
export async function getUserCommunities(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return createErrorResponse(res, '未登录', 401);
    }

    const userCommunities = await prisma.userCommunity.findMany({
      where: {
        userId,
        isActive: true,
      },
      include: {
        community: {
          include: {
            province: { select: { name: true } },
            city: { select: { name: true } },
            district: { select: { name: true } },
            _count: {
              select: {
                members: true,
                products: {
                  where: { status: 'active' },
                },
              },
            },
          },
        },
      },
      orderBy: {
        joinedAt: 'desc',
      },
    });

    return createSuccessResponse(res, {
      communities: userCommunities.map((uc) => uc.community),
    });
  } catch (error) {
    console.error('获取用户小区失败:', error);
    return createErrorResponse(res, '获取用户小区失败', 500);
  }
}

/**
 * 获取小区详情
 */
export async function getCommunity(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    const community = await prisma.community.findUnique({
      where: { id },
      include: {
        province: { select: { id: true, name: true } },
        city: { select: { id: true, name: true } },
        district: { select: { id: true, name: true } },
        members: {
          where: { isActive: true },
          take: 10,
          include: {
            user: {
              select: {
                id: true,
                nickname: true,
                avatarUrl: true,
                creditScore: true,
                isVerified: true,
              },
            },
          },
          orderBy: {
            joinedAt: 'desc',
          },
        },
        activities: {
          where: {
            status: 'published',
          },
          take: 10,
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            members: true,
            products: {
              where: { status: 'active' },
            },
            activities: {
              where: { status: 'published' },
            },
          },
        },
      },
    });

    if (!community) {
      return createErrorResponse(res, '小区不存在', 404);
    }

    // 检查用户是否已加入
    let isJoined = false;
    if (userId) {
      const userCommunity = await prisma.userCommunity.findUnique({
        where: {
          userId_communityId: {
            userId,
            communityId: id,
          },
        },
      });
      isJoined = !!userCommunity && userCommunity.isActive;
    }

    return createSuccessResponse(res, {
      community: {
        ...community,
        isJoined,
      },
    });
  } catch (error) {
    console.error('获取小区详情失败:', error);
    return createErrorResponse(res, '获取小区详情失败', 500);
  }
}

/**
 * 加入小区
 */
export async function joinCommunity(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) {
      return createErrorResponse(res, '未登录', 401);
    }

    // 检查小区是否存在且已认证
    const community = await prisma.community.findUnique({
      where: { id },
    });

    if (!community) {
      return createErrorResponse(res, '小区不存在', 404);
    }

    if (community.verificationStatus !== 'approved') {
      return createErrorResponse(res, '该小区尚未认证，无法加入', 403);
    }

    // 检查是否已加入
    const existing = await prisma.userCommunity.findUnique({
      where: {
        userId_communityId: {
          userId,
          communityId: id,
        },
      },
    });

    if (existing) {
      if (existing.isActive) {
        return createErrorResponse(res, '您已加入该小区', 400);
      } else {
        // 重新激活
        await prisma.userCommunity.update({
          where: { id: existing.id },
          data: { isActive: true, joinedAt: new Date() },
        });
        return createSuccessResponse(res, { message: '已重新加入小区' });
      }
    }

    // 加入小区
    await prisma.userCommunity.create({
      data: {
        userId,
        communityId: id,
        isActive: true,
      },
    });

    // 更新用户的communityIds数组
    await prisma.user.update({
      where: { id: userId },
      data: {
        communityIds: {
          push: id,
        },
      },
    });

    return createSuccessResponse(res, { message: '加入小区成功' });
  } catch (error: any) {
    console.error('加入小区失败:', error);
    if (error.code === 'P2002') {
      return createErrorResponse(res, '您已加入该小区', 400);
    }
    return createErrorResponse(res, '加入小区失败', 500);
  }
}

/**
 * 退出小区
 */
export async function leaveCommunity(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) {
      return createErrorResponse(res, '未登录', 401);
    }

    const userCommunity = await prisma.userCommunity.findUnique({
      where: {
        userId_communityId: {
          userId,
          communityId: id,
        },
      },
    });

    if (!userCommunity || !userCommunity.isActive) {
      return createErrorResponse(res, '您未加入该小区', 400);
    }

    await prisma.userCommunity.update({
      where: { id: userCommunity.id },
      data: { isActive: false },
    });

    // 更新用户的communityIds数组
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { communityIds: true },
    });

    if (user) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          communityIds: {
            set: user.communityIds.filter((cid) => cid !== id),
          },
        },
      });
    }

    return createSuccessResponse(res, { message: '已退出小区' });
  } catch (error) {
    console.error('退出小区失败:', error);
    return createErrorResponse(res, '退出小区失败', 500);
  }
}

/**
 * 申请小区认证
 */
export async function applyCommunityVerification(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) {
      return createErrorResponse(res, '未登录', 401);
    }

    const { companyName, contactName, contactPhone, licenseUrl, proofUrl } = req.body;

    if (!companyName || !contactName || !contactPhone || !licenseUrl) {
      return createErrorResponse(res, '请填写完整的认证信息', 400);
    }

    // 检查小区是否存在
    const community = await prisma.community.findUnique({
      where: { id },
    });

    if (!community) {
      return createErrorResponse(res, '小区不存在', 404);
    }

    // 检查是否已有认证申请
    const existing = await prisma.communityVerification.findUnique({
      where: { communityId: id },
    });

    if (existing) {
      if (existing.status === 'pending') {
        return createErrorResponse(res, '认证申请已提交，请等待审核', 400);
      }
      if (existing.status === 'approved') {
        return createErrorResponse(res, '该小区已认证', 400);
      }
    }

    // 创建或更新认证申请
    await prisma.communityVerification.upsert({
      where: { communityId: id },
      update: {
        companyName,
        contactName,
        contactPhone,
        licenseUrl,
        proofUrl: proofUrl || null,
        status: 'pending',
        reviewedBy: null,
        reviewedAt: null,
        rejectReason: null,
      },
      create: {
        communityId: id,
        companyName,
        contactName,
        contactPhone,
        licenseUrl,
        proofUrl: proofUrl || null,
        status: 'pending',
      },
    });

    return createSuccessResponse(res, { message: '认证申请已提交，请等待审核' });
  } catch (error) {
    console.error('申请小区认证失败:', error);
    return createErrorResponse(res, '申请小区认证失败', 500);
  }
}

