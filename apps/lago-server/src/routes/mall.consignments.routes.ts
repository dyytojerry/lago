import { Router } from 'express';
import { authOperation, requirePermissions } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import {
  listConsignmentOrders,
  updateConsignmentOrder,
} from '../controllers/mallConsignments.controller';
import {
  listConsignmentOrdersSchema,
  updateConsignmentOrderSchema,
} from '../schemas/mallConsignmentSchema';

const router = Router();

router.use(authOperation, requirePermissions('mall_consignments:manage'));

/**
 * @swagger
 * tags:
 *   name: MallConsignments
 *   description: 商城寄售订单管理接口
 */

/**
 * @swagger
 * /api/admin/mall/consignments:
 *   get:
 *     summary: 获取寄售订单列表
 *     tags: [MallConsignments, Operation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [submitted, received, refurbishing, listed, sold, settled, cancelled]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 按商品标题或用户信息搜索
 *     responses:
 *       200:
 *         description: 返回寄售订单列表
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
 *                       required: ['orders', 'pagination']
 *                       properties:
 *                         orders:
 *                           type: array
 *                           items:
 *                             type: object
 *                             additionalProperties: true
 *                         pagination:
 *                           $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: 未认证
 *       403:
 *         description: 权限不足
 *       500:
 *         description: 服务器错误
 */
router.get('/', validateRequest(listConsignmentOrdersSchema), listConsignmentOrders);

/**
 * @swagger
 * /api/admin/mall/consignments/{id}:
 *   put:
 *     summary: 更新寄售订单信息
 *     tags: [MallConsignments, Operation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 寄售订单ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [submitted, received, refurbishing, listed, sold, settled, cancelled]
 *               assignedStaffId:
 *                 type: string
 *                 nullable: true
 *               mallProductId:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: 更新成功
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
 *                       required: ['order']
 *                       properties:
 *                         order:
 *                           type: object
 *                           additionalProperties: true
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未认证
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 寄售订单不存在
 *       500:
 *         description: 服务器错误
 */
router.put('/:id', validateRequest(updateConsignmentOrderSchema), updateConsignmentOrder);

export default router;
