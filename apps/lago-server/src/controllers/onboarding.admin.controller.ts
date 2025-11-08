import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { createSuccessResponse, createErrorResponse } from '../lib/response';

const ONBOARDING_TYPES = [
  'personal_seller',
  'small_business_seller',
  'personal_service_provider',
  'enterprise_service_provider',
] as const;

const ONBOARDING_STATUS = ['pending', 'processing', 'approved', 'rejected'] as const;

export async function getOnboardingApplications(req: Request, res: Response) {
  try {
    const {
      page = '1',
      limit = '20',
      type,
      status,
      search,
    } = req.query;

    const pageNum = Math.max(parseInt(page as string, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit as string, 10) || 20, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (type && ONBOARDING_TYPES.includes(type as any)) {
      where.type = type;
    }

    if (status && ONBOARDING_STATUS.includes(status as any)) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search as string, mode: 'insensitive' } },
        { businessName: { contains: search as string, mode: 'insensitive' } },
        {
          user: {
            nickname: { contains: search as string, mode: 'insensitive' },
          },
        },
        {
          user: {
            phone: { contains: search as string, mode: 'insensitive' },
          },
        },
      ];
    }

    const [applications, total] = await Promise.all([
      prisma.onboardingApplication.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { submittedAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              nickname: true,
              phone: true,
              email: true,
              role: true,
              isVerified: true,
            },
          },
          reviewer: {
            select: {
              id: true,
              username: true,
              realName: true,
            },
          },
        },
      }),
      prisma.onboardingApplication.count({ where }),
    ]);

    return createSuccessResponse(res, {
      applications,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('获取入驻申请列表失败:', error);
    return createErrorResponse(res, '获取入驻申请列表失败', 500);
  }
}

export async function getOnboardingApplication(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const application = await prisma.onboardingApplication.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            phone: true,
            email: true,
            role: true,
            isVerified: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            username: true,
            realName: true,
          },
        },
      },
    });

    if (!application) {
      return createErrorResponse(res, '申请不存在', 404);
    }

    return createSuccessResponse(res, { application });
  } catch (error) {
    console.error('获取入驻申请详情失败:', error);
    return createErrorResponse(res, '获取入驻申请详情失败', 500);
  }
}

export async function approveOnboardingApplication(req: Request, res: Response) {
  try {
    const reviewerId = req.operationStaff?.id;
    if (!reviewerId) {
      return createErrorResponse(res, '未认证', 401);
    }

    const { id } = req.params;

    const application = await prisma.onboardingApplication.findUnique({
      where: { id },
    });

    if (!application) {
      return createErrorResponse(res, '申请不存在', 404);
    }

    if (application.status === 'approved') {
      return createErrorResponse(res, '申请已通过审核', 400);
    }

    const updated = await prisma.onboardingApplication.update({
      where: { id },
      data: {
        status: 'approved',
        reviewedAt: new Date(),
        reviewerId,
        rejectReason: null,
      },
    });

    const userUpdate: any = { isVerified: true };
    if (
      application.type === 'personal_seller' ||
      application.type === 'small_business_seller'
    ) {
      userUpdate.role = 'merchant';
    }

    if (Object.keys(userUpdate).length > 0) {
      await prisma.user.update({
        where: { id: application.userId },
        data: userUpdate,
      });
    }

    return createSuccessResponse(res, { application: updated });
  } catch (error) {
    console.error('审核入驻申请失败:', error);
    return createErrorResponse(res, '审核入驻申请失败', 500);
  }
}

export async function rejectOnboardingApplication(req: Request, res: Response) {
  try {
    const reviewerId = req.operationStaff?.id;
    if (!reviewerId) {
      return createErrorResponse(res, '未认证', 401);
    }

    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return createErrorResponse(res, '请提供拒绝原因', 400);
    }

    const application = await prisma.onboardingApplication.findUnique({
      where: { id },
    });

    if (!application) {
      return createErrorResponse(res, '申请不存在', 404);
    }

    const updated = await prisma.onboardingApplication.update({
      where: { id },
      data: {
        status: 'rejected',
        reviewedAt: new Date(),
        reviewerId,
        rejectReason: reason,
      },
    });

    return createSuccessResponse(res, { application: updated });
  } catch (error) {
    console.error('拒绝入驻申请失败:', error);
    return createErrorResponse(res, '拒绝入驻申请失败', 500);
  }
}

