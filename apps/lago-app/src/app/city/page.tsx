'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { BottomNavigation } from '@/components/BottomNavigation';
import { ProductCard } from '@/components/ProductCard';
import { Loading } from '@/components/Loading';
import { EmptyState } from '@/components/EmptyState';
import { useGeolocation } from '@/hooks/useGeolocation';
import { communitieNearby, productsPublic, ProductPublicQueryParams } from '@/lib/apis';
import {
  Search,
  MapPin,
  SlidersHorizontal,
  ShoppingBag,
  Sparkles,
  Store,
  Calendar,
} from 'lucide-react';

interface Product {
  id: string;
  title: string;
  price: number;
  images: string[];
  location?: string;
  community?: {
    id: string;
    name: string;
  };
  viewCount: number;
  likeCount: number;
  type: 'rent' | 'sell' | 'both';
  isVerified: boolean;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const SERVICE_NAV = [
  {
    id: 'publish',
    title: '发布闲置',
    description: '快速上架同城好物',
    icon: ShoppingBag,
    action: (router: ReturnType<typeof useRouter>) => router.push('/publish'),
  },
  {
    id: 'flea',
    title: '跳蚤市场',
    description: '逛本地地摊集市',
    icon: Sparkles,
    action: (router: ReturnType<typeof useRouter>) => router.push('/flea-market'),
  },
  {
    id: 'activities',
    title: '社区活动',
    description: '发现附近好玩事',
    icon: Calendar,
    action: (router: ReturnType<typeof useRouter>) => router.push('/communities/search'),
  },
  {
    id: 'services',
    title: '物业服务',
    description: '便民服务到家',
    icon: Store,
    action: (router: ReturnType<typeof useRouter>) => router.push('/property/dashboard'),
  },
];

const CATEGORY_FILTERS = [
  { id: 'all', label: '全部', value: '' },
  { id: 'toys', label: '玩具', value: 'toys' },
  { id: 'gaming', label: '电玩', value: 'gaming' },
] as const;

const SORT_FILTERS = [
  { id: 'createdAt', label: '最新发布', sortBy: 'createdAt', sortOrder: 'desc' },
  { id: 'priceLow', label: '价格从低到高', sortBy: 'price', sortOrder: 'asc' },
  { id: 'priceHigh', label: '价格从高到低', sortBy: 'price', sortOrder: 'desc' },
  { id: 'popular', label: '人气优先', sortBy: 'viewCount', sortOrder: 'desc' },
] as const;

export default function CityPage() {
  const router = useRouter();
  const { latitude, longitude } = useGeolocation();

  const [cityName, setCityName] = useState('同城');
  const [cityId, setCityId] = useState<string | undefined>();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'price' | 'viewCount' | 'likeCount'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 12, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const resolveCityFromStorage = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = window.localStorage.getItem('selectedLocation');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.city?.id) {
          setCityId(parsed.city.id);
        }
        if (parsed?.city?.name) {
          setCityName(parsed.city.name.replace(/市$/u, ''));
        } else if (parsed?.province?.name) {
          setCityName(parsed.province.name.replace(/省$/u, ''));
        }
      }
    } catch (error) {
      console.warn('Failed to parse saved location:', error);
    }
  }, []);

  useEffect(() => {
    resolveCityFromStorage();
  }, [resolveCityFromStorage]);

  useEffect(() => {
    async function fetchNearbyCommunity() {
      if (cityId || !latitude || !longitude) return;
      try {
        const resp = await communitieNearby({ latitude, longitude, radius: 5000 }, true);
        const communities = resp.data?.communities || [];
        const first = communities[0];
        if (first?.city?.id) {
          setCityId(first.city.id);
          setCityName(first.city.name?.replace(/市$/u, '') || cityName);
        }
      } catch (error) {
        console.warn('Failed to resolve city from geolocation:', error);
      }
    }

    fetchNearbyCommunity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latitude, longitude, cityId]);

  const loadProducts = useCallback(
    async (page: number, append = false) => {
      if (loading) return;
      setLoading(true);
      try {
        const queryParams: ProductPublicQueryParams = {
          page: String(page),
          limit: String(pagination.limit),
          sortBy,
          sortOrder,
        };

        if (cityId) {
          queryParams.cityId = cityId;
        }
        if (category) {
          queryParams.category = category as ProductPublicQueryParams['category'];
        }
        if (searchKeyword.trim()) {
          queryParams.search = searchKeyword.trim();
        }

        const response = await productsPublic(queryParams, true);

        if (response.success && response.data) {
          setPagination(response.data.pagination);
          setHasMore(response.data.pagination.page < response.data.pagination.totalPages);
          setProducts((prev) => (append ? [...prev, ...response.data!.products] : response.data!.products));
        } else if (!append) {
          setProducts([]);
          setHasMore(false);
        }
      } catch (error) {
        console.error('加载同城商品失败:', error);
        if (!append) {
          setProducts([]);
          setHasMore(false);
        }
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    },
    [category, cityId, pagination.limit, searchKeyword, sortBy, sortOrder]
  );

  useEffect(() => {
    setInitialLoading(true);
    loadProducts(1, false);
  }, [category, sortBy, sortOrder, cityId, searchKeyword, loadProducts]);

  useEffect(() => {
    if (!loadMoreRef.current) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry.isIntersecting && hasMore && !loading) {
        loadProducts(pagination.page + 1, true);
      }
    });

    observerRef.current.observe(loadMoreRef.current);

    return () => observerRef.current?.disconnect();
  }, [hasMore, loading, loadProducts, pagination.page]);

  const activeSortId = useMemo(() => {
    const match = SORT_FILTERS.find((filter) => filter.sortBy === sortBy && filter.sortOrder === sortOrder);
    return match?.id || 'createdAt';
  }, [sortBy, sortOrder]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    loadProducts(1, false);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <main className="max-w-6xl mx-auto px-4 py-4 space-y-6">
        <header className="space-y-3">
          <form onSubmit={handleSubmit} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder={`搜索${cityName}闲置好物`}
              className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl shadow-sm border border-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </form>
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <MapPin className="w-4 h-4" />
            <span>{cityName} · 同城闲置</span>
          </div>
        </header>

        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SERVICE_NAV.map((service) => {
            const Icon = service.icon;
            return (
              <button
                key={service.id}
                type="button"
                onClick={() => service.action(router)}
                className="flex flex-col items-start gap-2 bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <span className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Icon className="w-5 h-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-text-primary">{service.title}</p>
                  <p className="text-xs text-text-secondary">{service.description}</p>
                </div>
              </button>
            );
          })}
        </section>

        <section className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-x-auto">
              {CATEGORY_FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setCategory(filter.value)}
                  className={`px-4 py-1.5 rounded-full text-sm transition-colors whitespace-nowrap ${
                    category === filter.value
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-text-secondary'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            <SlidersHorizontal className="w-5 h-5 text-text-tertiary" />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {SORT_FILTERS.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => {
                  setSortBy(filter.sortBy);
                  setSortOrder(filter.sortOrder);
                }}
                className={`px-3 py-1 rounded-lg text-xs transition-colors whitespace-nowrap ${
                  activeSortId === filter.id
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'bg-gray-100 text-text-secondary'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </section>

        {initialLoading ? (
          <div className="bg-white rounded-2xl p-6 flex items-center justify-center shadow-sm">
            <Loading text="加载同城商品..." />
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon="package"
            title="暂无同城闲置"
            description={`当前${cityName}还没有闲置商品，去发布第一件吧！`}
            action={{
              label: '发布闲置',
              onClick: () => router.push('/publish'),
            }}
          />
        ) : (
          <section className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {products.map((product) => (
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
          </section>
        )}

        <div ref={loadMoreRef} className="h-10" />

        {loading && products.length > 0 && (
          <div className="py-4 text-center text-sm text-text-secondary">加载更多同城好物...</div>
        )}

        {!hasMore && products.length > 0 && (
          <div className="py-4 text-center text-xs text-text-tertiary">已经到底啦，敬请期待更多同城好物</div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
}
