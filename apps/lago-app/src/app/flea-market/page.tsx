'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Loading } from '@/components/Loading';
import { EmptyState } from '@/components/EmptyState';
import { apiRequest } from '@lago/common';
import { Calendar, MapPin, Play, Sparkles, Store } from 'lucide-react';

interface FleaActivity {
  id: string;
  title: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  status: string;
  images: string[];
  coverImage: string | null;
  isLive: boolean;
  isUpcoming: boolean;
  community: {
    id: string;
    name: string;
    coverImage: string | null;
    address?: string | null;
  } | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function FleaMarketPage() {
  const router = useRouter();
  const [activities, setActivities] = useState<FleaActivity[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const fetchActivities = useCallback(
    async (page: number, append = false) => {
      if (loading) return;
      setLoading(true);
      try {
        const response = await apiRequest<{ activities: FleaActivity[]; pagination: Pagination }>(
          '/api/public/communities/activities/feed',
          {
            method: 'GET',
            params: {
              page: String(page),
              limit: String(pagination.limit),
            },
          }
        );

        if (response.success && response.data) {
          setPagination(response.data.pagination);
          setHasMore(response.data.pagination.page < response.data.pagination.totalPages);
          setActivities((prev) => (append ? [...prev, ...response.data!.activities] : response.data!.activities));
        } else if (!append) {
          setActivities([]);
          setHasMore(false);
        }
      } catch (error) {
        console.error('加载跳蚤市场数据失败:', error);
        if (!append) {
          setActivities([]);
          setHasMore(false);
        }
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    },
    [loading, pagination.limit]
  );

  useEffect(() => {
    fetchActivities(1, false);
  }, [fetchActivities]);

  useEffect(() => {
    if (!loadMoreRef.current) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry.isIntersecting && hasMore && !loading) {
        fetchActivities(pagination.page + 1, true);
      }
    });

    observerRef.current.observe(loadMoreRef.current);

    return () => observerRef.current?.disconnect();
  }, [fetchActivities, hasMore, loading, pagination.page]);

  const handleCardClick = (activity: FleaActivity) => {
    if (activity.isLive) {
      router.push(`/property/live?activityId=${activity.id}`);
      return;
    }
    if (activity.community?.id) {
      router.push(`/communities/${activity.community.id}/activities/${activity.id}`);
    }
  };

