import { Router } from 'express';
import {
  getProducts,
  getProduct,
  approveProduct,
  batchApproveProducts,
} from '../controllers/products.controller';
import { authOperation, requireRole } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import * as Joi from 'joi';

const router = Router();

// 所有路由需要运营端认证
router.use(authOperation);

/**
 * @swagger
 * /api/admin/products:
 *   get:
 *     summary: 获取商品列表
 *     tags: [Admin Products]
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
 *           enum: [pending, active, sold, rented, offline]
 *         description: 商品状态
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [toys, gaming]
 *         description: 商品分类
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 搜索关键词（商品标题或描述）
 *       - in: query
 *         name: ownerId
 *         schema:
 *           type: string
 *         description: 卖家ID
 *     responses:
 *       200:
 *         description: 成功获取商品列表
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductListResponse'
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
        page: Joi.string().optional(),
        limit: Joi.string().optional(),
        status: Joi.string().valid('pending', 'active', 'sold', 'rented', 'offline').optional(),
        category: Joi.string().valid('toys', 'gaming').optional(),
        search: Joi.string().optional(),
        ownerId: Joi.string().optional(),
      }),
    })
  ),
  getProducts
);

/**
 * @swagger
 * /api/admin/products/{id}:
 *   get:
 *     summary: 获取商品详情
 *     tags: [Admin Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 商品ID
 *     responses:
 *       200:
 *         description: 成功获取商品详情
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductDetailResponse'
 *       401:
 *         description: 未认证
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 商品不存在
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
router.get('/:id', getProduct);

/**
 * @swagger
 * /api/admin/products/{id}/approve:
 *   post:
 *     summary: 审核商品
 *     tags: [Admin Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 商品ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductApproveRequest'
 *     responses:
 *       200:
 *         description: 审核成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: 参数错误或商品状态不正确
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 未认证或权限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: 权限不足（需要审核专员或超级管理员）
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 商品不存在
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
router.post(
  '/:id/approve',
  requireRole('super_admin', 'audit_staff'),
  validateRequest(
    Joi.object({
      body: Joi.object({
        action: Joi.string().valid('approve', 'reject').required(),
        reason: Joi.string().optional(),
      }),
    })
  ),
  approveProduct
);

/**
 * @swagger
 * /api/admin/products/batch-approve:
 *   post:
 *     summary: 批量审核商品
 *     tags: [Admin Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductBatchApproveRequest'
 *     responses:
 *       200:
 *         description: 批量审核成功
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
 *         description: 未认证或权限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: 权限不足（需要审核专员或超级管理员）
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
router.post(
  '/batch-approve',
  requireRole('super_admin', 'audit_staff'),
  validateRequest(
    Joi.object({
      body: Joi.object({
        ids: Joi.array().items(Joi.string()).required(),
        action: Joi.string().valid('approve', 'reject').required(),
        reason: Joi.string().optional(),
      }),
    })
  ),
  batchApproveProducts
);

export default router;

