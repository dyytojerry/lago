import type { Prisma, CommunityActivityStatus, CommunityActivityType } from '@prisma/client';
import { CommunityMemberRole, UserRole } from '@prisma/client';
import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { createSuccessResponse, createErrorResponse } from '../lib/response';

type ScalarQueryParam = string | number | string[];

const ASSIGNABLE_COMMUNITY_ROLES: CommunityMemberRole[] = [
  CommunityMemberRole.steward,
  CommunityMemberRole.maintenance,
  CommunityMemberRole.security,
  CommunityMemberRole.resident,
];

const PUBLISHABLE_COMMUNITY_ROLES: CommunityMemberRole[] = [
  CommunityMemberRole.supervisor,
  CommunityMemberRole.steward,
  CommunityMemberRole.maintenance,
  CommunityMemberRole.security,
];

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
    } = req.query as {
      latitude?: ScalarQueryParam;
      longitude?: ScalarQueryParam;
      radius?: ScalarQueryParam;
    };

    if (!latitude || !longitude) {
      return createErrorResponse(res, '请提供经纬度', 400);
    }

    const latSource = Array.isArray(latitude) ? latitude[0] : latitude;
    const lngSource = Array.isArray(longitude) ? longitude[0] : longitude;
    const radiusSource = Array.isArray(radius) ? radius[0] : radius;

    const lat = typeof latSource === 'number' ? latSource : Number.parseFloat(latSource || '0');
    const lng = typeof lngSource === 'number' ? lngSource : Number.parseFloat(lngSource || '0');
    const radiusMeters =
      typeof radiusSource === 'number' ? radiusSource : Number.parseFloat(radiusSource || '0');

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
      page = 1,
      limit = 20,
    } = req.query as {
      search?: string;
      provinceId?: string;
      cityId?: string;
      districtId?: string;
      verificationStatus?: string;
      page?: number;
      limit?: number;
    };

    const pageNum = page ?? 1;
    const limitNum = limit ?? 20;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      isActive: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { address: { contains: search } },
      ];
    }

    if (provinceId) {
      where.provinceId = provinceId;
    }

    if (cityId) {
      where.cityId = cityId;
    }

    if (districtId) {
      where.districtId = districtId;
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
      communities: userCommunities.map((uc) => ({
        ...uc.community,
        memberRole: uc.role,
      })),
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
          take: 50,
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
    let currentUserRole: CommunityMemberRole | null = null;
    if (userId) {
      const userCommunity = await prisma.userCommunity.findUnique({
        where: {
          userId_communityId: {
            userId,
            communityId: id,
          },
        },
      });
      if (userCommunity?.isActive) {
        isJoined = true;
        currentUserRole = userCommunity.role;
      }
    }

    const members = community.members.map((member) => ({
      id: member.id,
      userId: member.userId,
      role: member.role,
      joinedAt: member.joinedAt,
      user: member.user,
    }));

    return createSuccessResponse(res, {
      community: {
        ...community,
        members,
        isJoined,
        currentUserRole,
      },
    });
  } catch (error) {
    console.error('获取小区详情失败:', error);
    return createErrorResponse(res, '获取小区详情失败', 500);
  }
}

