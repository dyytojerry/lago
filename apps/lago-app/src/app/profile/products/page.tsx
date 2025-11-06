'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { EmptyState } from '@/components/EmptyState';
import { BottomNavigation } from '@/components/BottomNavigation';
import { ProductCard } from '@/components/ProductCard';
import { useUserProducts } from '@/lib/apis/users';
import { Package, Plus } from 'lucide-react';

const statusTabs = [
  { value: '', label: '全部' },
  { value: 'pending', label: '待审核' },
  { value: 'active', label: '在售' },
  { value: 'sold', label: '已售出' },
  { value: 'rented', label: '已租出' },
  { value: 'offline', label: '已下架' },
];

export default function MyProductsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('');

  const { data, isLoading, error } = useUserProducts({
    status: activeTab || undefined,
    page: '1',
    limit: '20',
  });

  const products = data?.data?.products || [];

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header
        title="我的发布"
        showBack
        rightContent={
          <button
            onClick={() => router.push('/publish')}
            className="p-2 text-primary hover:bg-gray-100 rounded-full transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        }
      />

      <main className="max-w-7xl mx-auto">
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

        {/* 商品列表 */}
        {isLoading ? (
          <Loading text="加载中..." />
        ) : error ? (
          <EmptyState
            icon="package"
            title="加载失败"
            description="请稍后重试"
          />
        ) : products.length === 0 ? (
          <EmptyState
            icon="package"
            title="暂无商品"
            description="还没有发布任何商品"
            action={{
              label: '发布商品',
              onClick: () => router.push('/publish'),
            }}
          />
        ) : (
          <div className="px-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              {products.map((product: any) => (
                <div key={product.id} className="relative">
                  <ProductCard
                    id={product.id}
                    title={product.title}
                    price={product.price}
                    images={product.images}
                    location={product.location}
                    communityName={product.community?.name}
                    viewCount={product.viewCount}
                    likeCount={product.likeCount}
                    type={product.type}
                    isVerified={product.isVerified}
                  />
                  <div className="absolute top-2 right-2">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        product.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-600'
                          : product.status === 'active'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {product.status === 'pending'
                        ? '待审核'
                        : product.status === 'active'
                        ? '在售'
                        : product.status === 'sold'
                        ? '已售'
                        : product.status === 'rented'
                        ? '已租'
                        : '已下架'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
}

