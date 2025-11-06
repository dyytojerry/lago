"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@lago/ui";
import { adminDashboardStats, adminDashboardTrends } from "@/lib/apis";

interface DashboardStats {
  gmv: {
    today: number;
    week: number;
    month: number;
    total: number;
  };
  users: {
    newToday: number;
    newWeek: number;
    activeToday: number;
    total: number;
    active: number;
  };
  communities: {
    active: number;
    new: number;
  };
  orders: {
    today: number;
    pending: number;
  };
  pending: {
    products: number;
    approvals: number;
    complaints: number;
  };
}

interface TrendData {
  gmv: Array<{ date: string; value: number }>;
  users: Array<{ date: string; value: number }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trends, setTrends] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn } = useAuth();
  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    loadData();
  }, [router]);

  const loadData = async () => {
    try {
      const [statsRes, trendsRes] = await Promise.all([
        adminDashboardStats(),
        adminDashboardTrends({ period: "7d" }),
      ]);

      setStats(statsRes.data);
      setTrends(trendsRes.data);
    } catch (error) {
      console.error("加载数据失败:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("zh-CN", {
      style: "currency",
      currency: "CNY",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">仪表盘</h1>

      {/* 核心指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* GMV */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">全站 GMV</h3>
            <span className="text-2xl">💰</span>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900">
              {stats ? formatCurrency(stats.gmv.total) : "--"}
            </p>
            <p className="text-sm text-gray-500">
              今日: {stats ? formatCurrency(stats.gmv.today) : "--"}
            </p>
          </div>
        </div>

        {/* 用户增长 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">用户增长</h3>
            <span className="text-2xl">👥</span>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900">
              {stats ? stats.users.total.toLocaleString() : "--"}
            </p>
            <p className="text-sm text-gray-500">
              今日新增: {stats ? stats.users.newToday : "--"}
            </p>
          </div>
        </div>

        {/* 订单统计 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">订单统计</h3>
            <span className="text-2xl">🛒</span>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900">
              {stats ? stats.orders.today : "--"}
            </p>
            <p className="text-sm text-gray-500">
              待处理: {stats ? stats.orders.pending : "--"}
            </p>
          </div>
        </div>

        {/* 待审核事项 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">待审核</h3>
            <span className="text-2xl">⏳</span>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900">
              {stats ? stats.pending.products : "--"}
            </p>
            <p className="text-sm text-gray-500">待审核商品</p>
          </div>
        </div>
      </div>

      {/* 数据趋势 */}
      {trends && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">GMV 趋势（最近7天）</h3>
            <div className="space-y-2">
              {trends.gmv.map((item) => (
                <div
                  key={item.date}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm text-gray-600">{item.date}</span>
                  <span className="font-medium">
                    {formatCurrency(item.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">
              用户增长趋势（最近7天）
            </h3>
            <div className="space-y-2">
              {trends.users.map((item) => (
                <div
                  key={item.date}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm text-gray-600">{item.date}</span>
                  <span className="font-medium">{item.value} 人</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 详细统计 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">用户统计</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">总用户数</span>
                <span className="font-medium">
                  {stats.users.total.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">活跃用户</span>
                <span className="font-medium">
                  {stats.users.active.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">今日活跃</span>
                <span className="font-medium">{stats.users.activeToday}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">本周新增</span>
                <span className="font-medium">{stats.users.newWeek}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">GMV 统计</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">今日 GMV</span>
                <span className="font-medium">
                  {formatCurrency(stats.gmv.today)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">本周 GMV</span>
                <span className="font-medium">
                  {formatCurrency(stats.gmv.week)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">本月 GMV</span>
                <span className="font-medium">
                  {formatCurrency(stats.gmv.month)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">累计 GMV</span>
                <span className="font-medium">
                  {formatCurrency(stats.gmv.total)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">小区统计</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">活跃小区</span>
                <span className="font-medium">{stats.communities.active}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">本月新增</span>
                <span className="font-medium">{stats.communities.new}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
