import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { createSuccessResponse, createErrorResponse } from '../lib/response';

/**
 * 获取小区列表（运营端）
 */
export async function getCommunities(req: Request, res: Response) {
  try {
    const {
      page = '1',
      limit = '20',
      search,
      verificationStatus,
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { address: { contains: search as string } },
      ];
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
          verification: {
            select: {
              status: true,
              companyName: true,
              contactName: true,
              contactPhone: true,
            },
          },
          _count: {
            select: {
              members: true,
              products: true,
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
    console.error('获取小区列表失败:', error);
    return createErrorResponse(res, '获取小区列表失败', 500);
  }
}

/**
 * 获取小区详情（运营端）
 */
export async function getCommunity(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const community = await prisma.community.findUnique({
      where: { id },
      include: {
        province: { select: { id: true, name: true } },
        city: { select: { id: true, name: true } },
        district: { select: { id: true, name: true } },
        verification: true,
        _count: {
          select: {
            members: true,
            products: true,
            activities: true,
          },
        },
      },
    });

    if (!community) {
      return createErrorResponse(res, '小区不存在', 404);
    }

    return createSuccessResponse(res, { community });
  } catch (error) {
    console.error('获取小区详情失败:', error);
    return createErrorResponse(res, '获取小区详情失败', 500);
  }
}

/**
 * 获取小区认证申请列表
 */
export async function getCommunityVerifications(req: Request, res: Response) {
  try {
    const {
      page = '1',
      limit = '20',
      status,
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    const [verifications, total] = await Promise.all([
      prisma.communityVerification.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          community: {
            select: {
              id: true,
              name: true,
              address: true,
              province: { select: { name: true } },
              city: { select: { name: true } },
              district: { select: { name: true } },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.communityVerification.count({ where }),
    ]);

    return createSuccessResponse(res, {
      verifications,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('获取认证申请列表失败:', error);
    return createErrorResponse(res, '获取认证申请列表失败', 500);
  }
}

/**
 * 审批小区认证（通过）
 */
export async function approveCommunityVerification(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const staffId = (req as any).operationStaff?.id;

    if (!staffId) {
      return createErrorResponse(res, '未登录', 401);
    }

    // 查找认证申请
    const verification = await prisma.communityVerification.findUnique({
      where: { communityId: id },
      include: {
        community: true,
      },
    });

    if (!verification) {
      return createErrorResponse(res, '认证申请不存在', 404);
    }

    if (verification.status !== 'pending') {
      return createErrorResponse(res, '该申请已处理', 400);
    }

    // 更新认证申请状态
    await prisma.communityVerification.update({
      where: { communityId: id },
      data: {
        status: 'approved',
        reviewedBy: staffId,
        reviewedAt: new Date(),
      },
    });

    // 更新小区认证状态
    await prisma.community.update({
      where: { id },
      data: {
        verificationStatus: 'approved',
        verifiedAt: new Date(),
        verifiedBy: staffId,
      },
    });

    return createSuccessResponse(res, { message: '认证审批通过' });
  } catch (error) {
    console.error('审批小区认证失败:', error);
    return createErrorResponse(res, '审批小区认证失败', 500);
  }
}

/**
 * 审批小区认证（拒绝）
 */
export async function rejectCommunityVerification(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const staffId = (req as any).operationStaff?.id;

    if (!staffId) {
      return createErrorResponse(res, '未登录', 401);
    }

    // 查找认证申请
    const verification = await prisma.communityVerification.findUnique({
      where: { communityId: id },
    });

    if (!verification) {
      return createErrorResponse(res, '认证申请不存在', 404);
    }

    if (verification.status !== 'pending') {
      return createErrorResponse(res, '该申请已处理', 400);
    }

    // 更新认证申请状态
    await prisma.communityVerification.update({
      where: { communityId: id },
      data: {
        status: 'rejected',
        reviewedBy: staffId,
        reviewedAt: new Date(),
        rejectReason: reason || '审核未通过',
      },
    });

    // 更新小区认证状态
    await prisma.community.update({
      where: { id },
      data: {
        verificationStatus: 'rejected',
      },
    });

    return createSuccessResponse(res, { message: '认证审批已拒绝' });
  } catch (error) {
    console.error('拒绝小区认证失败:', error);
    return createErrorResponse(res, '拒绝小区认证失败', 500);
  }
}