export async function createCommunityActivity(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) {
      return createErrorResponse(res, '未登录', 401);
    }

    const { title, description, images = [], startTime, endTime, location, type } = req.body as {
      title: string;
      description?: string;
      images?: string[];
      startTime?: string;
      endTime?: string;
      location?: string;
      type?: CommunityActivityType;
    };

    const community = await prisma.community.findUnique({
      where: { id },
      select: {
        verificationStatus: true,
      },
    });

    if (!community) {
      return createErrorResponse(res, '小区不存在', 404);
    }

    if (community.verificationStatus !== 'approved') {
      return createErrorResponse(res, '小区未认证，无法发布动态', 403);
    }

    const membership = await prisma.userCommunity.findUnique({
      where: {
        userId_communityId: {
          userId,
          communityId: id,
        },
      },
    });

    if (!membership?.isActive || !PUBLISHABLE_COMMUNITY_ROLES.includes(membership.role)) {
      return createErrorResponse(res, '仅物业团队成员可以发布小区动态', 403);
    }

    const parsedStart = startTime ? new Date(startTime) : null;
    const parsedEnd = endTime ? new Date(endTime) : null;

    if (parsedStart && parsedEnd && parsedStart > parsedEnd) {
      return createErrorResponse(res, '开始时间不能晚于结束时间', 400);
    }

    const activityType: CommunityActivityType = type ?? 'announcement';

    const activity = await prisma.communityActivity.create({
      data: {
        communityId: id,
        creatorId: userId,
        type: activityType,
        title,
        description: description || null,
        images: Array.isArray(images) ? images.filter(Boolean) : [],
        startTime: parsedStart,
        endTime: parsedEnd,
        location: location || null,
        status: 'published',
      },
    });

    return createSuccessResponse(res, { activity }, 201);
  } catch (error) {
    console.error('创建小区动态失败:', error);
    return createErrorResponse(res, '发布动态失败', 500);
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
        role: CommunityMemberRole.resident,
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
 * 获取地摊活动（跳蚤市场）Feed
 */
export async function getMarketActivitiesFeed(req: Request, res: Response) {
  try {
    const { page = 1, limit = 10, communityId } = req.query as {
      page?: number;
      limit?: number;
      communityId?: string;
    };

    const pageNum = Math.max(page ?? 1, 1);
    const limitNum = Math.min(Math.max(limit ?? 10, 1), 50);
    const skip = (pageNum - 1) * limitNum;

    const statusFilter: CommunityActivityStatus[] = ['published', 'ended'];
    const where: Prisma.CommunityActivityWhereInput = {
      type: 'market',
      status: {
        in: statusFilter,
      },
    };

    if (communityId) {
      where.communityId = communityId;
    }

    const activities = await prisma.communityActivity.findMany({
      where,
      include: {
        community: {
          select: {
            id: true,
            name: true,
            images: true,
            address: true,
            verificationStatus: true,
          },
        },
      },
    });

    const creatorIds = Array.from(
      new Set(activities.map((activity) => activity.creatorId).filter(Boolean))
    );

    const creators = await prisma.user.findMany({
      where: { id: { in: creatorIds } },
      select: {
        id: true,
        nickname: true,
        avatarUrl: true,
        role: true,
      },
    });

    const creatorMap = new Map(creators.map((item) => [item.id, item]));

    const now = Date.now();

    const enhanced = activities.map((activity) => {
      const start = activity.startTime ? new Date(activity.startTime) : null;
      const end = activity.endTime ? new Date(activity.endTime) : null;
      const isLive =
        !!start && start.getTime() <= now && (!end || end.getTime() > now) && activity.status === 'published';
      const isUpcoming = !!start && start.getTime() > now;

      const referenceTime = start?.getTime() ?? activity.createdAt.getTime();
      const hoursDiff = Math.max((now - referenceTime) / (1000 * 60 * 60), 0);
      const recencyScore = 1 / (1 + hoursDiff);
      const engagementScore = activity.participantCount * 1.5 + activity.viewCount * 0.5;
      const heatScore = Number((engagementScore + recencyScore * 120).toFixed(2));

      const creator = activity.creatorId ? creatorMap.get(activity.creatorId) : null;

      let publisherType: 'micro_merchant' | 'platform' | 'community' = 'community';
      if (creator?.role === UserRole.merchant) {
        publisherType = 'micro_merchant';
      } else if (creator?.role === UserRole.admin) {
        publisherType = 'platform';
      }

      return {
        id: activity.id,
        title: activity.title,
        description: activity.description,
        startTime: activity.startTime,
        endTime: activity.endTime,
        location: activity.location,
        status: activity.status,
        images: activity.images || [],
        isLive,
        isUpcoming,
        coverImage: activity.images?.[0] || activity.community?.images?.[0] || null,
        heatScore,
        publisher: {
          id: creator?.id ?? null,
          name: creator?.nickname ?? '社区运营',
          avatar: creator?.avatarUrl ?? null,
          type: publisherType,
        },
        community: {
          id: activity.community?.id,
          name: activity.community?.name,
          coverImage: activity.community?.images?.[0] || null,
          address: activity.community?.address,
          verificationStatus: activity.community?.verificationStatus,
        },
        sortMetrics: {
          recencyScore,
          engagementScore,
        },
      };
    });

    const sortedByHeat = [...enhanced].sort((a, b) => {
      if (b.heatScore !== a.heatScore) {
        return b.heatScore - a.heatScore;
      }
      const aStart = a.startTime ? new Date(a.startTime).getTime() : 0;
      const bStart = b.startTime ? new Date(b.startTime).getTime() : 0;
      return bStart - aStart;
    });

    const total = sortedByHeat.length;
    const paginated = sortedByHeat.slice(skip, skip + limitNum);

    return createSuccessResponse(res, {
      activities: paginated,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('获取跳蚤市场活动失败:', error);
    return createErrorResponse(res, '获取跳蚤市场活动失败', 500);
  }
}

/**
 * 根据小区ID批量获取活动
 */
export async function getActivitiesByCommunityIds(req: Request, res: Response) {
  try {
    const { communityIds, page = 1, limit = 10 } = req.query as {
      communityIds?: string | string[];
      page?: number;
      limit?: number;
    };

    if (!communityIds) {
      return createErrorResponse(res, '缺少 communityIds 参数', 400);
    }

    const rawIds = Array.isArray(communityIds)
      ? communityIds
      : communityIds.split(',');

    const ids = rawIds.map((id) => id.trim()).filter(Boolean);

    if (ids.length === 0) {
      return createErrorResponse(res, '缺少有效的小区ID', 400);
    }

    const pageNum = Math.max(page ?? 1, 1);
    const limitNum = Math.min(Math.max(limit ?? 10, 1), 50);
    const skip = (pageNum - 1) * limitNum;

    const communityStatusFilter: CommunityActivityStatus[] = [
      'published',
      'ended',
      'cancelled',
    ];
    const where: Prisma.CommunityActivityWhereInput = {
      communityId: { in: ids },
      status: { in: communityStatusFilter },
    };

    const [activities, total] = await Promise.all([
      prisma.communityActivity.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: [
          { startTime: 'desc' },
          { createdAt: 'desc' },
        ],
        include: {
          community: {
            select: {
              id: true,
              name: true,
              images: true,
              address: true,
              verificationStatus: true,
            },
          },
        },
      }),
      prisma.communityActivity.count({ where }),
    ]);

    const now = new Date();

    const items = activities.map((activity) => {
      const start = activity.startTime ? new Date(activity.startTime) : null;
      const end = activity.endTime ? new Date(activity.endTime) : null;
      const isLive =
        !!start && start <= now && (!end || end > now) && activity.status === 'published';
      const isUpcoming = !!start && start > now;

      return {
        id: activity.id,
        title: activity.title,
        description: activity.description,
        startTime: activity.startTime,
        endTime: activity.endTime,
        location: activity.location,
        status: activity.status,
        images: activity.images || [],
        isLive,
        isUpcoming,
        communityId: activity.community?.id,
        communityName: activity.community?.name,
        communityCover: activity.community?.images?.[0] || null,
        communityAddress: activity.community?.address,
        communityVerificationStatus: activity.community?.verificationStatus,
      };
    });

    return createSuccessResponse(res, {
      activities: items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('批量获取小区活动失败:', error);
    return createErrorResponse(res, '获取小区活动失败', 500);
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

    if (!userCommunity?.isActive) {
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
        submittedBy: userId,
      },
      create: {
        communityId: id,
        companyName,
        contactName,
        contactPhone,
        licenseUrl,
        proofUrl: proofUrl || null,
        status: 'pending',
        submittedBy: userId,
      },
    });

    return createSuccessResponse(res, { message: '认证申请已提交，请等待审核' });
  } catch (error) {
    console.error('申请小区认证失败:', error);
    return createErrorResponse(res, '申请小区认证失败', 500);
  }
}

/**
 * 更新小区成员角色
 */
export async function updateCommunityMemberRole(req: Request, res: Response) {
  try {
    const { id, memberId } = req.params;
    const { role } = req.body as { role?: CommunityMemberRole };
    const userId = (req as any).user?.id;

    if (!userId) {
      return createErrorResponse(res, '未登录', 401);
    }

    if (!role || !ASSIGNABLE_COMMUNITY_ROLES.includes(role)) {
      return createErrorResponse(res, '无效的成员角色', 400);
    }

    if (memberId === userId) {
      return createErrorResponse(res, '无法修改自己的角色', 400);
    }

    const [community, operatorMembership, targetMembership] = await Promise.all([
      prisma.community.findUnique({
        where: { id },
        select: { partnerId: true },
      }),
      prisma.userCommunity.findUnique({
        where: {
          userId_communityId: {
            userId,
            communityId: id,
          },
        },
      }),
      prisma.userCommunity.findUnique({
        where: {
          userId_communityId: {
            userId: memberId,
            communityId: id,
          },
        },
      }),
    ]);

    if (!community) {
      return createErrorResponse(res, '小区不存在', 404);
    }

    if (!targetMembership || !targetMembership.isActive) {
      return createErrorResponse(res, '目标成员不存在或未加入该小区', 404);
    }

    const isSupervisor =
      operatorMembership?.isActive && operatorMembership.role === CommunityMemberRole.supervisor;
    const isPartner = community.partnerId === userId;

    if (!isSupervisor && !isPartner) {
      return createErrorResponse(res, '无权限操作', 403);
    }

    await prisma.userCommunity.update({
      where: { id: targetMembership.id },
      data: {
        role,
        assignedBy: userId,
        assignedAt: new Date(),
      },
    });

    return createSuccessResponse(res, { message: '成员角色已更新' });
  } catch (error) {
    console.error('更新小区成员角色失败:', error);
    return createErrorResponse(res, '更新小区成员角色失败', 500);
  }
}

