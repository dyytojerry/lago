'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { BottomNavigation } from '@/components/BottomNavigation';
import { ProductCard } from '@/components/ProductCard';
import { LocationSelector } from '@/components/LocationSelector';
import { Loading } from '@/components/Loading';
import { EmptyState } from '@/components/EmptyState';
import { apiRequest, HTTPResponse } from '@lago/common';
import { useAuth } from '@lago/ui';
import { useGeolocation } from '@/lib/hooks/useGeolocation';
import { MapPin, Users, Search, ArrowRight } from 'lucide-react';

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

interface Community {
  id: string;
  name: string;
  address?: string;
  images: string[];
  province?: { name: string };
  city?: { name: string };
  district?: { name: string };
  _count?: {
    members: number;
    products: number;
  };
  distance?: number;
}

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { latitude, longitude, loading: geoLoading } = useGeolocation();
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [hotProducts, setHotProducts] = useState<Product[]>([]);
  const [myCommunities, setMyCommunities] = useState<Community[]>([]);
  const [nearbyCommunities, setNearbyCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (authLoading) return;

      setLoading(true);
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

        // 获取用户加入的小区
        if (user) {
          try {
            const myCommunitiesResponse = await apiRequest<{ communities: Community[] }>(
              '/api/communities/my',
              {
                method: 'GET',
              }
            );
            if (myCommunitiesResponse.success && myCommunitiesResponse.data) {
              setMyCommunities(myCommunitiesResponse.data.communities || []);
            }
          } catch (error) {
            console.error('获取我的小区失败:', error);
          }
        }

        // 获取周边小区（需要GPS定位）
        if (latitude && longitude) {
          try {
            const nearbyResponse = await apiRequest<{ communities: Community[] }>(
              '/api/communities/nearby',
              {
                method: 'GET',
                params: {
                  latitude,
                  longitude,
                  radius: 1000, // 1公里
                },
              }
            );
            if (nearbyResponse.success && nearbyResponse.data) {
              setNearbyCommunities(nearbyResponse.data.communities || []);
            }
          } catch (error) {
            console.error('获取周边小区失败:', error);
          }
        }
      } catch (error) {
        console.error('加载数据失败:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router, authLoading, user, latitude, longitude]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="bg-white shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-primary">来购</h1>
              <LocationSelector />
            </div>
          </div>
        </header>
        <Loading text="加载中..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* 头部 */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-primary">来购</h1>
            <LocationSelector />
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

        {/* 我加入的小区 */}
        {myCommunities.length > 0 && (
          <section className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-text-primary">我的小区</h2>
              <button
                onClick={() => router.push('/communities/search')}
                className="text-sm text-primary flex items-center gap-1"
              >
                查看全部
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {myCommunities.map((community) => (
                <div
                  key={community.id}
                  onClick={() => router.push(`/communities/${community.id}`)}
                  className="flex-shrink-0 w-32 bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                >
                  {community.images?.[0] ? (
                    <div className="relative w-32 h-24 bg-gray-100">
                      <Image
                        src={community.images[0]}
                        alt={community.name}
                        fill
                        className="object-cover"
                        sizes="128px"
                      />
                    </div>
                  ) : (
                    <div className="w-32 h-24 bg-gray-100 flex items-center justify-center">
                      <MapPin className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div className="p-2">
                    <h3 className="text-xs font-medium text-text-primary line-clamp-1 mb-1">
                      {community.name}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-text-secondary">
                      <Users className="w-3 h-3" />
                      <span>{community._count?.members || 0}人</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 周边小区 */}
        {nearbyCommunities.length > 0 && (
          <section className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-text-primary">周边小区</h2>
              <button
                onClick={() => router.push('/communities/search')}
                className="text-sm text-primary flex items-center gap-1"
              >
                查看全部
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {nearbyCommunities.slice(0, 5).map((community) => (
                <div
                  key={community.id}
                  onClick={() => router.push(`/communities/${community.id}`)}
                  className="bg-white rounded-lg p-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    {community.images?.[0] ? (
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image
                          src={community.images[0]}
                          alt={community.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-text-primary mb-1">
                        {community.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-text-secondary">
                        {community.distance && (
                          <span>距离 {community.distance}m</span>
                        )}
                        {community._count && (
                          <>
                            <span>·</span>
                            <span>{community._count.members}人</span>
                            <span>·</span>
                            <span>{community._count.products}件商品</span>
                          </>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-text-secondary flex-shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

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
