import { Router } from 'express';
import multer from 'multer';
import {
  uploadSingleMedia,
  initMultipartUpload,
  uploadMultipartPart,
  completeMultipartUpload,
  abortMultipartUpload,
} from '../controllers/upload.controller';
import { authUser } from '../middleware/auth';

const router = Router();
const memoryStorage = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * tags:
 *   name: Uploads
 *   description: 文件上传接口
 */

/**
 * @swagger
 * /api/uploads/single:
 *   post:
 *     summary: 上传单个文件
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               kind:
 *                 type: string
 *                 enum: [image, video, file]
 *     responses:
 *       200:
 *         description: 上传成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/UploadSingleResponse'
 *       400:
 *         description: 参数错误
 *       401:
 *         description: 未认证
 */
router.post('/single', authUser, memoryStorage.single('file'), uploadSingleMedia);

/**
 * @swagger
 * /api/uploads/multipart/init:
 *   post:
 *     summary: 初始化分片上传
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fileName:
 *                 type: string
 *               mimeType:
 *                 type: string
 *               kind:
 *                 type: string
 *                 enum: [image, video, file]
 *             required:
 *               - fileName
 *     responses:
 *       200:
 *         description: 初始化成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/MultipartInitResponse'
 */
router.post('/multipart/init', authUser, initMultipartUpload);

/**
 * @swagger
 * /api/uploads/multipart/part:
 *   post:
 *     summary: 上传分片
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               uploadId:
 *                 type: string
 *               objectKey:
 *                 type: string
 *               partNumber:
 *                 type: integer
 *               file:
 *                 type: string
 *                 format: binary
 *             required:
 *               - uploadId
 *               - objectKey
 *               - partNumber
 *               - file
 *     responses:
 *       200:
 *         description: 分片上传成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/MultipartPartResponse'
 */
router.post('/multipart/part', authUser, memoryStorage.single('file'), uploadMultipartPart);

/**
 * @swagger
 * /api/uploads/multipart/complete:
 *   post:
 *     summary: 完成分片上传
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MultipartCompleteRequest'
 *     responses:
 *       200:
 *         description: 成功
 *       400:
 *         description: 参数错误
 */
router.post('/multipart/complete', authUser, completeMultipartUpload);

/**
 * @swagger
 * /api/uploads/multipart/abort:
 *   post:
 *     summary: 取消分片上传
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MultipartAbortRequest'
 *     responses:
 *       200:
 *         description: 成功
 */
router.post('/multipart/abort', authUser, abortMultipartUpload);

export default router;

