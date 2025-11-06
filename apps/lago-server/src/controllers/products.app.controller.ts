import { Request, Response } from 'express';
import prisma from '../lib/prisma';

/**
 * 获取商品列表（小程序端）
 */
export async function getProductsForApp(req: Request, res: Response) {
  try {
    const {
      page = '1',
      limit = '20',
      category,
      type,
      search,
      communityId,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      status: 'active', // 只返回已审核通过的商品
    };

    if (category) {
      where.category = category;
    }

    if (type) {
      where.type = type;
    }

    if (communityId) {
      where.communityId = communityId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = {};
    orderBy[sortBy as string] = sortOrder;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limitNum,
        orderBy,
        include: {
          owner: {
            select: {
              id: true,
              nickname: true,
              avatarUrl: true,
              creditScore: true,
              isVerified: true,
            },
          },
          community: {
            select: {
              id: true,
              name: true,
              location: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('获取商品列表失败:', error);
    res.status(500).json({ error: '获取商品列表失败' });
  }
}

/**
 * 获取商品详情（小程序端）
 */
export async function getProductForApp(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // 增加浏览次数
    await prisma.product.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            nickname: true,
            avatarUrl: true,
            phone: true,
            role: true,
            creditScore: true,
            isVerified: true,
          },
        },
        community: {
          select: {
            id: true,
            name: true,
            location: true,
            address: true,
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ error: '商品不存在' });
    }

    // 检查用户是否已收藏
    let isLiked = false;
    if (userId) {
      // TODO: 如果后续有收藏表，在这里查询
      // const like = await prisma.productLike.findUnique({
      //   where: { userId_productId: { userId, productId: id } },
      // });
      // isLiked = !!like;
    }

    res.json({
      product: {
        ...product,
        isLiked,
      },
    });
  } catch (error) {
    console.error('获取商品详情失败:', error);
    res.status(500).json({ error: '获取商品详情失败' });
  }
}

/**
 * 获取推荐商品
 */
export async function getRecommendedProducts(req: Request, res: Response) {
  try {
    const { limit = '10' } = req.query;
    const limitNum = parseInt(limit as string);
    const userId = req.user?.id;

    // 获取用户所在的小区
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { communityIds: true },
    });

    const where: any = {
      status: 'active',
      isVerified: true, // 优先推荐认证商品
    };

    // 如果用户有小区，优先推荐同小区的商品
    if (user?.communityIds && user.communityIds.length > 0) {
      where.communityId = { in: user.communityIds };
    }

    const products = await prisma.product.findMany({
      where,
      take: limitNum,
      orderBy: [
        { isVerified: 'desc' },
        { viewCount: 'desc' },
        { likeCount: 'desc' },
        { createdAt: 'desc' },
      ],
      include: {
        owner: {
          select: {
            id: true,
            nickname: true,
            avatarUrl: true,
            creditScore: true,
            isVerified: true,
          },
        },
        community: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
      },
    });

    res.json({ products });
  } catch (error) {
    console.error('获取推荐商品失败:', error);
    res.status(500).json({ error: '获取推荐商品失败' });
  }
}

/**
 * 获取热门商品
 */
export async function getHotProducts(req: Request, res: Response) {
  try {
    const { limit = '10' } = req.query;
    const limitNum = parseInt(limit as string);

    const products = await prisma.product.findMany({
      where: {
        status: 'active',
      },
      take: limitNum,
      orderBy: [
        { viewCount: 'desc' },
        { likeCount: 'desc' },
        { createdAt: 'desc' },
      ],
      include: {
        owner: {
          select: {
            id: true,
            nickname: true,
            avatarUrl: true,
            creditScore: true,
            isVerified: true,
          },
        },
        community: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
      },
    });

    res.json({ products });
  } catch (error) {
    console.error('获取热门商品失败:', error);
    res.status(500).json({ error: '获取热门商品失败' });
  }
}

/**
 * 创建商品
 */
export async function createProduct(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: '未认证' });
    }

    const {
      title,
      description,
      category,
      type,
      price,
      deposit,
      images,
      communityId,
      location,
    } = req.body;

    const product = await prisma.product.create({
      data: {
        ownerId: userId,
        title,
        description,
        category,
        type,
        price,
        deposit: type === 'rent' || type === 'both' ? deposit : null,
        images,
        communityId,
        location,
        status: 'pending', // 新商品需要审核
      },
      include: {
        owner: {
          select: {
            id: true,
            nickname: true,
            avatarUrl: true,
            creditScore: true,
            isVerified: true,
          },
        },
        community: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
      },
    });

    res.status(201).json({ product });
  } catch (error) {
    console.error('创建商品失败:', error);
    res.status(500).json({ error: '创建商品失败' });
  }
}

/**
 * 更新商品
 */
export async function updateProduct(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: '未认证' });
    }

    // 检查商品所有权
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return res.status(404).json({ error: '商品不存在' });
    }

    if (product.ownerId !== userId) {
      return res.status(403).json({ error: '无权限修改此商品' });
    }

    // 如果商品已审核通过，更新后需要重新审核
    const updateData: any = {
      ...req.body,
    };

    if (product.status === 'active' && req.body.status !== 'offline') {
      updateData.status = 'pending';
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        owner: {
          select: {
            id: true,
            nickname: true,
            avatarUrl: true,
            creditScore: true,
            isVerified: true,
          },
        },
        community: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
      },
    });

    res.json({ product: updatedProduct });
  } catch (error) {
    console.error('更新商品失败:', error);
    res.status(500).json({ error: '更新商品失败' });
  }
}

/**
 * 删除商品
 */
export async function deleteProduct(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: '未认证' });
    }

    // 检查商品所有权
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return res.status(404).json({ error: '商品不存在' });
    }

    if (product.ownerId !== userId) {
      return res.status(403).json({ error: '无权限删除此商品' });
    }

    // 如果商品有订单，不能删除
    const orderCount = await prisma.order.count({
      where: {
        productId: id,
        status: { notIn: ['cancelled', 'completed'] },
      },
    });

    if (orderCount > 0) {
      return res.status(400).json({ error: '商品有进行中的订单，无法删除' });
    }

    await prisma.product.delete({
      where: { id },
    });

    res.json({ success: true, message: '商品已删除' });
  } catch (error) {
    console.error('删除商品失败:', error);
    res.status(500).json({ error: '删除商品失败' });
  }
}

/**
 * 收藏商品
 */
export async function likeProduct(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: '未认证' });
    }

    // 增加收藏数
    await prisma.product.update({
      where: { id },
      data: { likeCount: { increment: 1 } },
    });

    // TODO: 如果后续有收藏表，在这里记录收藏关系

    res.json({ success: true, message: '收藏成功' });
  } catch (error) {
    console.error('收藏商品失败:', error);
    res.status(500).json({ error: '收藏商品失败' });
  }
}

/**
 * 取消收藏商品
 */
export async function unlikeProduct(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: '未认证' });
    }

    // 减少收藏数
    await prisma.product.update({
      where: { id },
      data: { likeCount: { decrement: 1 } },
    });

    // TODO: 如果后续有收藏表，在这里删除收藏关系

    res.json({ success: true, message: '取消收藏成功' });
  } catch (error) {
    console.error('取消收藏商品失败:', error);
    res.status(500).json({ error: '取消收藏商品失败' });
  }
}

