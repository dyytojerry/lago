import { Router } from 'express';
import {
  getCommunities,
  getCommunity,
  getCommunityVerifications,
  approveCommunityVerification,
  rejectCommunityVerification,
} from '../controllers/communities.controller';
import { authOperation, requireRole } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import * as Joi from 'joi';

const router = Router();

// 所有路由需要运营端认证
router.use(authOperation);

/**
 * @swagger
 * tags:
 *   name: AdminCommunities
 *   description: 运营系统小区管理相关接口
 */

/**
 * @swagger
 * /api/admin/communities:
 *   get:
 *     summary: 获取小区列表
 *     tags: [AdminCommunities, Operation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 *         description: 每页数量
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 搜索关键词
 *       - in: query
 *         name: verificationStatus
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         description: 认证状态
 *     responses:
 *       200:
 *         description: 成功获取小区列表
 */
router.get(
  '/',
  validateRequest(
    Joi.object({
      query: Joi.object({
        page: Joi.string().optional(),
        limit: Joi.string().optional(),
        search: Joi.string().optional(),
        verificationStatus: Joi.string().valid('pending', 'approved', 'rejected').optional(),
      }),
    })
  ),
  getCommunities
);

/**
 * @swagger
 * /api/admin/communities/verifications:
 *   get:
 *     summary: 获取小区认证申请列表
 *     tags: [AdminCommunities, Operation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 *         description: 每页数量
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         description: 审核状态
 *     responses:
 *       200:
 *         description: 成功获取认证申请列表
 */
router.get(
  '/verifications',
  requireRole('super_admin', 'audit_staff'),
  validateRequest(
    Joi.object({
      query: Joi.object({
        page: Joi.string().optional(),
        limit: Joi.string().optional(),
        status: Joi.string().valid('pending', 'approved', 'rejected').optional(),
      }),
    })
  ),
  getCommunityVerifications
);

/**
 * @swagger
 * /api/admin/communities/{id}:
 *   get:
 *     summary: 获取小区详情
 *     tags: [AdminCommunities, Operation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 小区ID
 *     responses:
 *       200:
 *         description: 成功获取小区详情
 */
router.get('/:id', getCommunity);

/**
 * @swagger
 * /api/admin/communities/{id}/approve:
 *   post:
 *     summary: 审批小区认证（通过）
 *     tags: [AdminCommunities, Operation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 小区ID
 *     responses:
 *       200:
 *         description: 审批成功
 */
router.post(
  '/:id/approve',
  requireRole('super_admin', 'audit_staff'),
  approveCommunityVerification
);

/**
 * @swagger
 * /api/admin/communities/{id}/reject:
 *   post:
 *     summary: 审批小区认证（拒绝）
 *     tags: [AdminCommunities, Operation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 小区ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: 拒绝原因
 *     responses:
 *       200:
 *         description: 审批成功
 */
router.post(
  '/:id/reject',
  requireRole('super_admin', 'audit_staff'),
  validateRequest(
    Joi.object({
      body: Joi.object({
        reason: Joi.string().optional(),
      }),
    })
  ),
  rejectCommunityVerification
);

export default router;

