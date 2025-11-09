import { Router } from 'express';
import {
  getOrders,
  getOrder,
  updateOrderStatus,
} from '../controllers/orders.controller';
import { authOperation } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import * as Joi from 'joi';

const router = Router();

// 所有路由需要运营端认证
router.use(authOperation);

/**
 * @swagger
 * tags:
 *   name: AdminOrders
 *   description: 运营系统订单管理相关接口
 */

/**
 * @swagger
 * /api/admin/orders:
 *   get:
 *     summary: 获取订单列表
 *     tags: [AdminOrders, Operation]
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
 *           enum: [pending, paid, confirmed, completed, cancelled, refunded]
 *         description: 订单状态
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [rent, sell]
 *         description: 订单类型
 *       - in: query
 *         name: buyerId
 *         schema:
 *           type: string
 *         description: 买家ID
 *       - in: query
 *         name: sellerId
 *         schema:
 *           type: string
 *         description: 卖家ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 搜索关键词（订单ID或商品标题）
 *     responses:
 *       200:
 *         description: 成功获取订单列表
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
 *                         orders:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Order'
 *                         pagination:
 *                           $ref: '#/components/schemas/Pagination'
 *                       required: ['orders', 'pagination']
 *       401:
 *         description: 未认证
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  '/',
  validateRequest(
    Joi.object({
      query: Joi.object({
        page: Joi.number().integer().min(1).optional(),
        limit: Joi.number().integer().min(1).optional(),
        status: Joi.string().valid('pending', 'paid', 'confirmed', 'completed', 'cancelled', 'refunded').optional(),
        type: Joi.string().valid('rent', 'sell').optional(),
        buyerId: Joi.string().optional(),
        sellerId: Joi.string().optional(),
        search: Joi.string().optional(),
      }),
    })
  ),
  getOrders
);

/**
 * @swagger
 * /api/admin/orders/{id}:
 *   get:
 *     summary: 获取订单详情
 *     tags: [AdminOrders, Operation]
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
 *         description: 成功获取订单详情
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
 *                         order:
 *                           allOf:
 *                             - $ref: '#/components/schemas/Order'
 *                             - type: object
 *                               properties:
 *                                 product:
 *                                   $ref: '#/components/schemas/Product'
 *                                 buyer:
 *                                   $ref: '#/components/schemas/User'
 *                                 seller:
 *                                   $ref: '#/components/schemas/User'
 *                                 depositRecord:
 *                                   type: object
 *                                   nullable: true
 *                                   properties:
 *                                     id: { type: 'string' }
 *                                     amount: { type: 'string', format: 'decimal' }
 *                                     refundStatus:
 *                                       type: 'string'
 *                                       enum: ['pending', 'refunded', 'forfeited']
 *                                     refundedAt:
 *                                       type: 'string'
 *                                       format: 'date-time'
 *                                       nullable: true
 *                       required: ['order']
 *       401:
 *         description: 未认证
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 订单不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', getOrder);

/**
 * @swagger
 * /api/admin/orders/{id}/status:
 *   put:
 *     summary: 更新订单状态
 *     tags: [AdminOrders, Operation]
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
 *             $ref: '#/components/schemas/OrderStatusUpdateRequest'
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: 参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 未认证
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 订单不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put(
  '/:id/status',
  validateRequest(
    Joi.object({
      body: Joi.object({
        status: Joi.string().valid('pending', 'paid', 'confirmed', 'completed', 'cancelled', 'refunded').required(),
        remark: Joi.string().optional(),
      }),
    })
  ),
  updateOrderStatus
);

export default router;
