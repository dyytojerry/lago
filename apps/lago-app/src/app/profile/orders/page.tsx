'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { EmptyState } from '@/components/EmptyState';
import { BottomNavigation } from '@/components/BottomNavigation';
import { useOrders } from '@/lib/apis/orders';
import { Package, Clock, CheckCircle } from 'lucide-react';

const statusTabs = [
  { value: '', label: '全部' },
  { value: 'pending', label: '待支付' },
  { value: 'paid', label: '已支付' },
  { value: 'confirmed', label: '已确认' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' },
];

export default function MyOrdersPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('');
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');

  const { data, isLoading, error } = useOrders({
    status: activeTab || undefined,
    role,
    page: '1',
    limit: '20',
  });

  const orders = data?.data?.orders || [];

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="我的订单" showBack />

      <main className="max-w-7xl mx-auto">
        {/* 角色切换 */}
        <div className="px-4 py-3 bg-white border-b border-gray-200">
          <div className="flex gap-2">
            <button
              onClick={() => setRole('buyer')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm transition-colors ${
                role === 'buyer'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-text-primary'
              }`}
            >
              我买的
            </button>
            <button
              onClick={() => setRole('seller')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm transition-colors ${
                role === 'seller'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-text-primary'
              }`}
            >
              我卖的
            </button>
          </div>
        </div>

        {/* 状态筛选 */}
        <div className="px-4 py-3 bg-white border-b border-gray-200 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {statusTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.value
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-text-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 订单列表 */}
        {isLoading ? (
          <Loading text="加载中..." />
        ) : error ? (
          <EmptyState
            icon="shopping"
            title="加载失败"
            description="请稍后重试"
          />
        ) : orders.length === 0 ? (
          <EmptyState
            icon="shopping"
            title="暂无订单"
            description={role === 'buyer' ? '还没有购买记录' : '还没有卖出记录'}
          />
        ) : (
          <div className="px-4 py-4 space-y-3">
            {orders.map((order: any) => (
              <div
                key={order.id}
                onClick={() => router.push(`/orders/${order.id}`)}
                className="bg-white rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3 mb-3">
                  {order.product?.images?.[0] && (
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img
                        src={order.product.images[0]}
                        alt={order.product.title || '商品'}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-text-primary line-clamp-2 mb-1">
                      {order.product?.title || '商品'}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-accent">¥{order.amount}</span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          order.status === 'completed'
                            ? 'bg-green-100 text-green-600'
                            : order.status === 'cancelled'
                            ? 'bg-gray-100 text-gray-600'
                            : 'bg-orange-100 text-orange-600'
                        }`}
                      >
                        {order.status === 'pending'
                          ? '待支付'
                          : order.status === 'paid'
                          ? '已支付'
                          : order.status === 'confirmed'
                          ? '已确认'
                          : order.status === 'completed'
                          ? '已完成'
                          : order.status === 'cancelled'
                          ? '已取消'
                          : order.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-text-secondary pt-3 border-t border-gray-100">
                  <span>订单号: {order.id.slice(0, 8)}...</span>
                  <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
}

