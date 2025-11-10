import { Router } from 'express';
import { authOperation, requirePermissions } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import {
  listMallBanners,
  createMallBanner,
  updateMallBanner,
  removeMallBanner,
} from '../controllers/mallBanners.controller';
import {
  listMallBannersSchema,
  createMallBannerSchema,
  updateMallBannerSchema,
  removeMallBannerSchema,
} from '../schemas/mallBannerSchema';

const router = Router();

router.use(authOperation, requirePermissions('mall_banners:manage'));

/**
 * @swagger
 * tags:
 *   name: MallBanners
 *   description: 商城钻石位管理接口
 */

/**
 * @swagger
 * /api/admin/mall/banners:
 *   get:
 *     summary: 获取商城钻石位列表
 *     tags: [MallBanners, Operation]
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
 *           maximum: 200
 *           default: 50
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [inactive, active]
 *     responses:
 *       200:
 *         description: 返回钻石位列表
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
 *                       required: ['banners', 'pagination']
 *                       properties:
 *                         banners:
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
router.get('/', validateRequest(listMallBannersSchema), listMallBanners);

/**
 * @swagger
 * /api/admin/mall/banners:
 *   post:
 *     summary: 创建商城钻石位
 *     tags: [MallBanners, Operation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, imageUrl]
 *             properties:
 *               title:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *               linkUrl:
 *                 type: string
 *                 format: uri
 *               status:
 *                 type: string
 *                 enum: [inactive, active]
 *                 default: active
 *               sortOrder:
 *                 type: integer
 *                 default: 0
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
 *                       required: ['banner']
 *                       properties:
 *                         banner:
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
router.post('/', validateRequest(createMallBannerSchema), createMallBanner);

/**
 * @swagger
 * /api/admin/mall/banners/{id}:
 *   put:
 *     summary: 更新商城钻石位
 *     tags: [MallBanners, Operation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 钻石位ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *               linkUrl:
 *                 type: string
 *                 format: uri
 *               status:
 *                 type: string
 *                 enum: [inactive, active]
 *               sortOrder:
 *                 type: integer
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
 *                       required: ['banner']
 *                       properties:
 *                         banner:
 *                           type: object
 *                           additionalProperties: true
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未认证
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 钻石位不存在
 *       500:
 *         description: 服务器错误
 */
router.put('/:id', validateRequest(updateMallBannerSchema), updateMallBanner);

/**
 * @swagger
 * /api/admin/mall/banners/{id}:
 *   delete:
 *     summary: 删除商城钻石位
 *     tags: [MallBanners, Operation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
 *                       required: ['message']
 *                       properties:
 *                         message:
 *                           type: string
 *                           example: '商城钻石位已删除'
 *       401:
 *         description: 未认证
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 钻石位不存在
 *       500:
 *         description: 服务器错误
 */
router.delete('/:id', validateRequest(removeMallBannerSchema), removeMallBanner);

export default router;