  const headline = useMemo(() => {
    const liveCount = activities.filter((activity) => activity.isLive).length;
    if (liveCount > 0) {
      return `当前有 ${liveCount} 场地摊直播正在进行`; 
    }
    return '发现本地地摊集市，淘同城好物';
  }, [activities]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-background pb-24">
      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <header className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">跳蚤市场</h1>
              <p className="text-sm text-text-secondary mt-1">{headline}</p>
            </div>
            <button
              type="button"
              onClick={() => router.push('/publish')}
              className="px-3 py-2 text-sm rounded-full bg-primary text-white shadow-sm hover:bg-primary/90 transition-colors"
            >
              我要摆摊
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              type="button"
              onClick={() => router.push('/city')}
              className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <MapPin className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm font-semibold text-text-primary">同城闲置</p>
                <p className="text-xs text-text-secondary">逛逛附近好物</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => router.push('/property/live')}
              className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <Play className="w-8 h-8 text-red-500" />
              <div>
                <p className="text-sm font-semibold text-text-primary">直播专区</p>
                <p className="text-xs text-text-secondary">线上逛地摊</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => router.push('/communities/search')}
              className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <Sparkles className="w-8 h-8 text-amber-500" />
              <div>
                <p className="text-sm font-semibold text-text-primary">社区活动</p>
                <p className="text-xs text-text-secondary">玩转邻里福利</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => router.push('/property/dashboard')}
              className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <Store className="w-8 h-8 text-emerald-500" />
              <div>
                <p className="text-sm font-semibold text-text-primary">商家入驻</p>
                <p className="text-xs text-text-secondary">本地商家专区</p>
              </div>
            </button>
          </div>
        </header>

        {initialLoading ? (
          <div className="bg-white rounded-2xl p-6 shadow-sm flex items-center justify-center">
            <Loading text="加载跳蚤市场活动..." />
          </div>
        ) : activities.length === 0 ? (
          <EmptyState
            icon="package"
            title="暂无地摊活动"
            description="当前还没有地摊活动，去发起一场吧！"
            action={{
              label: '发起活动',
              onClick: () => router.push('/communities/search'),
            }}
          />
        ) : (
          <section className="space-y-4">
            {activities.map((activity) => (
              <article
                key={activity.id}
                onClick={() => handleCardClick(activity)}
                className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                {activity.coverImage && (
                  <div className="relative h-48">
                    <img
                      src={activity.coverImage}
                      alt={activity.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-x-0 top-0 p-3 flex justify-between">
                      <span className="px-3 py-1 text-xs text-white bg-black/40 rounded-full">
                        {activity.community?.name || '本地地摊' }
                      </span>
                      {activity.isLive && (
                        <span className="px-3 py-1 text-xs bg-red-500 text-white rounded-full flex items-center gap-1 animate-pulse">
                          <Play className="w-3 h-3" /> 直播中
                        </span>
                      )}
                    </div>
                  </div>
                )}
                <div className="p-4 space-y-2">
                  <h2 className="text-lg font-semibold text-text-primary line-clamp-1">
                    {activity.title}
                  </h2>
                  {activity.description && (
                    <p className="text-sm text-text-secondary line-clamp-2">{activity.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {activity.startTime
                        ? new Date(activity.startTime).toLocaleString('zh-CN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '时间待定'}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {activity.location || activity.community?.address || '地点待定'}
                    </span>
                    {activity.isUpcoming && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-600">即将开始</span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}

        <div ref={loadMoreRef} className="h-10" />

        {loading && activities.length > 0 && (
          <div className="py-4 text-center text-sm text-text-secondary">加载更多活动...</div>
        )}

        {!hasMore && activities.length > 0 && (
          <div className="py-4 text-center text-xs text-text-tertiary">没有更多活动啦，关注社区公告获取最新地摊资讯</div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
}

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Flame, MapPin, Calendar, Users, Video, PlayCircle } from 'lucide-react';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Loading } from '@/components/Loading';
import { EmptyState } from '@/components/EmptyState';
import { apiRequest } from '@lago/common';

interface MarketActivity {
  id: string;
  title: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  status: string;
  images?: string[];
  coverImage?: string | null;
  isLive: boolean;
  isUpcoming: boolean;
  community: {
    id: string;
    name: string;
    coverImage?: string | null;
    address?: string | null;
    verificationStatus?: string;
  };
}

interface MarketFeedResponse {
  activities: MarketActivity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function FleaMarketPage() {
  const router = useRouter();
  const [activities, setActivities] = useState<MarketActivity[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadFeed(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasMore && !loading && !loadingMore) {
          loadFeed(page + 1);
        }
      },
      { threshold: 1 }
    );

    const current = loaderRef.current;
    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
    };
  }, [page, hasMore, loading, loadingMore]);

  async function loadFeed(pageToLoad: number, replace = false) {
    try {
      if (replace) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await apiRequest<MarketFeedResponse>(
        '/api/communities/activities/feed',
        {
          method: 'GET',
          params: {
            page: String(pageToLoad),
            limit: '10',
          },
        }
      );

      if (response.success && response.data?.activities) {
        const newItems = response.data.activities;
        setActivities((prev) => (replace ? newItems : [...prev, ...newItems]));
        setPage(pageToLoad);
        setHasMore(pageToLoad < (response.data.pagination?.totalPages || 1));
      } else if (replace) {
        setActivities([]);
        setHasMore(false);
      }
    } catch (error) {
      console.error('加载跳蚤市场失败:', error);
      if (replace) {
        setActivities([]);
      }
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  const now = useMemo(() => new Date(), []);

  const formatTime = (value?: string) => {
    if (!value) return '时间待定';
    return new Date(value).toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleItemClick = (item: MarketActivity) => {
    if (item.isLive) {
      router.push(`/flea-market/live/${item.id}?community=${item.community.id}`);
    } else {
      router.push(`/communities/${item.community.id}/activities/${item.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-white pb-24">
      <header className="px-4 pt-10 pb-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
            <Flame className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-xl font-semibold text-text-primary">跳蚤市场</h1>
            <p className="text-xs text-text-secondary">沉浸式逛逛社区地摊与直播摊位</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <MapPin className="w-4 h-4" />
          <span>实时更新 · 本地社区地摊精选</span>
        </div>
      </header>

      <main className="px-4 space-y-4">
        {loading ? (
          <div className="py-20">
            <Loading text="正在赶往跳蚤市场" />
          </div>
        ) : activities.length === 0 ? (
          <EmptyState
            icon="calendar"
            title="暂未发现地摊活动"
            description="关注本地社区，第一时间获知地摊直播信息"
          />
        ) : (
          <section className="space-y-4">
            {activities.map((activity) => {
              const cover = activity.coverImage || activity.community.coverImage || '';
              const isLive = activity.isLive;
              const isFuture = activity.isUpcoming;
              return (
                <button
                  key={activity.id}
                  type="button"
                  onClick={() => handleItemClick(activity)}
                  className="w-full text-left bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {cover ? (
                    <div className="relative h-56">
                      <img
                        src={cover}
                        alt={activity.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute top-3 left-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/50 text-white text-xs">
                        <span>{activity.community.name}</span>
                        {activity.community.verificationStatus === 'approved' && <ShieldIcon />}
                      </div>
                      <div className="absolute top-3 right-3">
                        {isLive ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-500 text-white text-xs">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                            </span>
                            直播中
                          </span>
                        ) : isFuture ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/90 text-white text-xs">
                            <PlayCircle className="w-3 h-3" />
                            即将开场
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs">地摊活动</span>
                      <h2 className="text-lg font-semibold text-text-primary line-clamp-1">
                        {activity.title}
                      </h2>
                    </div>
                    {activity.description && (
                      <p className="text-sm text-text-secondary line-clamp-2">{activity.description}</p>
                    )}
                    <div className="flex items-center justify-between text-xs text-text-secondary">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        <span>{formatTime(activity.startTime)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        <span>{activity.location || activity.community.address || '线下集合点待公布'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-3 h-3" />
                        <span>社区热度</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}

            {loadingMore && (
              <div className="py-4 text-center text-xs text-text-secondary">更多摊位上架中...</div>
            )}

            <div ref={loaderRef} className="h-6" />
          </section>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
}

function ShieldIcon() {
  return <Video className="w-3 h-3 opacity-80" />;
}

