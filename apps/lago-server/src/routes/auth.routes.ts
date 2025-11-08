import { Router } from 'express';
import {
  universalLogin,
  wechatLogin,
  phoneLogin,
  phoneRegister,
  operationLogin,
  userLogout,
  operationLogout,
  getCurrentUser,
  getCurrentStaff,
  refreshUserToken,
  refreshOperationToken,
} from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validateRequest';
import { authUser, authOperation } from '../middleware/auth';
import {
  universalLoginSchema,
  wechatLoginSchema,
  phoneLoginSchema,
  phoneRegisterSchema,
  operationLoginSchema,
  refreshTokenSchema,
  refreshOperationTokenSchema,
} from '../schemas/authSchema';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: 用户认证相关接口
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: 通用登录接口（支持手机号/邮箱/微信ID + 密码）
 *     tags: [Auth, App]
 *     description: |
 *       支持多种登录方式：
 *       - 手机号 + 密码
 *       - 邮箱 + 密码
 *       - 微信ID + 密码
 *       - 微信OpenID（无需密码）
 *       如果账号不存在且提供了密码，会自动创建账号并登录
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UniversalLoginRequest'
 *     responses:
 *       200:
 *         description: 登录成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: 参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 登录失败（密码错误等）
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: 账号已被禁用
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/login', validateRequest(universalLoginSchema), universalLogin);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: 用户退出登录（C端）
 *     tags: [Auth, App]
 *     security:
 *       - bearerAuth: []
 *     description: 退出登录后，JWT Token将被加入黑名单，无法继续使用
 *     responses:
 *       200:
 *         description: 退出登录成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *       401:
 *         description: 未认证
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/logout', authUser, userLogout);

/**
 * @swagger
 * /api/auth/operation/logout:
 *   post:
 *     summary: 运营系统退出登录
 *     tags: [Auth, Operation]
 *     security:
 *       - bearerAuth: []
 *     description: 退出登录后，JWT Token将被加入黑名单，无法继续使用
 *     responses:
 *       200:
 *         description: 退出登录成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *       401:
 *         description: 未认证
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/operation/logout', authOperation, operationLogout);

/**
 * @swagger
 * /api/auth/wechat/login:
 *   post:
 *     summary: 微信登录（小程序端）
 *     tags: [Auth, App]
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
 *     tags: [Auth, App]
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
 *     tags: [Auth, App]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PhoneRegisterRequest'
 *     responses:
 *       200:
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
 *     tags: [Auth, Operation]
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
 *     tags: [Auth, App]
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
 *     tags: [Auth, Operation]
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

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: 使用refreshToken获取新的访问令牌
 *     tags: [Auth, App]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: 刷新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       422:
 *         description: refreshToken失效
 */
router.post('/refresh', validateRequest(refreshTokenSchema), refreshUserToken);

/**
 * @swagger
 * /api/auth/operation/refresh:
 *   post:
 *     summary: 运营端刷新访问令牌
 *     tags: [Auth, Operation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: 刷新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       422:
 *         description: refreshToken失效
 */
router.post('/operation/refresh', validateRequest(refreshOperationTokenSchema), refreshOperationToken);

export default router;

