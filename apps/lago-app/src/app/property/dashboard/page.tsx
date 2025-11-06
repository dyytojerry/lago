'use client';

import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { EmptyState } from '@/components/EmptyState';
import { Package, Users, DollarSign, TrendingUp, Video, Settings } from 'lucide-react';

export default function PropertyDashboardPage() {
  const router = useRouter();

  // TODO: 实现物业数据统计API
  const stats = {
    activeCommunities: 0,
    totalUsers: 0,
    totalRevenue: 0,
    activeCabinets: 0,
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="物业管理" showBack />

      <main className="max-w-7xl mx-auto px-4 py-4">
        {/* 数据概览 */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-5 h-5 text-primary" />
              <span className="text-2xl font-bold text-text-primary">
                {stats.activeCommunities}
              </span>
            </div>
            <p className="text-sm text-text-secondary">活跃小区</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-green-500" />
              <span className="text-2xl font-bold text-text-primary">{stats.totalUsers}</span>
            </div>
            <p className="text-sm text-text-secondary">总用户数</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-accent" />
              <span className="text-2xl font-bold text-text-primary">¥{stats.totalRevenue}</span>
            </div>
            <p className="text-sm text-text-secondary">总收益</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              <span className="text-2xl font-bold text-text-primary">{stats.activeCabinets}</span>
            </div>
            <p className="text-sm text-text-secondary">活跃智能柜</p>
          </div>
        </div>

        {/* 快捷操作 */}
        <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
          <h2 className="text-base font-semibold text-text-primary mb-3">快捷操作</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => router.push('/property/cabinets')}
              className="px-4 py-3 bg-primary/10 text-primary rounded-lg font-medium hover:bg-primary/20 transition-colors"
            >
              循环柜管理
            </button>
            <button
              onClick={() => router.push('/property/live')}
              className="px-4 py-3 bg-primary/10 text-primary rounded-lg font-medium hover:bg-primary/20 transition-colors"
            >
              活动直播
            </button>
          </div>
        </div>

        {/* 最近活动 */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h2 className="text-base font-semibold text-text-primary mb-3">最近活动</h2>
          <EmptyState
            icon="package"
            title="暂无活动"
            description="还没有活动记录"
          />
        </div>
      </main>
    </div>
  );
}

