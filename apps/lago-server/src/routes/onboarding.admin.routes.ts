import { Router } from 'express';
import * as Joi from 'joi';
import {
  getOnboardingApplications,
  getOnboardingApplication,
  approveOnboardingApplication,
  rejectOnboardingApplication,
} from '../controllers/onboarding.admin.controller';
import { authOperation } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

const onboardingTypes = [
  'personal_seller',
  'small_business_seller',
  'personal_service_provider',
  'enterprise_service_provider',
];

const onboardingStatus = ['pending', 'processing', 'approved', 'rejected'];

/**
 * @swagger
 * /api/admin/onboarding:
 *   get:
 *     summary: 获取入驻申请列表
 *     tags: [Onboarding, Operation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           minimum: 1
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           minimum: 1
 *         description: 每页数量
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [personal_seller, small_business_seller, personal_service_provider, enterprise_service_provider]
 *         description: 入驻类型
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, approved, rejected]
 *         description: 状态
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 关键字搜索（姓名/公司/电话）
 *     responses:
 *       200:
 *         description: 成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   required: ['data']
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/OnboardingApplicationListResponse'
 */
router.get(
  '/',
  authOperation,
  validateRequest(
    Joi.object({
      query: Joi.object({
        page: Joi.number().integer().min(1).optional(),
        limit: Joi.number().integer().min(1).optional(),
        type: Joi.string().valid(...onboardingTypes).optional(),
        status: Joi.string().valid(...onboardingStatus).optional(),
        search: Joi.string().optional(),
      }),
    })
  ),
  getOnboardingApplications
);

/**
 * @swagger
 * /api/admin/onboarding/{id}:
 *   get:
 *     summary: 获取入驻申请详情
 *     tags: [Onboarding, Operation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: 成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   required: ['data']
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/OnboardingApplicationDetailResponse'
 *       404:
 *         description: 未找到
 */
router.get('/:id', authOperation, getOnboardingApplication);

/**
 * @swagger
 * /api/admin/onboarding/{id}/approve:
 *   post:
 *     summary: 通过入驻申请
 *     tags: [Onboarding, Operation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: 审核成功
 *       404:
 *         description: 未找到
 */
router.post(
  '/:id/approve',
  authOperation,
  approveOnboardingApplication
);

/**
 * @swagger
 * /api/admin/onboarding/{id}/reject:
 *   post:
 *     summary: 拒绝入驻申请
 *     tags: [Onboarding, Operation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OnboardingReviewRequest'
 *     responses:
 *       200:
 *         description: 审核完成
 *       400:
 *         description: 请求错误
 *       404:
 *         description: 未找到
 */
router.post(
  '/:id/reject',
  authOperation,
  validateRequest(
    Joi.object({
      body: Joi.object({
        reason: Joi.string().required(),
      }),
    })
  ),
  rejectOnboardingApplication
);

export default router;

