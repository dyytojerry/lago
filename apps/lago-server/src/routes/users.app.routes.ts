import { Router } from 'express';
import {
  getUserProfile,
  updateUserProfile,
  getUserProducts,
  getUserOrders,
} from '../controllers/users.app.controller';
import { authUser } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import * as Joi from 'joi';

const router = Router();

// 所有路由需要用户认证
router.use(authUser);

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: 小程序端用户相关接口
 */

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: 获取用户信息
 *     tags: [Users, App]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 */
router.get('/profile', getUserProfile);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: 更新用户信息
 *     tags: [Users, App]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nickname:
 *                 type: string
 *               avatarUrl:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 */
router.put(
  '/profile',
  validateRequest(
    Joi.object({
      body: Joi.object({
        nickname: Joi.string().optional(),
        avatarUrl: Joi.string().optional(),
        phone: Joi.string().optional(),
      }),
    })
  ),
  updateUserProfile
);

/**
 * @swagger
 * /api/users/products:
 *   get:
 *     summary: 获取用户发布的商品
 *     tags: [Users, App]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           minimum: 1
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           minimum: 1
 *           default: 20
 *         description: 每页数量
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, active, sold, rented, offline]
 *         description: 商品状态
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get(
  '/products',
  validateRequest(
    Joi.object({
      query: Joi.object({
        page: Joi.number().integer().min(1).optional(),
        limit: Joi.number().integer().min(1).optional(),
        status: Joi.string().valid('pending', 'active', 'sold', 'rented', 'offline').optional(),
      }),
    })
  ),
  getUserProducts
);

/**
 * @swagger
 * /api/users/orders:
 *   get:
 *     summary: 获取用户的订单（作为买家或卖家）
 *     tags: [Users, App]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           minimum: 1
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           minimum: 1
 *           default: 20
 *         description: 每页数量
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [buyer, seller]
 *           default: "buyer"
 *         description: 角色
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orders:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get(
  '/orders',
  validateRequest(
    Joi.object({
      query: Joi.object({
        page: Joi.number().integer().min(1).optional(),
        limit: Joi.number().integer().min(1).optional(),
        role: Joi.string().valid('buyer', 'seller').optional(),
      }),
    })
  ),
  getUserOrders
);

export default router;

