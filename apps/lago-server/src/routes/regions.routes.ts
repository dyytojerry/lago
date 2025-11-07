import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { createSuccessResponse, createErrorResponse } from '../lib/response';

const router = Router();

/**
 * @swagger
 * /api/regions/provinces:
 *   get:
 *     summary: 获取所有省份
 *     tags: [Regions]
 *     responses:
 *       200:
 *         description: 成功获取省份列表
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
 *                         provinces:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Province'
 *                       required: ['provinces']
 */
router.get('/provinces', async (req: Request, res: Response) => {
  try {
    const provinces = await prisma.province.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        code: true,
        name: true,
      },
    });

    return createSuccessResponse(res, { provinces });
  } catch (error) {
    console.error('获取省份失败:', error);
    return createErrorResponse(res, '获取省份失败', 500);
  }
});

/**
 * @swagger
 * /api/regions/cities:
 *   get:
 *     summary: 获取指定省份的城市列表
 *     tags: [Regions]
 *     parameters:
 *       - in: query
 *         name: provinceId
 *         schema:
 *           type: string
 *         required: true
 *         description: 省份ID
 *     responses:
 *       200:
 *         description: 成功获取城市列表
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
 *                         cities:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/City'
 *                       required: ['cities']
 */
router.get('/cities', async (req: Request, res: Response) => {
  try {
    const { provinceId } = req.query;

    if (!provinceId) {
      return createErrorResponse(res, '请提供省份ID', 400);
    }

    const cities = await prisma.city.findMany({
      where: {
        provinceId: provinceId as string,
        isActive: true,
      },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        code: true,
        name: true,
        provinceId: true,
      },
    });

    return createSuccessResponse(res, { cities });
  } catch (error) {
    console.error('获取城市失败:', error);
    return createErrorResponse(res, '获取城市失败', 500);
  }
});

/**
 * @swagger
 * /api/regions/districts:
 *   get:
 *     summary: 获取指定城市的区县列表
 *     tags: [Regions]
 *     parameters:
 *       - in: query
 *         name: cityId
 *         schema:
 *           type: string
 *         required: true
 *         description: 城市ID
 *     responses:
 *       200:
 *         description: 成功获取区县列表
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
 *                         districts:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/District'
 *                       required: ['districts']
 */
router.get('/districts', async (req: Request, res: Response) => {
  try {
    const { cityId } = req.query;

    if (!cityId) {
      return createErrorResponse(res, '请提供城市ID', 400);
    }

    const districts = await prisma.district.findMany({
      where: {
        cityId: cityId as string,
        isActive: true,
      },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        code: true,
        name: true,
        cityId: true,
      },
    });

    return createSuccessResponse(res, { districts });
  } catch (error) {
    console.error('获取区县失败:', error);
    return createErrorResponse(res, '获取区县失败', 500);
  }
});

/**
 * @swagger
 * /api/regions/location:
 *   get:
 *     summary: 根据经纬度获取省市区信息（逆地理编码）
 *     tags: [Regions]
 *     parameters:
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *         required: true
 *       - in: query
 *         name: lng
 *         schema:
 *           type: number
 *         required: true
 *     responses:
 *       200:
 *         description: 成功获取省市区信息
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
 *                         province: { $ref: '#/components/schemas/Province', nullable: true }
 *                         city: { $ref: '#/components/schemas/City', nullable: true }
 *                         district: { $ref: '#/components/schemas/District', nullable: true }
 *                         message: { type: 'string', nullable: true }
 */
router.get('/location', async (req: Request, res: Response) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return createErrorResponse(res, '请提供经纬度', 400);
    }

    // TODO: 使用高德地图逆地理编码API获取省市区信息
    // 这里先返回一个示例响应
    return createSuccessResponse(res, {
      province: null,
      city: null,
      district: null,
      message: '需要集成高德地图逆地理编码API',
    });
  } catch (error) {
    console.error('获取位置信息失败:', error);
    return createErrorResponse(res, '获取位置信息失败', 500);
  }
});

export default router;

