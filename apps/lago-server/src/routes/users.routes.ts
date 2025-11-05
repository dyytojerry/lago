import { Router } from 'express';
import {
  getUsers,
  getUser,
  updateUserStatus,
} from '../controllers/users.controller';
import { authOperation } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import * as Joi from 'joi';

const router = Router();

// 所有路由需要运营端认证
router.use(authOperation);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: 获取用户列表
 *     tags: [Admin Users]
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
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, merchant, property, admin]
 *         description: 用户角色
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: 用户状态
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 搜索关键词（昵称/手机号/邮箱）
 *     responses:
 *       200:
 *         description: 成功获取用户列表
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserListResponse'
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
        role: Joi.string().valid('user', 'merchant', 'property', 'admin').optional(),
        status: Joi.string().valid('active', 'inactive').optional(),
        search: Joi.string().optional(),
      }),
    })
  ),
  getUsers
);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: 获取用户详情
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 用户ID
 *     responses:
 *       200:
 *         description: 成功获取用户详情
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserDetailResponse'
 *       401:
 *         description: 未认证
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 用户不存在
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
router.get('/:id', getUser);

/**
 * @swagger
 * /api/admin/users/{id}/status:
 *   put:
 *     summary: 更新用户状态
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 用户ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserStatusUpdateRequest'
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
 *         description: 用户不存在
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
        isActive: Joi.boolean().optional(),
        creditScore: Joi.number().integer().min(0).max(1000).optional(),
      }),
    })
  ),
  updateUserStatus
);

export default router;
