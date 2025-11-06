'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BottomNavigation } from '@/components/BottomNavigation';
import { ProductCard } from '@/components/ProductCard';
import { apiRequest, HTTPResponse } from '@lago/common';
import {useAuth} from '@lago/ui';

interface Product {
  id: string;
  title: string;
  price: number;
  deposit?: number;
  images: string[];
  location?: string;
  community?: {
    id: string;
    name: string;
    location?: string;
  };
  owner?: {
    id: string;
    nickname?: string;
    avatarUrl?: string;
    creditScore: number;
    isVerified: boolean;
  };
  viewCount: number;
  likeCount: number;
  type: 'rent' | 'sell' | 'both';
  isVerified: boolean;
}

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [hotProducts, setHotProducts] = useState<Product[]>([]);
  useEffect(() => {
    async function loadData() {
      try {
        // 获取推荐商品
        const recommendedResponse = await apiRequest<{ products: Product[] }>('/api/products/recommended', {
          method: 'GET',
        });
        if (recommendedResponse.success && recommendedResponse.data) {
          setRecommendedProducts(recommendedResponse.data.products || []);
        }

        // 获取热门商品
        const hotResponse = await apiRequest<{ products: Product[] }>('/api/products/hot', {
          method: 'GET',
        });
        if (hotResponse.success && hotResponse.data) {
          setHotProducts(hotResponse.data.products || []);
        }
      } catch (error) {
        console.error('加载商品失败:', error);
      }
    }
    loadData();
  }, [router, isLoading]);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* 头部 */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-primary">来购</h1>
            <div className="flex items-center gap-2">
              {user?.communityIds && user.communityIds.length > 0 && (
                <span className="text-sm text-text-secondary">附近小区</span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-4">
        {/* 搜索栏 */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="搜索商品..."
            className="w-full px-4 py-2 bg-container rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
            onClick={() => router.push('/search')}
          />
        </div>

        {/* AI推荐商品 */}
        {recommendedProducts.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-primary-50 px-3 py-1 rounded-full">
                <span className="text-sm text-primary font-medium">AI 推荐</span>
              </div>
              <h2 className="text-lg font-semibold text-text-primary">为你推荐</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {recommendedProducts.map((product) => (
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
          </section>
        )}

        {/* 热门榜单 */}
        {hotProducts.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-text-primary mb-4">热门商品</h2>
            <div className="grid grid-cols-2 gap-3">
              {hotProducts.map((product) => (
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
          </section>
        )}

        {/* 空状态 */}
        {recommendedProducts.length === 0 && hotProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-text-secondary mb-4">暂无商品，快来发布第一个吧！</p>
            <button
              onClick={() => router.push('/publish')}
              className="px-6 py-2 bg-accent text-white rounded-lg font-medium"
            >
              发布商品
            </button>
          </div>
        )}
      </main>

      {/* 底部导航 */}
      <BottomNavigation />
    </div>
  );
}
