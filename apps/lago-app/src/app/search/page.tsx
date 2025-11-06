'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { ProductCard } from '@/components/ProductCard';
import { Loading } from '@/components/Loading';
import { EmptyState } from '@/components/EmptyState';
import { BottomNavigation } from '@/components/BottomNavigation';
import { useProducts } from '@/lib/apis/products';
import { Filter, SortAsc, SortDesc } from 'lucide-react';

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState<'toys' | 'gaming' | ''>('');
  const [type, setType] = useState<'rent' | 'sell' | 'both' | ''>('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'price' | 'viewCount' | 'likeCount'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, error } = useProducts({
    search: searchQuery || undefined,
    category: category || undefined,
    type: type || undefined,
    sortBy,
    sortOrder,
    page: '1',
    limit: '20',
  });

  const products = data?.data?.products || [];
  const pagination = data?.data?.pagination;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // 搜索逻辑已在 useProducts 中处理
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="搜索商品" showBack showSearch={false} />

      <main className="max-w-7xl mx-auto px-4 py-4">
        {/* 搜索栏 */}
        <form onSubmit={handleSearch} className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索商品..."
              className="flex-1 px-4 py-2 bg-container rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-5 h-5 text-text-primary" />
            </button>
          </div>
        </form>

        {/* 筛选面板 */}
        {showFilters && (
          <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
            {/* 分类筛选 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-text-primary mb-2">分类</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setCategory('')}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    category === '' ? 'bg-primary text-white' : 'bg-gray-100 text-text-primary'
                  }`}
                >
                  全部
                </button>
                <button
                  onClick={() => setCategory('toys')}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    category === 'toys' ? 'bg-primary text-white' : 'bg-gray-100 text-text-primary'
                  }`}
                >
                  玩具
                </button>
                <button
                  onClick={() => setCategory('gaming')}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    category === 'gaming' ? 'bg-primary text-white' : 'bg-gray-100 text-text-primary'
                  }`}
                >
                  游戏机
                </button>
              </div>
            </div>

            {/* 交易类型筛选 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-text-primary mb-2">交易类型</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setType('')}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    type === '' ? 'bg-primary text-white' : 'bg-gray-100 text-text-primary'
                  }`}
                >
                  全部
                </button>
                <button
                  onClick={() => setType('rent')}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    type === 'rent' ? 'bg-primary text-white' : 'bg-gray-100 text-text-primary'
                  }`}
                >
                  租赁
                </button>
                <button
                  onClick={() => setType('sell')}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    type === 'sell' ? 'bg-primary text-white' : 'bg-gray-100 text-text-primary'
                  }`}
                >
                  出售
                </button>
                <button
                  onClick={() => setType('both')}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    type === 'both' ? 'bg-primary text-white' : 'bg-gray-100 text-text-primary'
                  }`}
                >
                  租售
                </button>
              </div>
            </div>

            {/* 排序 */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">排序</label>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSortBy('createdAt');
                    setSortOrder('desc');
                  }}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-1 ${
                    sortBy === 'createdAt' ? 'bg-primary text-white' : 'bg-gray-100 text-text-primary'
                  }`}
                >
                  最新上架
                </button>
                <button
                  onClick={() => {
                    setSortBy('price');
                    setSortOrder('asc');
                  }}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-1 ${
                    sortBy === 'price' && sortOrder === 'asc' ? 'bg-primary text-white' : 'bg-gray-100 text-text-primary'
                  }`}
                >
                  价格最低
                </button>
                <button
                  onClick={() => {
                    setSortBy('viewCount');
                    setSortOrder('desc');
                  }}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-1 ${
                    sortBy === 'viewCount' ? 'bg-primary text-white' : 'bg-gray-100 text-text-primary'
                  }`}
                >
                  最受欢迎
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 商品列表 */}
        {isLoading ? (
          <Loading text="加载中..." />
        ) : error ? (
          <EmptyState
            icon="search"
            title="加载失败"
            description="请稍后重试"
          />
        ) : products.length === 0 ? (
          <EmptyState
            icon="search"
            title="暂无商品"
            description={searchQuery ? `没有找到"${searchQuery}"相关的商品` : '没有找到符合条件的商品'}
            action={{
              label: '发布商品',
              onClick: () => router.push('/publish'),
            }}
          />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {products.map((product: any) => (
                <ProductCard
                  key={product.id}
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
              ))}
            </div>

            {/* 分页 */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <button
                  disabled={pagination.page === 1}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50"
                >
                  上一页
                </button>
                <span className="px-4 py-2 text-sm text-text-secondary">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50"
                >
                  下一页
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
}

