'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { EmptyState } from '@/components/EmptyState';
import { ProductCard } from '@/components/ProductCard';
import { useUserProducts } from '@/lib/apis/users';
import { Plus, Edit, Trash2, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MerchantProductsPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading, error } = useUserProducts({
    status: statusFilter || undefined,
    page: '1',
    limit: '20',
  });

  const products = data?.data?.products || [];

  const handleEdit = (productId: string) => {
    router.push(`/products/${productId}/edit`);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('确定要删除这个商品吗？')) return;
    // TODO: 实现删除API
    toast.success('商品已删除');
  };

  const handleOffline = async (productId: string) => {
    // TODO: 实现下架API
    toast.success('商品已下架');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header
        title="商品管理"
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
            {[
              { value: '', label: '全部' },
              { value: 'pending', label: '待审核' },
              { value: 'active', label: '在售' },
              { value: 'offline', label: '已下架' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                  statusFilter === tab.value
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
          <div className="px-4 py-4 space-y-3">
            {products.map((product: any) => (
              <div
                key={product.id}
                className="bg-white rounded-lg p-4 shadow-sm"
              >
                <div className="flex gap-3 mb-3">
                  {product.images?.[0] && (
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image
                        src={product.images[0]}
                        alt={product.title}
                        width={80}
                        height={80}
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-medium text-text-primary line-clamp-2 mb-1">
                      {product.title}
                    </h3>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-bold text-accent">¥{product.price}</span>
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
                          : '已下架'}
                      </span>
                    </div>
                    <div className="text-xs text-text-secondary">
                      浏览 {product.viewCount || 0} · 收藏 {product.likeCount || 0}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => router.push(`/products/${product.id}`)}
                    className="flex-1 px-3 py-2 bg-gray-100 text-text-primary rounded-lg text-sm hover:bg-gray-200 transition-colors"
                  >
                    查看
                  </button>
                  {product.status === 'active' && (
                    <>
                      <button
                        onClick={() => handleEdit(product.id)}
                        className="flex-1 px-3 py-2 bg-primary/10 text-primary rounded-lg text-sm hover:bg-primary/20 transition-colors"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleOffline(product.id)}
                        className="flex-1 px-3 py-2 bg-gray-100 text-text-secondary rounded-lg text-sm hover:bg-gray-200 transition-colors"
                      >
                        下架
                      </button>
                    </>
                  )}
                  {product.status === 'pending' && (
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="flex-1 px-3 py-2 bg-red-50 text-red-500 rounded-lg text-sm hover:bg-red-100 transition-colors"
                    >
                      删除
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

