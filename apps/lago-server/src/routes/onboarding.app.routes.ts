import { Router } from 'express';
import * as Joi from 'joi';
import { submitOnboardingApplication, getMyOnboardingApplications, getMyOnboardingApplicationDetail } from '../controllers/onboarding.app.controller';
import { authUser } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

const onboardingTypes = [
  'personal_seller',
  'small_business_seller',
  'personal_service_provider',
  'enterprise_service_provider',
];

const serviceCategories = [
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
];

/**
 * @swagger
 * /api/onboarding:
 *   get:
 *     summary: 获取当前用户的入驻申请
 *     tags: [Onboarding, App]
 *     security:
 *       - bearerAuth: []
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
 *       401:
 *         description: 未认证
 */
router.get('/', authUser, getMyOnboardingApplications);

/**
 * @swagger
 * /api/onboarding/{id}:
 *   get:
 *     summary: 获取入驻申请详情
 *     tags: [Onboarding, App]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 入驻申请ID
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
 *       401:
 *         description: 未认证
 *       404:
 *         description: 未找到
 */
router.get('/:id', authUser, getMyOnboardingApplicationDetail);

/**
 * @swagger
 * /api/onboarding:
 *   post:
 *     summary: 提交入驻申请
 *     tags: [Onboarding, App]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OnboardingApplicationCreateRequest'
 *     responses:
 *       200:
 *         description: 提交成功
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
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未认证
 */
router.post(
  '/',
  authUser,
  validateRequest(
    Joi.object({
      body: Joi.object({
        type: Joi.string().valid(...onboardingTypes).required(),
        serviceCategory: Joi.string().valid(...serviceCategories).optional(),
        fullName: Joi.string().optional(),
        idNumber: Joi.string().optional(),
        businessName: Joi.string().optional(),
        businessLicenseNumber: Joi.string().optional(),
        contactPhone: Joi.string().optional(),
        contactEmail: Joi.string().email().optional(),
        address: Joi.string().optional(),
        description: Joi.string().optional(),
        experienceYears: Joi.number().integer().min(0).optional(),
        documents: Joi.any().optional(),
        metadata: Joi.any().optional(),
      }),
    })
  ),
  submitOnboardingApplication
);

export default router;

