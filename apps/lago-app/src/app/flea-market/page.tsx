"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Loading } from "@/components/Loading";
import { EmptyState } from "@/components/EmptyState";
import {
  communitieActivitiesFeed,
  CommunitieActivitiesFeedQueryParams,
} from "@/lib/apis";
import { Calendar, MapPin, Play, Sparkles, Store } from "lucide-react";

type FleaPublisherType = "micro_merchant" | "platform" | "community";

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
  heatScore: number;
  publisher: {
    id: string | null;
    name: string;
    avatar: string | null;
    type: FleaPublisherType;
  };
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
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const getPublisherBadgeClass = useCallback((type: FleaPublisherType) => {
    switch (type) {
      case "platform":
        return "bg-blue-500/80 text-white";
      case "micro_merchant":
        return "bg-emerald-500/80 text-white";
      default:
        return "bg-slate-500/80 text-white";
    }
  }, []);

  const getPublisherBadgeLabel = useCallback((type: FleaPublisherType) => {
    switch (type) {
      case "platform":
        return "平台发布";
      case "micro_merchant":
        return "小微商家";
      default:
        return "社区运营";
    }
  }, []);

  const fetchActivities = useCallback(
    async (page: number, append = false) => {
      if (loading) return;
      setLoading(true);
      try {
        const queryParams: CommunitieActivitiesFeedQueryParams = {
          page,
          limit: pagination.limit,
        };
        const response = await communitieActivitiesFeed(queryParams, true);

        if (response.success && response.data) {
          const { activities: list = [], pagination: paging } =
            response.data as {
              activities?: FleaActivity[];
              pagination?: Pagination;
            };
          setPagination((prev) => paging || prev);
          setHasMore(
            paging
              ? paging.page < paging.totalPages
              : page < pagination.totalPages
          );
          setActivities((prev) => (append ? [...prev, ...list] : list));
        } else if (!append) {
          setActivities([]);
          setHasMore(false);
        }
      } catch (error) {
        console.error("加载跳蚤市场数据失败:", error);
        if (!append) {
          setActivities([]);
          setHasMore(false);
        }
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    },
    [loading, pagination.limit, pagination.totalPages]
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

  const handleCardClick = useCallback(
    (activity: FleaActivity) => {
      if (activity.isLive) {
        router.push(
          `/flea-market/live/${activity.id}?community=${
            activity.community?.id ?? ""
          }`
        );
        return;
      }
      if (activity.community?.id) {
        router.push(
          `/communities/${activity.community.id}/dynamics/${activity.id}`
        );
      }
    },
    [router]
  );

  const headline = useMemo(() => {
    const liveCount = activities.filter((activity) => activity.isLive).length;
    if (liveCount > 0) {
      return `当前有 ${liveCount} 场地摊直播正在进行`;
    }
    return "发现本地地摊集市，淘同城好物";
  }, [activities]);

  const renderContent = useMemo(() => {
    if (initialLoading) {
      return (
        <div className="bg-white rounded-2xl p-6 shadow-sm flex items-center justify-center">
          <Loading text="加载跳蚤市场活动..." />
        </div>
      );
    }

    if (activities.length === 0) {
      return (
        <EmptyState
          icon="package"
          title="暂无地摊活动"
          description="当前还没有地摊活动，去发起一场吧！"
          action={{
            label: "发起活动",
            onClick: () => router.push("/communities/search"),
          }}
        />
      );
    }

    return (
      <section className="space-y-4">
        {activities.map((activity) => (
          <article
            key={activity.id}
            className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <button
              type="button"
              onClick={() => handleCardClick(activity)}
              className="w-full text-left focus:outline-none cursor-pointer"
              aria-label={`查看${activity.title}`}
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
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 text-xs text-white bg-black/40 rounded-full">
                        {activity.community?.name || "本地地摊"}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-[10px] rounded-full backdrop-blur-sm ${getPublisherBadgeClass(
                          activity.publisher.type
                        )}`}
                      >
                        {getPublisherBadgeLabel(activity.publisher.type)}
                      </span>
                    </div>
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
                  <p className="text-sm text-text-secondary line-clamp-2">
                    {activity.description}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary">
                  <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
                    热度 {activity.heatScore.toFixed(0)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Store className="w-3 h-3" />
                    {activity.publisher.name}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {activity.startTime
                      ? new Date(activity.startTime).toLocaleString("zh-CN", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "时间待定"}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {activity.location ??
                      activity.community?.address ??
                      "地点待定"}
                  </span>
                  {activity.isUpcoming && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-600">
                      即将开始
                    </span>
                  )}
                </div>
              </div>
            </button>
          </article>
        ))}
      </section>
    );
  }, [
    activities,
    getPublisherBadgeClass,
    getPublisherBadgeLabel,
    handleCardClick,
    initialLoading,
    router,
  ]);

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
              onClick={() => router.push("/publish")}
              className="px-3 py-2 text-sm rounded-full bg-primary text-white shadow-sm hover:bg-primary/90 transition-colors"
            >
              我要摆摊
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              type="button"
              onClick={() => router.push("/city")}
              className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <MapPin className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm font-semibold text-text-primary">
                  同城闲置
                </p>
                <p className="text-xs text-text-secondary">逛逛附近好物</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => router.push("/property/live")}
              className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <Play className="w-8 h-8 text-red-500" />
              <div>
                <p className="text-sm font-semibold text-text-primary">
                  直播专区
                </p>
                <p className="text-xs text-text-secondary">线上逛地摊</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => router.push("/communities/search")}
              className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <Sparkles className="w-8 h-8 text-amber-500" />
              <div>
                <p className="text-sm font-semibold text-text-primary">
                  社区活动
                </p>
                <p className="text-xs text-text-secondary">玩转邻里福利</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => router.push("/property/dashboard")}
              className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <Store className="w-8 h-8 text-emerald-500" />
              <div>
                <p className="text-sm font-semibold text-text-primary">
                  商家入驻
                </p>
                <p className="text-xs text-text-secondary">本地商家专区</p>
              </div>
            </button>
          </div>
        </header>

        {renderContent}

        <div ref={loadMoreRef} className="h-10" />

        {loading && activities.length > 0 && (
          <div className="py-4 text-center text-sm text-text-secondary">
            加载更多活动...
          </div>
        )}

        {!hasMore && activities.length > 0 && (
          <div className="py-4 text-center text-xs text-text-tertiary">
            没有更多活动啦，关注社区公告获取最新地摊资讯
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
}
