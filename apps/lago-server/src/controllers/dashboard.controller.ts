import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { createSuccessResponse, createErrorResponse } from '../lib/response';

/**
 * 获取仪表盘核心指标
 */
export async function getDashboardStats(req: Request, res: Response) {
  try {
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const weekStart = new Date(now.setDate(now.getDate() - 7));
    const monthStart = new Date(now.setDate(now.getDate() - 30));

    // 全站 GMV
    const todayGMV = await prisma.order.aggregate({
      where: {
        createdAt: { gte: todayStart },
        status: { in: ['paid', 'confirmed', 'completed'] },
      },
      _sum: { amount: true },
    });

    const weekGMV = await prisma.order.aggregate({
      where: {
        createdAt: { gte: weekStart },
        status: { in: ['paid', 'confirmed', 'completed'] },
      },
      _sum: { amount: true },
    });

    const monthGMV = await prisma.order.aggregate({
      where: {
        createdAt: { gte: monthStart },
        status: { in: ['paid', 'confirmed', 'completed'] },
      },
      _sum: { amount: true },
    });

    const totalGMV = await prisma.order.aggregate({
      where: {
        status: { in: ['paid', 'confirmed', 'completed'] },
      },
      _sum: { amount: true },
    });

    // 用户增长
    const newUsersToday = await prisma.user.count({
      where: { createdAt: { gte: todayStart } },
    });

    const newUsersWeek = await prisma.user.count({
      where: { createdAt: { gte: weekStart } },
    });

    const activeUsersToday = await prisma.user.count({
      where: {
        isActive: true,
        OR: [
          { ordersAsBuyer: { some: { createdAt: { gte: todayStart } } } },
          { ordersAsSeller: { some: { createdAt: { gte: todayStart } } } },
        ],
      },
    });

    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({ where: { isActive: true } });

    // 活跃小区
    const activeCommunities = await prisma.community.count({
      where: {
        isActive: true,
        products: { some: { status: 'active' } },
      },
    });

    const newCommunities = await prisma.community.count({
      where: { createdAt: { gte: monthStart } },
    });

    // 订单统计
    const ordersToday = await prisma.order.count({
      where: { createdAt: { gte: todayStart } },
    });

    const pendingOrders = await prisma.order.count({
      where: { status: 'pending' },
    });

    // 待审核事项
    const pendingProducts = await prisma.product.count({
      where: { status: 'pending' },
    });

    return createSuccessResponse(res, {
      gmv: {
        today: Number(todayGMV._sum.amount || 0),
        week: Number(weekGMV._sum.amount || 0),
        month: Number(monthGMV._sum.amount || 0),
        total: Number(totalGMV._sum.amount || 0),
      },
      users: {
        newToday: newUsersToday,
        newWeek: newUsersWeek,
        activeToday: activeUsersToday,
        total: totalUsers,
        active: activeUsers,
      },
      communities: {
        active: activeCommunities,
        new: newCommunities,
      },
      orders: {
        today: ordersToday,
        pending: pendingOrders,
      },
      pending: {
        products: pendingProducts,
        approvals: 0, // TODO: 实现入驻审核后添加
        complaints: 0, // TODO: 实现投诉系统后添加
      },
    });
  } catch (error) {
    console.error('获取仪表盘统计失败:', error);
    return createErrorResponse(res, '获取统计信息失败', 500);
  }
}

/**
 * 获取趋势数据
 */
export async function getDashboardTrends(req: Request, res: Response) {
  try {
    const { period = '7d' } = req.query;
    
    let days = 7;
    if (period === '30d') days = 30;
    if (period === '90d') days = 90;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // GMV 趋势
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        status: { in: ['paid', 'confirmed', 'completed'] },
      },
      select: {
        amount: true,
        createdAt: true,
      },
    });

    // 按日期分组
    const gmvByDate: Record<string, number> = {};
    orders.forEach((order) => {
      const date = order.createdAt.toISOString().split('T')[0];
      gmvByDate[date] = (gmvByDate[date] || 0) + Number(order.amount);
    });

    // 用户增长趋势
    const users = await prisma.user.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true },
    });

    const usersByDate: Record<string, number> = {};
    users.forEach((user) => {
      const date = user.createdAt.toISOString().split('T')[0];
      usersByDate[date] = (usersByDate[date] || 0) + 1;
    });

    return createSuccessResponse(res, {
      gmv: Object.entries(gmvByDate).map(([date, value]) => ({ date, value })),
      users: Object.entries(usersByDate).map(([date, value]) => ({ date, value })),
    });
  } catch (error) {
    console.error('获取趋势数据失败:', error);
    return createErrorResponse(res, '获取趋势数据失败', 500);
  }
}

/**
 * 获取待处理事项
 */
export async function getPendingItems(req: Request, res: Response) {
  try {
    // 待审核商品
    const pendingProducts = await prisma.product.findMany({
      where: { status: 'pending' },
      take: 10,
      orderBy: { createdAt: 'asc' },
      include: {
        owner: {
          select: { id: true, nickname: true, phone: true },
        },
      },
    });

    return createSuccessResponse(res, {
      products: pendingProducts,
      approvals: [], // TODO: 实现入驻审核后添加
      complaints: [], // TODO: 实现投诉系统后添加
    });
  } catch (error) {
    console.error('获取待处理事项失败:', error);
    return createErrorResponse(res, '获取待处理事项失败', 500);
  }
}

