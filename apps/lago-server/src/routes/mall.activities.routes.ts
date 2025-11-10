import { Router } from 'express';
import { authOperation, requirePermissions } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import {
  listMallActivities,
  createMallActivity,
  updateMallActivity,
  removeMallActivity,
} from '../controllers/mallActivities.controller';
import {
  listMallActivitiesSchema,
  createMallActivitySchema,
  updateMallActivitySchema,
  removeMallActivitySchema,
} from '../schemas/mallActivitySchema';

const router = Router();

router.use(authOperation, requirePermissions('mall_activities:manage'));

/**
 * @swagger
 * tags:
 *   name: MallActivities
 *   description: 商城运营活动管理接口
 */

/**
 * @swagger
 * /api/admin/mall/activities:
 *   get:
 *     summary: 获取商城活动列表
 *     tags: [MallActivities, Operation]
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
 *         description: 活动状态过滤
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 按标题或描述模糊搜索
 *     responses:
 *       200:
 *         description: 返回活动列表
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
 *                       required: ['activities', 'pagination']
 *                       properties:
 *                         activities:
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
router.get('/', validateRequest(listMallActivitiesSchema), listMallActivities);

/**
 * @swagger
 * /api/admin/mall/activities:
 *   post:
 *     summary: 创建商城活动
 *     tags: [MallActivities, Operation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               coverImage:
 *                 type: string
 *                 format: uri
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
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
 *                       required: ['activity']
 *                       properties:
 *                         activity:
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
router.post('/', validateRequest(createMallActivitySchema), createMallActivity);

/**
 * @swagger
 * /api/admin/mall/activities/{id}:
 *   put:
 *     summary: 更新商城活动
 *     tags: [MallActivities, Operation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 活动ID
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
 *               coverImage:
 *                 type: string
 *                 format: uri
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
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
 *                       required: ['activity']
 *                       properties:
 *                         activity:
 *                           type: object
 *                           additionalProperties: true
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未认证
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 活动不存在
 *       500:
 *         description: 服务器错误
 */
router.put('/:id', validateRequest(updateMallActivitySchema), updateMallActivity);

/**
 * @swagger
 * /api/admin/mall/activities/{id}:
 *   delete:
 *     summary: 下架商城活动
 *     tags: [MallActivities, Operation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 活动ID
 *     responses:
 *       200:
 *         description: 已处理
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
 *       401:
 *         description: 未认证
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 活动不存在
 *       500:
 *         description: 服务器错误
 */
router.delete('/:id', validateRequest(removeMallActivitySchema), removeMallActivity);

export default router;
