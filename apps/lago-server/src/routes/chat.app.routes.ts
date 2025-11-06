import { Router } from 'express';
import {
  getChatRooms,
  getChatRoom,
  createChatRoom,
  getMessages,
  sendMessage,
} from '../controllers/chat.app.controller';
import { authUser } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import * as Joi from 'joi';

const router = Router();

// 所有路由需要用户认证
router.use(authUser);

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: 小程序端聊天相关接口
 */

/**
 * @swagger
 * /api/chat/rooms:
 *   get:
 *     summary: 获取聊天室列表
 *     tags: [Chat, App]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rooms:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ChatRoom'
 */
router.get('/rooms', getChatRooms);

/**
 * @swagger
 * /api/chat/rooms/{id}:
 *   get:
 *     summary: 获取聊天室详情
 *     tags: [Chat, App]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 聊天室ID
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 room:
 *                   $ref: '#/components/schemas/ChatRoom'
 */
router.get('/rooms/:id', getChatRoom);

/**
 * @swagger
 * /api/chat/rooms:
 *   post:
 *     summary: 创建聊天室
 *     tags: [Chat, App]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *                 description: 商品ID（可选）
 *               otherUserId:
 *                 type: string
 *                 description: 对方用户ID
 *     responses:
 *       201:
 *         description: 创建成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 room:
 *                   $ref: '#/components/schemas/ChatRoom'
 */
router.post(
  '/rooms',
  validateRequest(
    Joi.object({
      body: Joi.object({
        productId: Joi.string().optional(),
        otherUserId: Joi.string().required(),
      }),
    })
  ),
  createChatRoom
);

/**
 * @swagger
 * /api/chat/rooms/{id}/messages:
 *   get:
 *     summary: 获取聊天消息列表
 *     tags: [Chat, App]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 聊天室ID
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
 *           default: "50"
 *         description: 每页数量
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 messages:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ChatMessage'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get(
  '/rooms/:id/messages',
  validateRequest(
    Joi.object({
      query: Joi.object({
        page: Joi.string().optional(),
        limit: Joi.string().optional(),
      }),
    })
  ),
  getMessages
);

/**
 * @swagger
 * /api/chat/rooms/{id}/messages:
 *   post:
 *     summary: 发送消息
 *     tags: [Chat, App]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 聊天室ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: 消息内容
 *               type:
 *                 type: string
 *                 enum: [text, image, product_card]
 *                 default: "text"
 *               fileUrl:
 *                 type: string
 *                 description: 文件URL（图片等）
 *               productId:
 *                 type: string
 *                 description: 商品ID（商品卡片）
 *     responses:
 *       201:
 *         description: 发送成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   $ref: '#/components/schemas/ChatMessage'
 */
router.post(
  '/rooms/:id/messages',
  validateRequest(
    Joi.object({
      body: Joi.object({
        content: Joi.string().required(),
        type: Joi.string().valid('text', 'image', 'product_card').optional(),
        fileUrl: Joi.string().optional(),
        productId: Joi.string().optional(),
      }),
    })
  ),
  sendMessage
);

export default router;

