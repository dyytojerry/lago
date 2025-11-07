import { Router } from 'express';
import {
  getUserCommunities,
  joinCommunity,
  leaveCommunity,
  applyCommunityVerification,
} from '../controllers/communities.app.controller';
import { authUser } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import * as Joi from 'joi';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Communities
 *   description: 小程序端社区相关接口
 */

/**
 * @swagger
 * /api/communities/my:
 *   get:
 *     summary: 获取用户加入的小区
 *     tags: [Communities, App]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   required: ['data']
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         communities:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Community'
 *                       required: ['communities']
 */
router.get('/my', authUser, getUserCommunities);

/**
 * @swagger
 * /api/communities/{id}/join:
 *   post:
 *     summary: 加入小区
 *     tags: [Communities, App]
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
 *         description: 加入成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.post('/:id/join', authUser, joinCommunity);

/**
 * @swagger
 * /api/communities/{id}/leave:
 *   post:
 *     summary: 退出小区
 *     tags: [Communities, App]
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
 *         description: 退出成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.post('/:id/leave', authUser, leaveCommunity);

/**
 * @swagger
 * /api/communities/{id}/verify:
 *   post:
 *     summary: 申请小区认证
 *     tags: [Communities, App]
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
 *               companyName:
 *                 type: string
 *               contactName:
 *                 type: string
 *               contactPhone:
 *                 type: string
 *               licenseUrl:
 *                 type: string
 *               proofUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: 申请成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.post(
  '/:id/verify',
  authUser,
  validateRequest(
    Joi.object({
      body: Joi.object({
        companyName: Joi.string().required(),
        contactName: Joi.string().required(),
        contactPhone: Joi.string().required(),
        licenseUrl: Joi.string().required(),
        proofUrl: Joi.string().optional(),
      }),
    })
  ),
  applyCommunityVerification
);

export default router;

