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
 * /api/admin/dashboard/stats:
 *   get:
 *     summary: 获取仪表盘核心指标
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取核心指标
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardStats'
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
 *     tags: [Admin Dashboard]
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
 *               $ref: '#/components/schemas/DashboardTrends'
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
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取待处理事项
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PendingItems'
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

