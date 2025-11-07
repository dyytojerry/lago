import { Router } from 'express';
import {
  getNearbyCommunities,
  getCommunity,
  searchCommunities,
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
 * /api/communities/nearby:
 *   get:
 *     summary: 获取附近小区（1公里内）
 *     tags: [Communities, App]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: number
 *         required: true
 *         description: 纬度
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: number
 *         required: true
 *         description: 经度
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 1000
 *         description: 搜索半径（米），默认1000米
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
router.get(
  '/nearby',
  authUser,
  validateRequest(
    Joi.object({
      query: Joi.object({
        latitude: Joi.number().required(),
        longitude: Joi.number().required(),
        radius: Joi.number().optional(),
      }),
    })
  ),
  getNearbyCommunities
);

/**
 * @swagger
 * /api/communities/search:
 *   get:
 *     summary: 搜索小区
 *     tags: [Communities, App]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 搜索关键词
 *       - in: query
 *         name: provinceId
 *         schema:
 *           type: string
 *         description: 省份ID
 *       - in: query
 *         name: cityId
 *         schema:
 *           type: string
 *         description: 城市ID
 *       - in: query
 *         name: districtId
 *         schema:
 *           type: string
 *         description: 区县ID
 *       - in: query
 *         name: verificationStatus
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         description: 认证状态
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
 *     responses:
 *       200:
 *         description: 搜索成功
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
 *                         pagination:
 *                           $ref: '#/components/schemas/Pagination'
 *                       required: ['communities', 'pagination']
 */
router.get(
  '/search',
  authUser,
  validateRequest(
    Joi.object({
      query: Joi.object({
        search: Joi.string().optional(),
        provinceId: Joi.string().optional(),
        cityId: Joi.string().optional(),
        districtId: Joi.string().optional(),
        verificationStatus: Joi.string().valid('pending', 'approved', 'rejected').optional(),
        page: Joi.string().optional(),
        limit: Joi.string().optional(),
      }),
    })
  ),
  searchCommunities
);

/**
 * @swagger
 * /api/communities/{id}:
 *   get:
 *     summary: 获取小区详情
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
 *                         community:
 *                           $ref: '#/components/schemas/Community'
 *                       required: ['community']
 */
router.get('/:id', authUser, getCommunity);

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

