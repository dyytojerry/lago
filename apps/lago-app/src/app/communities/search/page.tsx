'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { EmptyState } from '@/components/EmptyState';
import { BottomNavigation } from '@/components/BottomNavigation';
import { LocationSelector } from '@/components/LocationSelector';
import { apiRequest } from '@lago/common';
import { MapPin, Users, Package, Filter, Search as SearchIcon } from 'lucide-react';

interface Community {
  id: string;
  name: string;
  address?: string;
  images: string[];
  province?: { id: string; name: string };
  city?: { id: string; name: string };
  district?: { id: string; name: string };
  verificationStatus: 'pending' | 'approved' | 'rejected';
  _count?: {
    members: number;
    products: number;
  };
}

export default function CommunitySearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [provinceId, setProvinceId] = useState<string>('');
  const [cityId, setCityId] = useState<string>('');
  const [districtId, setDistrictId] = useState<string>('');
  const [verificationStatus, setVerificationStatus] = useState<'approved' | ''>('approved');
  const [showFilters, setShowFilters] = useState(false);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const loadCommunities = async (page = 1) => {
    setLoading(true);
    try {
      const params: any = {
        page: String(page),
        limit: '20',
      };

      if (searchQuery) {
        params.search = searchQuery;
      }

      if (provinceId) {
        params.provinceId = provinceId;
      }

      if (cityId) {
        params.cityId = cityId;
      }

      if (districtId) {
        params.districtId = districtId;
      }

      if (verificationStatus) {
        params.verificationStatus = verificationStatus;
      }

      const response = await apiRequest<{
        communities: Community[];
        pagination: { page: number; limit: number; total: number; totalPages: number };
      }>('/api/communities/search', {
        method: 'GET',
        params,
      });

      if (response.success && response.data) {
        setCommunities(response.data.communities || []);
        setPagination(response.data.pagination || pagination);
      }
    } catch (error) {
      console.error('搜索小区失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommunities(1);
  }, [searchQuery, provinceId, cityId, districtId, verificationStatus]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadCommunities(1);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="搜索小区" showBack />

      <main className="max-w-7xl mx-auto px-4 py-4">
        {/* 搜索栏 */}
        <form onSubmit={handleSearch} className="mb-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索小区名称或地址..."
                className="w-full pl-10 pr-4 py-2 bg-container rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
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
            <div className="space-y-4">
              {/* 位置筛选 */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">位置</label>
                <LocationSelector
                  onLocationChange={(pId, cId, dId) => {
                    setProvinceId(pId);
                    setCityId(cId);
                    setDistrictId(dId);
                  }}
                />
              </div>

              {/* 认证状态筛选 */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">认证状态</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setVerificationStatus('')}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      verificationStatus === ''
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-text-primary'
                    }`}
                  >
                    全部
                  </button>
                  <button
                    type="button"
                    onClick={() => setVerificationStatus('approved')}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      verificationStatus === 'approved'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-text-primary'
                    }`}
                  >
                    已认证
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 小区列表 */}
        {loading ? (
          <Loading text="搜索中..." />
        ) : communities.length === 0 ? (
          <EmptyState
            icon="package"
            title="暂无小区"
            description={searchQuery ? `没有找到"${searchQuery}"相关的小区` : '没有找到符合条件的小区'}
          />
        ) : (
          <>
            <div className="space-y-3 mb-4">
              {communities.map((community) => (
                <div
                  key={community.id}
                  onClick={() => router.push(`/communities/${community.id}`)}
                  className="bg-white rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    {community.images?.[0] ? (
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image
                          src={community.images[0]}
                          alt={community.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold text-text-primary line-clamp-1">
                          {community.name}
                        </h3>
                        {community.verificationStatus === 'approved' && (
                          <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">
                            已认证
                          </span>
                        )}
                      </div>
                      {community.address && (
                        <p className="text-sm text-text-secondary line-clamp-1 mb-2">
                          {community.address}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-text-secondary">
                        {community.province && community.city && (
                          <span>
                            {community.province.name} {community.city.name}
                            {community.district && ` ${community.district.name}`}
                          </span>
                        )}
                        {community._count && (
                          <>
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span>{community._count.members}人</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Package className="w-3 h-3" />
                              <span>{community._count.products}件商品</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 分页 */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <button
                  disabled={pagination.page === 1}
                  onClick={() => loadCommunities(pagination.page - 1)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50"
                >
                  上一页
                </button>
                <span className="px-4 py-2 text-sm text-text-secondary">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => loadCommunities(pagination.page + 1)}
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

