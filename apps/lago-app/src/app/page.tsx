"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { BottomNavigation } from "@/components/BottomNavigation";
import { ProductCard } from "@/components/ProductCard";
import { BannerSwiper } from "@/components/BannerSwiper";
import { Loading } from "@/components/Loading";
import { EmptyState } from "@/components/EmptyState";
import { apiRequest } from "@lago/common";
import { useAuth } from "@lago/ui";
import { useGeolocation } from "@/hooks/useGeolocation";
import { communitieMy, communitieNearby, productDetail } from "@/lib/apis";
import {
  Bell,
  MapPin,
  MoreHorizontal,
  Search,
  Users,
  ArrowRight,
  Plus,
  Calendar,
  Play,
} from "lucide-react";

interface Product {
  id: string;
  title: string;
  price: number;
  images: string[];
  location?: string;
  community?: {
    id: string;
    name: string;
    location?: string;
  };
  viewCount: number;
  likeCount: number;
  type: "rent" | "sell" | "both";
  isVerified: boolean;
}

interface CommunitySummary {
  id: string;
  name: string;
  address?: string;
  images: string[];
  _count?: {
    members: number;
    products: number;
  };
  distance?: number;
}

interface CommunityActivityItem {
  id: string;
  title: string;
  description?: string;
  images: string[];
  startTime?: string;
  location?: string;
  communityId: string;
  communityName: string;
  communityCover?: string;
}

interface CommunityDetailResponse {
  community: {
    id: string;
    name: string;
    description?: string;
    images: string[];
    activities: Array<{
      id: string;
      title: string;
      description?: string;
      images: string[];
      startTime?: string;
      location?: string;
      status: string;
    }>;
  };
}

