import { Router } from 'express';
import {
  getRecommendedProducts,
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
 *           type: number
 *           minimum: 1
 *           default: 10
 *         description: 返回数量
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
 *                         products:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Product'
 *                       required: ['products']
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
        limit: Joi.number().integer().min(1).optional(),
      }),
    })
  ),
  getRecommendedProducts
);

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
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: 商品标题
 *               description:
 *                 type: string
 *                 nullable: true
 *                 description: 商品描述
 *               category:
 *                 type: string
 *                 enum: [toys, gaming]
 *                 description: 商品分类
 *               type:
 *                 type: string
 *                 enum: [rent, sell, both]
 *                 description: 交易类型
 *               price:
 *                 type: number
 *                 format: float
 *                 description: 价格
 *               deposit:
 *                 type: number
 *                 format: float
 *                 nullable: true
 *                 description: 押金（租赁）
 *               images:
 *                 type: array
 *                 description: 商品图片
 *                 items:
 *                   type: string
 *               communityId:
 *                 type: string
 *                 nullable: true
 *                 description: 所属小区ID
 *               location:
 *                 type: string
 *                 nullable: true
 *                 description: 地理位置描述
 *             required: [title, category, type, price]
 *     responses:
 *       200:
 *         description: 创建成功
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
 *                         product:
 *                           $ref: '#/components/schemas/Product'
 *                       required: ['product']
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
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: 商品标题
 *               description:
 *                 type: string
 *                 nullable: true
 *                 description: 商品描述
 *               category:
 *                 type: string
 *                 enum: [toys, gaming]
 *                 description: 商品分类
 *               type:
 *                 type: string
 *                 enum: [rent, sell, both]
 *                 description: 交易类型
 *               price:
 *                 type: number
 *                 format: float
 *                 description: 价格
 *               deposit:
 *                 type: number
 *                 format: float
 *                 nullable: true
 *                 description: 押金（租赁）
 *               images:
 *                 type: array
 *                 description: 商品图片
 *                 items:
 *                   type: string
 *               status:
 *                 type: string
 *                 enum: [pending, active, sold, rented, offline]
 *                 description: 商品状态
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
 *                       properties:
 *                         product:
 *                           $ref: '#/components/schemas/Product'
 *                       required: ['product']
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
 *                         message:
 *                           type: string
 *                           example: '商品已删除'
 *                       required: ['message']
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
 *                         message:
 *                           type: string
 *                           example: '收藏成功'
 *                       required: ['message']
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
 *                         message:
 *                           type: string
 *                           example: '取消收藏成功'
 *                       required: ['message']
 *       401:
 *         description: 未认证
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/:id/unlike', authUser, unlikeProduct);

export default router;

