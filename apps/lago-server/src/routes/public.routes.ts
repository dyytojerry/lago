import { Router } from 'express';
import * as Joi from 'joi';

import {
  getNearbyCommunities,
  searchCommunities,
  getCommunity,
} from '../controllers/communities.app.controller';
import {
  getProductsForApp,
  getProductForApp,
  getHotProducts,
} from '../controllers/products.app.controller';
import regionsRoutes from './regions.routes';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Public
 *   description: 公共接口，无需登录即可访问
 */

// 省市区相关接口沿用现有实现
router.use('/regions', regionsRoutes);

/**
 * @swagger
 * /api/communities/nearby:
 *   get:
 *     summary: 获取附近小区（1公里内）
 *     tags: [Communities, Public]
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
  '/communities/nearby',
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
 *     tags: [Communities, Public]
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
  '/communities/search',
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
 *     tags: [Communities, Public]
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
router.get('/communities/:id', getCommunity);

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: 获取商品列表
 *     tags: [Products, Public]
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
 *                         pagination:
 *                           $ref: '#/components/schemas/Pagination'
 *                       required: ['products', 'pagination']
 */
router.get(
  '/products',
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
 * /api/products/hot:
 *   get:
 *     summary: 获取热门商品
 *     tags: [Products, Public]
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
 */
router.get(
  '/products/hot',
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
 *     tags: [Products, Public]
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
 *       404:
 *         description: 商品不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/products/:id', getProductForApp);

export default router;