const DEFAULT_BANNERS = [
  {
    id: "banner-1",
    image:
      "https://images.unsplash.com/photo-1529429617124-aee80789dd0c?auto=format&fit=crop&w=1400&q=60",
    link: "/search",
  },
  {
    id: "banner-2",
    image:
      "https://images.unsplash.com/photo-1536067398034-21f2b182c5ee?auto=format&fit=crop&w=1400&q=60",
    link: "/communities/search",
  },
  {
    id: "banner-3",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=60",
    link: "/publish",
  },
];

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { latitude, longitude, loading: geoLoading } = useGeolocation();

  const [pageLoading, setPageLoading] = useState(true);
  const [myCommunities, setMyCommunities] = useState<CommunitySummary[]>([]);
  const [nearbyCommunities, setNearbyCommunities] = useState<
    CommunitySummary[]
  >([]);
  const [communityProducts, setCommunityProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  const [activityFeed, setActivityFeed] = useState<CommunityActivityItem[]>([]);
  const [activityCursor, setActivityCursor] = useState(0);
  const [activityLoading, setActivityLoading] = useState(false);
  const [hasMoreActivities, setHasMoreActivities] = useState(true);
  const loadedCommunityIdsRef = useRef<Set<string>>(new Set());
  const activityObserverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!geoLoading && latitude && longitude) {
      communitieNearby(
        {
          latitude,
          longitude,
          radius: 2000,
        },
        true
      ).then((nearbyRes) => {
        if (nearbyRes.success && nearbyRes.data?.communities) {
          setNearbyCommunities(nearbyRes.data.communities || []);
        }
      });
    }

    if (authLoading) return;

    async function loadInitial() {
      try {
        setPageLoading(true);

        if (user) {
          const myRes = await communitieMy(true);
          if (myRes.success && myRes.data?.communities) {
            setMyCommunities(myRes.data.communities || []);
          }
        } else {
          setMyCommunities([]);
        }
      } catch (error) {
        console.error("加载首页数据失败:", error);
      } finally {
        setPageLoading(false);
      }
    }

    loadInitial();
  }, [authLoading, user, latitude, longitude, geoLoading]);

  const communitySequence = useMemo(() => {
    const map = new Map<string, CommunitySummary>();
    for (const community of myCommunities) {
      map.set(community.id, community);
    }
    for (const community of nearbyCommunities) {
      if (!map.has(community.id)) {
        map.set(community.id, community);
      }
    }
    return Array.from(map.values());
  }, [myCommunities, nearbyCommunities]);

  const primaryCommunityId = useMemo(() => {
    return communitySequence[0]?.id;
  }, [communitySequence]);

  useEffect(() => {
    if (!primaryCommunityId) {
      setCommunityProducts([]);
      return;
    }

    async function loadProducts() {
      try {
        setProductsLoading(true);
        const response = await productDetail(
          {
            communityId: primaryCommunityId,
            limit: "6",
            page: "1",
          },
          true
        );
        if (response.success && response.data?.products) {
          setCommunityProducts(response.data.products || []);
        } else {
          setCommunityProducts([]);
        }
      } catch (error) {
        console.error("加载小区商品失败:", error);
        setCommunityProducts([]);
      } finally {
        setProductsLoading(false);
      }
    }

    loadProducts();
  }, [primaryCommunityId]);

  const loadMoreActivities = useCallback(async () => {
    if (activityLoading || !hasMoreActivities) return;

    try {
      setActivityLoading(true);

      let nextIndex = activityCursor;
      const newFeed: CommunityActivityItem[] = [];

      while (nextIndex < communitySequence.length) {
        const community = communitySequence[nextIndex];
        nextIndex += 1;

        if (!community || loadedCommunityIdsRef.current.has(community.id)) {
          continue;
        }

        loadedCommunityIdsRef.current.add(community.id);

        try {
          const detailResponse = await apiRequest<CommunityDetailResponse>(
            `/api/communities/${community.id}`,
            {
              method: "GET",
              noAuthorize: true,
            }
          );

          const activities = detailResponse.data?.community?.activities || [];
          if (activities.length > 0) {
            for (const activity of activities) {
              newFeed.push({
                id: activity.id,
                title: activity.title,
                description: activity.description,
                images: activity.images || [],
                startTime: activity.startTime,
                location: activity.location,
                communityId: community.id,
                communityName:
                  detailResponse.data?.community?.name || community.name,
                communityCover:
                  activity.images?.[0] ||
                  detailResponse.data?.community?.images?.[0] ||
                  community.images?.[0],
              });
            }
            break;
          }
        } catch (error) {
          console.error("加载小区活动失败:", error);
        }
      }

      setActivityCursor(nextIndex);

      if (newFeed.length > 0) {
        setActivityFeed((prev) => [...prev, ...newFeed]);
      }

      if (nextIndex >= communitySequence.length) {
        setHasMoreActivities(false);
      }
    } finally {
      setActivityLoading(false);
    }
  }, [activityCursor, activityLoading, communitySequence, hasMoreActivities]);

  useEffect(() => {
    setActivityFeed([]);
    setActivityCursor(0);
    setHasMoreActivities(true);
    loadedCommunityIdsRef.current.clear();
  }, [communitySequence]);

  useEffect(() => {
    if (
      communitySequence.length === 0 ||
      activityFeed.length > 0 ||
      activityLoading
    )
      return;
    loadMoreActivities();
  }, [
    communitySequence,
    activityFeed.length,
    activityLoading,
    loadMoreActivities,
  ]);

  useEffect(() => {
    const target = activityObserverRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreActivities();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [loadMoreActivities]);

  const handlePublish = () => {
    router.push("/publish");
  };

  const renderHeader = () => (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur">
      <div className="px-4 pt-3 pb-2 space-y-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-semibold text-primary">来购</div>
          <div className="flex items-center gap-2 text-text-secondary">
            <button
              onClick={() => router.push("/messages")}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Bell className="w-5 h-5" />
            </button>
            <button
              onClick={() => router.push("/profile")}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div>
          <button
            onClick={() => router.push("/communities/search")}
            className="w-full flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-left text-sm text-text-secondary hover:bg-gray-200 transition-colors"
          >
            <Search className="w-4 h-4" />
            <span className="flex-1">搜小区</span>
          </button>
        </div>
      </div>
    </header>
  );

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-background">
        {renderHeader()}
        <Loading text="加载中..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {renderHeader()}

      <main className="max-w-6xl mx-auto px-4 pb-24">
        <section className="mt-4 mb-6">
          <div className="rounded-3xl overflow-hidden shadow-sm">
            <BannerSwiper
              banners={DEFAULT_BANNERS}
              onBannerClick={(banner) => {
                if (banner.link) {
                  router.push(banner.link);
                }
              }}
            />
          </div>
        </section>

        {communitySequence.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-text-primary">
                推荐小区
              </h2>
              <button
                onClick={() => router.push("/communities/search")}
                className="text-sm text-primary flex items-center gap-1"
              >
                查看更多
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {communitySequence.map((community) => (
                <button
                  key={community.id}
                  type="button"
                  onClick={() => router.push(`/communities/${community.id}`)}
                  className="flex-shrink-0 w-40 bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow text-left"
                >
                  <div className="relative w-full h-32">
                    {community.images?.[0] ? (
                      <Image
                        src={community.images[0]}
                        alt={community.name}
                        fill
                        className="object-cover"
                        sizes="160px"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <MapPin className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{community._count?.members ?? 0}</span>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-text-primary line-clamp-1">
                      {community.name}
                    </h3>
                    <p className="text-xs text-text-secondary line-clamp-1">
                      {community.address || "点击查看详情"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {communityProducts.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-text-primary">
                小区闲置
              </h2>
              {primaryCommunityId && (
                <button
                  onClick={() =>
                    router.push(`/communities/${primaryCommunityId}`)
                  }
                  className="text-sm text-primary flex items-center gap-1"
                >
                  前往小区
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {communityProducts.map((product) => (
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

        {productsLoading && communityProducts.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center mb-8 shadow-sm">
            <Loading text="加载小区商品中..." />
          </div>
        )}

        <section className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-text-primary">
              小区活动
            </h2>
            <span className="text-xs text-text-secondary">下拉加载更多</span>
          </div>

          {activityFeed.length === 0 && activityLoading && (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
              <Loading text="加载活动中..." />
            </div>
          )}

          {activityFeed.length === 0 && !activityLoading && (
            <EmptyState
              icon="message"
              title="暂无社区活动"
              description="关注你的小区，第一时间获取活动动态"
            />
          )}

          <div className="space-y-4">
            {activityFeed.map((activity) => (
              <button
                key={activity.id}
                type="button"
                className="w-full text-left bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                onClick={() =>
                  router.push(
                    `/communities/${activity.communityId}/activities/${activity.id}`
                  )
                }
              >
                <div className="relative h-56">
                  {activity.communityCover ? (
                    <Image
                      src={activity.communityCover}
                      alt={activity.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 600px"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-emerald-400 to-teal-500 flex items-center justify-center text-white text-lg font-semibold">
                      {activity.title}
                    </div>
                  )}
                  <div className="absolute inset-x-0 top-0 p-4 flex justify-between">
                    <span className="bg-black/50 text-white text-xs px-3 py-1 rounded-full">
                      {activity.communityName}
                    </span>
                    <span className="bg-white/80 text-primary text-xs px-3 py-1 rounded-full flex items-center gap-1">
                      <Play className="w-3 h-3" />
                      走进活动
                    </span>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="text-lg font-semibold text-text-primary line-clamp-1">
                    {activity.title}
                  </h3>
                  {activity.description && (
                    <p className="text-sm text-text-secondary line-clamp-2">
                      {activity.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-text-secondary">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {activity.startTime
                          ? new Date(activity.startTime).toLocaleString(
                              "zh-CN",
                              {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )
                          : "时间待定"}
                      </span>
                    </div>
                    <span>{activity.location || "线下活动"}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div ref={activityObserverRef} className="h-6" />

          {activityLoading && activityFeed.length > 0 && (
            <div className="py-4 text-center text-sm text-text-secondary">
              加载更多活动...
            </div>
          )}

          {!hasMoreActivities && activityFeed.length > 0 && (
            <div className="py-4 text-center text-xs text-text-tertiary">
              没有更多活动了
            </div>
          )}
        </section>
      </main>

      <button
        onClick={handlePublish}
        className="fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
        aria-label="发布闲置"
      >
        <Plus className="w-6 h-6" />
      </button>

      <BottomNavigation />
    </div>
  );
}
