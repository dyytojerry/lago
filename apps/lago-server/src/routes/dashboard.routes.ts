import { Router } from 'express';
import {
  getDashboardStats,
  getDashboardTrends,
  getPendingItems,
} from '../controllers/dashboard.controller';
import { authOperation } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: AdminDashboard
 *   description: 运营系统仪表盘相关接口
 */

/**
 * @swagger
 * /api/admin/dashboard/stats:
 *   get:
 *     summary: 获取仪表盘核心指标
 *     tags: [AdminDashboard, Operation]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取核心指标
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
 *                         gmv:
 *                           type: object
 *                           properties:
 *                             today: { type: 'number', description: '今日GMV' }
 *                             week: { type: 'number', description: '本周GMV' }
 *                             month: { type: 'number', description: '本月GMV' }
 *                             total: { type: 'number', description: '累计GMV' }
 *                           required: ['today', 'week', 'month', 'total']
 *                         users:
 *                           type: object
 *                           properties:
 *                             newToday: { type: 'integer', description: '今日新增用户' }
 *                             newWeek: { type: 'integer', description: '本周新增用户' }
 *                             activeToday: { type: 'integer', description: '今日活跃用户' }
 *                             total: { type: 'integer', description: '总用户数' }
 *                             active: { type: 'integer', description: '活跃用户数' }
 *                           required: ['newToday', 'newWeek', 'activeToday', 'total', 'active']
 *                         communities:
 *                           type: object
 *                           properties:
 *                             active: { type: 'integer', description: '活跃小区数' }
 *                             new: { type: 'integer', description: '新增小区数' }
 *                           required: ['active', 'new']
 *                         orders:
 *                           type: object
 *                           properties:
 *                             today: { type: 'integer', description: '今日订单数' }
 *                             pending: { type: 'integer', description: '待处理订单数' }
 *                           required: ['today', 'pending']
 *                         pending:
 *                           type: object
 *                           properties:
 *                             products: { type: 'integer', description: '待审核商品数' }
 *                             approvals: { type: 'integer', description: '待审核入驻数' }
 *                             complaints: { type: 'integer', description: '待处理投诉数' }
 *                           required: ['products', 'approvals', 'complaints']
 *                       required: ['gmv', 'users', 'communities', 'orders', 'pending']
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
router.get('/stats', authOperation, getDashboardStats);

/**
 * @swagger
 * /api/admin/dashboard/trends:
 *   get:
 *     summary: 获取趋势数据
 *     tags: [AdminDashboard, Operation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d]
 *           default: 7d
 *         description: 时间周期
 *     responses:
 *       200:
 *         description: 成功获取趋势数据
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
 *                         gmv:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               date: { type: 'string', format: 'date' }
 *                               value: { type: 'number' }
 *                         users:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               date: { type: 'string', format: 'date' }
 *                               value: { type: 'integer' }
 *                       required: ['gmv', 'users']
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
router.get('/trends', authOperation, getDashboardTrends);

/**
 * @swagger
 * /api/admin/dashboard/pending:
 *   get:
 *     summary: 获取待处理事项
 *     tags: [AdminDashboard, Operation]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取待处理事项
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
 *                         approvals:
 *                           type: array
 *                           items:
 *                             type: object
 *                           description: '待审核入驻申请（待实现）'
 *                         complaints:
 *                           type: array
 *                           items:
 *                             type: object
 *                           description: '待处理投诉（待实现）'
 *                       required: ['products', 'approvals', 'complaints']
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
router.get('/pending', authOperation, getPendingItems);

export default router;

