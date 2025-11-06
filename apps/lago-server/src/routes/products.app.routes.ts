import { Router } from 'express';
import {
  getProductsForApp,
  getProductForApp,
  getRecommendedProducts,
  getHotProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  likeProduct,
  unlikeProduct,
} from '../controllers/products.app.controller';
import { authUser } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import * as Joi from 'joi';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: 小程序端商品相关接口
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: 获取商品列表（小程序端）
 *     tags: [Products, App]
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
 *         name: category
 *         schema:
 *           type: string
 *           enum: [toys, gaming]
 *         description: 商品分类
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [rent, sell, both]
 *         description: 交易类型
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 搜索关键词
 *       - in: query
 *         name: communityId
 *         schema:
 *           type: string
 *         description: 小区ID
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, price, viewCount, likeCount]
 *           default: "createdAt"
 *         description: 排序字段
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: "desc"
 *         description: 排序方向
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
 *       401:
 *         description: 未认证
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  '/',
  authUser,
  validateRequest(
    Joi.object({
      query: Joi.object({
        page: Joi.string().optional(),
        limit: Joi.string().optional(),
        category: Joi.string().valid('toys', 'gaming').optional(),
        type: Joi.string().valid('rent', 'sell', 'both').optional(),
        search: Joi.string().optional(),
        communityId: Joi.string().optional(),
        sortBy: Joi.string().valid('createdAt', 'price', 'viewCount', 'likeCount').optional(),
        sortOrder: Joi.string().valid('asc', 'desc').optional(),
      }),
    })
  ),
  getProductsForApp
);

/**
 * @swagger
 * /api/products/recommended:
 *   get:
 *     summary: 获取推荐商品
 *     tags: [Products, App]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 *           default: "10"
 *         description: 返回数量
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
 *       401:
 *         description: 未认证
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  '/recommended',
  authUser,
  validateRequest(
    Joi.object({
      query: Joi.object({
        limit: Joi.string().optional(),
      }),
    })
  ),
  getRecommendedProducts
);

/**
 * @swagger
 * /api/products/hot:
 *   get:
 *     summary: 获取热门商品
 *     tags: [Products, App]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 *           default: "10"
 *         description: 返回数量
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
 *       401:
 *         description: 未认证
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  '/hot',
  authUser,
  validateRequest(
    Joi.object({
      query: Joi.object({
        limit: Joi.string().optional(),
      }),
    })
  ),
  getHotProducts
);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: 获取商品详情
 *     tags: [Products, App]
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
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *       404:
 *         description: 商品不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', authUser, getProductForApp);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: 创建商品
 *     tags: [Products, App]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProductRequest'
 *     responses:
 *       201:
 *         description: 创建成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: 参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  '/',
  authUser,
  validateRequest(
    Joi.object({
      body: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().optional(),
        category: Joi.string().valid('toys', 'gaming').required(),
        type: Joi.string().valid('rent', 'sell', 'both').required(),
        price: Joi.number().positive().required(),
        deposit: Joi.number().positive().optional(),
        images: Joi.array().items(Joi.string()).min(1).required(),
        communityId: Joi.string().optional(),
        location: Joi.string().optional(),
      }),
    })
  ),
  createProduct
);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: 更新商品
 *     tags: [Products, App]
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
 *             $ref: '#/components/schemas/UpdateProductRequest'
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *       403:
 *         description: 无权限
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put(
  '/:id',
  authUser,
  validateRequest(
    Joi.object({
      body: Joi.object({
        title: Joi.string().optional(),
        description: Joi.string().optional().allow(''),
        category: Joi.string().valid('toys', 'gaming').optional(),
        type: Joi.string().valid('rent', 'sell', 'both').optional(),
        price: Joi.number().positive().optional(),
        deposit: Joi.number().positive().optional().allow(null),
        images: Joi.array().items(Joi.string()).optional(),
        status: Joi.string().valid('active', 'offline').optional(),
      }),
    })
  ),
  updateProduct
);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: 删除商品
 *     tags: [Products, App]
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
 *         description: 删除成功
 *       403:
 *         description: 无权限
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', authUser, deleteProduct);

/**
 * @swagger
 * /api/products/{id}/like:
 *   post:
 *     summary: 收藏商品
 *     tags: [Products, App]
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
 *         description: 收藏成功
 *       401:
 *         description: 未认证
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/:id/like', authUser, likeProduct);

/**
 * @swagger
 * /api/products/{id}/unlike:
 *   post:
 *     summary: 取消收藏商品
 *     tags: [Products, App]
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
 *         description: 取消收藏成功
 *       401:
 *         description: 未认证
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/:id/unlike', authUser, unlikeProduct);

export default router;

