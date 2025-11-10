import { Router } from 'express';
import { authOperation, requirePermissions } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import {
  listMallProducts,
  createMallProduct,
  updateMallProduct,
  removeMallProduct,
} from '../controllers/mallProducts.controller';
import {
  listMallProductsSchema,
  createMallProductSchema,
  updateMallProductSchema,
  removeMallProductSchema,
} from '../schemas/mallProductSchema';

const router = Router();

router.use(authOperation, requirePermissions('mall_products:manage'));

/**
 * @swagger
 * tags:
 *   name: MallProducts
 *   description: 商城运营商品管理接口
 */

/**
 * @swagger
 * /api/admin/mall/products:
 *   get:
 *     summary: 获取商城商品列表
 *     tags: [MallProducts, Operation]
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
 *           maximum: 100
 *           default: 20
 *         description: 每页数量
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, offline]
 *         description: 商品状态过滤
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 按标题或描述模糊搜索
 *     responses:
 *       200:
 *         description: 返回商城商品列表
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
 *                       required: ['products', 'pagination']
 *                       properties:
 *                         products:
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
router.get('/', validateRequest(listMallProductsSchema), listMallProducts);

/**
 * @swagger
 * /api/admin/mall/products:
 *   post:
 *     summary: 创建商城商品
 *     tags: [MallProducts, Operation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, price]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *                 format: float
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *               visibleCommunityIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               status:
 *                 type: string
 *                 enum: [draft, published, offline]
 *                 default: draft
 *     responses:
 *       201:
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
 *                       required: ['product']
 *                       properties:
 *                         product:
 *                           type: object
 *                           additionalProperties: true
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未认证
 *       403:
 *         description: 权限不足
 *       500:
 *         description: 服务器错误
 */
router.post('/', validateRequest(createMallProductSchema), createMallProduct);

/**
 * @swagger
 * /api/admin/mall/products/{id}:
 *   put:
 *     summary: 更新商城商品
 *     tags: [MallProducts, Operation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 商城商品ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *                 format: float
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *               visibleCommunityIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               status:
 *                 type: string
 *                 enum: [draft, published, offline]
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
 *                       required: ['product']
 *                       properties:
 *                         product:
 *                           type: object
 *                           additionalProperties: true
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未认证
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 商品不存在
 *       500:
 *         description: 服务器错误
 */
router.put('/:id', validateRequest(updateMallProductSchema), updateMallProduct);

/**
 * @swagger
 * /api/admin/mall/products/{id}:
 *   delete:
 *     summary: 下架商城商品
 *     tags: [MallProducts, Operation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 商城商品ID
 *     responses:
 *       200:
 *         description: 已下架
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
 *                       required: ['message']
 *                       properties:
 *                         message:
 *                           type: string
 *                           example: '商城商品已下架'
 *       401:
 *         description: 未认证
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 商品不存在
 *       500:
 *         description: 服务器错误
 */
router.delete('/:id', validateRequest(removeMallProductSchema), removeMallProduct);

export default router;
