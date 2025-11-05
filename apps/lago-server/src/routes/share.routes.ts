import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

/**
 * @swagger
 * /api/share:
 *   post:
 *     summary: 获取分享数据
 *     tags: [Share]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [appMessage, timeline]
 *                 description: 分享类型
 *               path:
 *                 type: string
 *                 description: 当前页面路径
 *               options:
 *                 type: object
 *                 description: 额外选项
 *     responses:
 *       200:
 *         description: 分享数据
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                 desc:
 *                   type: string
 *                 path:
 *                   type: string
 *                 imageUrl:
 *                   type: string
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { type, path: pagePath, options } = req.body;

    // 根据页面路径判断分享内容类型
    let shareData = {
      title: '来购 - 社区化二手与租赁平台',
      desc: '发现身边的优质商品，轻松租售',
      path: '/pages/webview/webview',
      imageUrl: '/images/share-logo.png'
    };

    // 解析路径，获取可能的商品ID或其他参数
    let productId: string | null = null;
    try {
      if (pagePath) {
        // 处理相对路径和绝对路径
        const fullUrl = pagePath.startsWith('http') 
          ? pagePath 
          : `http://localhost${pagePath}`;
        const url = new URL(fullUrl);
        productId = url.searchParams.get('productId') || url.searchParams.get('id');
        
        // 也尝试从路径中提取ID（如 /products/123）
        if (!productId && url.pathname.includes('/products/')) {
          const match = url.pathname.match(/\/products\/([^\/]+)/);
          if (match) {
            productId = match[1];
          }
        }
      }
    } catch (error) {
      console.warn('解析路径失败:', error);
    }

    // 如果是商品详情页，从数据库获取商品信息生成分享数据
    if (productId) {
      try {
        const product = await prisma.product.findUnique({
          where: { id: productId },
          select: {
            title: true,
            description: true,
            images: true,
            price: true,
            type: true,
          }
        });

        if (product) {
          const imageUrl = product.images && product.images.length > 0 
            ? (product.images as string[])[0] 
            : '/images/share-logo.png';

          shareData = {
            title: `${product.title} - ${product.type === 'RENT' ? '租赁' : '出售'}`,
            desc: product.description || `价格：¥${product.price}`,
            path: `/pages/webview/webview?url=${encodeURIComponent(pagePath)}`,
            imageUrl: imageUrl
          };
        }
      } catch (error) {
        console.error('获取商品信息失败:', error);
        // 继续使用默认分享数据
      }
    }

    // 根据分享类型调整内容
    if (type === 'timeline') {
      // 朋友圈分享只需要标题和图片
      return res.json({
        title: shareData.title,
        imageUrl: shareData.imageUrl
      });
    }

    // 好友分享返回完整数据
    return res.json(shareData);
  } catch (error) {
    console.error('获取分享数据失败:', error);
    return res.status(500).json({
      error: '获取分享数据失败',
      title: '来购 - 社区化二手与租赁平台',
      desc: '发现身边的优质商品，轻松租售',
      path: '/pages/webview/webview',
      imageUrl: '/images/share-logo.png'
    });
  }
});

export default router;

