import { Router } from 'express';
import {
  getNearbyCommunities,
  getCommunity,
} from '../controllers/communities.app.controller';
import { authUser } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import * as Joi from 'joi';

const router = Router();

// 所有路由需要用户认证
router.use(authUser);

/**
 * @swagger
 * tags:
 *   name: Communities
 *   description: 小程序端社区相关接口
 */

/**
 * @swagger
 * /api/communities/nearby:
 *   get:
 *     summary: 获取附近小区
 *     tags: [Communities, App]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: number
 *         description: 纬度
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: number
 *         description: 经度
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 5000
 *         description: 搜索半径（米）
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 communities:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Community'
 */
router.get(
  '/nearby',
  validateRequest(
    Joi.object({
      query: Joi.object({
        latitude: Joi.number().optional(),
        longitude: Joi.number().optional(),
        radius: Joi.number().optional(),
      }),
    })
  ),
  getNearbyCommunities
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
 *               type: object
 *               properties:
 *                 community:
 *                   $ref: '#/components/schemas/Community'
 */
router.get('/:id', getCommunity);

export default router;

