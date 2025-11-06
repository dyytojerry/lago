'use client';

import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { EmptyState } from '@/components/EmptyState';
import { Package, ShoppingBag, DollarSign, TrendingUp } from 'lucide-react';

export default function MerchantDashboardPage() {
  const router = useRouter();

  // TODO: 实现商家数据统计API
  const stats = {
    totalProducts: 0,
    activeProducts: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="商家中心" showBack />

      <main className="max-w-7xl mx-auto px-4 py-4">
        {/* 数据概览 */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-5 h-5 text-primary" />
              <span className="text-2xl font-bold text-text-primary">{stats.totalProducts}</span>
            </div>
            <p className="text-sm text-text-secondary">总商品数</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="text-2xl font-bold text-text-primary">{stats.activeProducts}</span>
            </div>
            <p className="text-sm text-text-secondary">在售商品</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <ShoppingBag className="w-5 h-5 text-orange-500" />
              <span className="text-2xl font-bold text-text-primary">{stats.pendingOrders}</span>
            </div>
            <p className="text-sm text-text-secondary">待处理订单</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-accent" />
              <span className="text-2xl font-bold text-text-primary">¥{stats.totalRevenue}</span>
            </div>
            <p className="text-sm text-text-secondary">总收益</p>
          </div>
        </div>

        {/* 快捷操作 */}
        <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
          <h2 className="text-base font-semibold text-text-primary mb-3">快捷操作</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => router.push('/merchant/products')}
              className="px-4 py-3 bg-primary/10 text-primary rounded-lg font-medium hover:bg-primary/20 transition-colors"
            >
              商品管理
            </button>
            <button
              onClick={() => router.push('/merchant/orders')}
              className="px-4 py-3 bg-primary/10 text-primary rounded-lg font-medium hover:bg-primary/20 transition-colors"
            >
              订单中心
            </button>
            <button
              onClick={() => router.push('/merchant/finance')}
              className="px-4 py-3 bg-primary/10 text-primary rounded-lg font-medium hover:bg-primary/20 transition-colors"
            >
              财务结算
            </button>
            <button
              onClick={() => router.push('/publish')}
              className="px-4 py-3 bg-primary/10 text-primary rounded-lg font-medium hover:bg-primary/20 transition-colors"
            >
              发布商品
            </button>
          </div>
        </div>

        {/* 待处理事项 */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h2 className="text-base font-semibold text-text-primary mb-3">待处理事项</h2>
          <EmptyState
            icon="package"
            title="暂无待处理事项"
            description="所有订单都已处理完成"
          />
        </div>
      </main>
    </div>
  );
}

