import { Router } from 'express';
import {
  getOrdersForApp,
  getOrderForApp,
  createOrder,
  updateOrderStatusForApp,
  cancelOrder,
} from '../controllers/orders.app.controller';
import { authUser } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import * as Joi from 'joi';

const router = Router();

// 所有路由需要用户认证
router.use(authUser);

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: 小程序端订单相关接口
 */

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: 获取订单列表（小程序端）
 *     tags: [Orders, App]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *           default: "1"
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 *           default: "20"
 *         description: 每页数量
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, paid, confirmed, completed, cancelled, refunded]
 *         description: 订单状态
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [rent, sell]
 *         description: 订单类型
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [buyer, seller]
 *           default: "buyer"
 *         description: 角色（买家/卖家）
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
  '/',
  validateRequest(
    Joi.object({
      query: Joi.object({
        page: Joi.string().optional(),
        limit: Joi.string().optional(),
        status: Joi.string().valid('pending', 'paid', 'confirmed', 'completed', 'cancelled', 'refunded').optional(),
        type: Joi.string().valid('rent', 'sell').optional(),
        role: Joi.string().valid('buyer', 'seller').optional(),
      }),
    })
  ),
  getOrdersForApp
);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: 获取订单详情
 *     tags: [Orders, App]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 订单ID
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 */
router.get('/:id', getOrderForApp);

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: 创建订单
 *     tags: [Orders, App]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderRequest'
 *     responses:
 *       201:
 *         description: 创建成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 */
router.post(
  '/',
  validateRequest(
    Joi.object({
      body: Joi.object({
        productId: Joi.string().required(),
        type: Joi.string().valid('rent', 'sell').required(),
        startDate: Joi.string().isoDate().optional(),
        endDate: Joi.string().isoDate().optional(),
        deliveryType: Joi.string().valid('self_pickup', 'delivery', 'cabinet').required(),
        deliveryAddress: Joi.string().optional(),
        remark: Joi.string().optional(),
      }),
    })
  ),
  createOrder
);

/**
 * @swagger
 * /api/orders/{id}/status:
 *   put:
 *     summary: 更新订单状态
 *     tags: [Orders, App]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 订单ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [paid, confirmed, completed, cancelled]
 *     responses:
 *       200:
 *         description: 更新成功
 */
router.put(
  '/:id/status',
  validateRequest(
    Joi.object({
      body: Joi.object({
        status: Joi.string().valid('paid', 'confirmed', 'completed', 'cancelled').required(),
      }),
    })
  ),
  updateOrderStatusForApp
);

/**
 * @swagger
 * /api/orders/{id}/cancel:
 *   post:
 *     summary: 取消订单
 *     tags: [Orders, App]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 订单ID
 *     responses:
 *       200:
 *         description: 取消成功
 */
router.post('/:id/cancel', cancelOrder);

export default router;

