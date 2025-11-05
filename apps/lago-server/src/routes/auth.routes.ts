import { Router } from 'express';
import {
  wechatLogin,
  phoneLogin,
  phoneRegister,
  operationLogin,
  getCurrentUser,
  getCurrentStaff,
} from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validateRequest';
import { authUser, authOperation } from '../middleware/auth';
import {
  wechatLoginSchema,
  phoneLoginSchema,
  phoneRegisterSchema,
  operationLoginSchema,
} from '../schemas/auth.joi';

const router = Router();

/**
 * @swagger
 * /api/auth/wechat/login:
 *   post:
 *     summary: 微信登录（小程序端）
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WechatLoginRequest'
 *     responses:
 *       200:
 *         description: 登录成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: 登录失败
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/wechat/login', validateRequest(wechatLoginSchema), wechatLogin);

/**
 * @swagger
 * /api/auth/phone/login:
 *   post:
 *     summary: 手机号登录（小程序端）
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PhoneLoginRequest'
 *     responses:
 *       200:
 *         description: 登录成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: 登录失败
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/phone/login', validateRequest(phoneLoginSchema), phoneLogin);

/**
 * @swagger
 * /api/auth/phone/register:
 *   post:
 *     summary: 手机号注册（小程序端）
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PhoneRegisterRequest'
 *     responses:
 *       201:
 *         description: 注册成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: 注册失败
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/phone/register', validateRequest(phoneRegisterSchema), phoneRegister);

/**
 * @swagger
 * /api/auth/operation/login:
 *   post:
 *     summary: 运营系统登录
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OperationLoginRequest'
 *     responses:
 *       200:
 *         description: 登录成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OperationLoginResponse'
 *       401:
 *         description: 登录失败
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/operation/login', validateRequest(operationLoginSchema), operationLogin);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: 获取当前用户信息（小程序端）
 *     tags: [Auth]
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
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: 未认证
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/me', authUser, getCurrentUser);

/**
 * @swagger
 * /api/auth/operation/me:
 *   get:
 *     summary: 获取当前运营人员信息
 *     tags: [Auth]
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
 *                 staff:
 *                   $ref: '#/components/schemas/OperationStaff'
 *       401:
 *         description: 未认证
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/operation/me', authOperation, getCurrentStaff);

export default router;

