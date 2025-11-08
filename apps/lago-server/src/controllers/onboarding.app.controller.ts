import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { createSuccessResponse, createErrorResponse } from '../lib/response';

const ONBOARDING_TYPES = [
  'personal_seller',
  'small_business_seller',
  'personal_service_provider',
  'enterprise_service_provider',
] as const;

const SERVICE_CATEGORIES = [
  'recycling',
  'appliance_repair',
  'appliance_install',
  'appliance_cleaning',
  'furniture_repair',
  'carpentry',
  'masonry',
  'tiling',
  'painting',
  'plumbing',
  'electrician',
  'hvac_install',
  'locksmith',
  'pest_control',
  'cleaning',
  'moving_service',
  'landscaping',
  'decoration_design',
  'renovation_general',
  'other',
] as const;

type OnboardingType = (typeof ONBOARDING_TYPES)[number];

function normalizeDocuments(documents: any): Record<string, any> | null {
  if (!documents) return null;
  if (typeof documents === 'object') {
    return documents;
  }
  try {
    return JSON.parse(documents);
  } catch (error) {
    return null;
  }
}

function requireFields(type: OnboardingType, payload: any): string[] {
  const missing: string[] = [];
  switch (type) {
    case 'personal_seller':
      if (!payload.fullName) missing.push('fullName');
      if (!payload.idNumber) missing.push('idNumber');
      break;
    case 'small_business_seller':
      if (!payload.businessName) missing.push('businessName');
      if (!payload.businessLicenseNumber) missing.push('businessLicenseNumber');
      break;
    case 'personal_service_provider':
      if (!payload.fullName) missing.push('fullName');
      if (!payload.idNumber) missing.push('idNumber');
      if (!payload.serviceCategory) missing.push('serviceCategory');
      break;
    case 'enterprise_service_provider':
      if (!payload.businessName) missing.push('businessName');
      if (!payload.businessLicenseNumber) missing.push('businessLicenseNumber');
      if (!payload.serviceCategory) missing.push('serviceCategory');
      break;
    default:
      break;
  }
  return missing;
}

export async function submitOnboardingApplication(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return createErrorResponse(res, '未认证', 401);
    }

    const {
      type,
      serviceCategory,
      fullName,
      idNumber,
      businessName,
      businessLicenseNumber,
      contactPhone,
      contactEmail,
      address,
      description,
      experienceYears,
      documents,
      metadata,
    } = req.body;

    if (!type || !ONBOARDING_TYPES.includes(type)) {
      return createErrorResponse(res, '无效的入驻类型', 400);
    }

    if (serviceCategory && !SERVICE_CATEGORIES.includes(serviceCategory)) {
      return createErrorResponse(res, '无效的服务商类型', 400);
    }

    const missing = requireFields(type, {
      fullName,
      idNumber,
      businessName,
      businessLicenseNumber,
      serviceCategory,
    });
    if (missing.length > 0) {
      return createErrorResponse(res, `缺少必要信息: ${missing.join(', ')}`, 400);
    }

    const existingProcessing = await prisma.onboardingApplication.findFirst({
      where: {
        userId,
        type,
        status: { in: ['processing'] },
      },
    });

    if (existingProcessing) {
      return createErrorResponse(res, '当前类型已有待审核申请，请耐心等待审核结果', 400);
    }

    const normalizedDocs = normalizeDocuments(documents);
    const normalizedMetadata = normalizeDocuments(metadata);

    const application = await prisma.onboardingApplication.create({
      data: {
        userId,
        type,
        serviceCategory: serviceCategory ?? null,
        status: 'processing',
        fullName: fullName ?? null,
        idNumber: idNumber ?? null,
        businessName: businessName ?? null,
        businessLicenseNumber: businessLicenseNumber ?? null,
        contactPhone: contactPhone ?? null,
        contactEmail: contactEmail ?? null,
        address: address ?? null,
        description: description ?? null,
        experienceYears: experienceYears ? Number(experienceYears) : null,
        documents: normalizedDocs,
        metadata: normalizedMetadata,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            username: true,
            realName: true,
          },
        },
      },
    });

    return createSuccessResponse(res, { application });
  } catch (error) {
    console.error('提交入驻申请失败:', error);
    return createErrorResponse(res, '提交入驻申请失败', 500);
  }
}

export async function getMyOnboardingApplications(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return createErrorResponse(res, '未认证', 401);
    }

    const applications = await prisma.onboardingApplication.findMany({
      where: { userId },
      orderBy: { submittedAt: 'desc' },
      include: {
        reviewer: {
          select: {
            id: true,
            username: true,
            realName: true,
          },
        },
      },
    });

    return createSuccessResponse(res, { applications });
  } catch (error) {
    console.error('获取入驻申请失败:', error);
    return createErrorResponse(res, '获取入驻申请失败', 500);
  }
}

export async function getMyOnboardingApplicationDetail(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return createErrorResponse(res, '未认证', 401);
    }
    const { id } = req.params;

    const application = await prisma.onboardingApplication.findFirst({
      where: {
        id,
        userId,
      },
      include: {
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

