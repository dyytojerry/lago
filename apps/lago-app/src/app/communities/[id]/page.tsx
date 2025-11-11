"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from 'next/navigation';
import { Loading } from '@/components/Loading';
import { EmptyState } from '@/components/EmptyState';
import { BannerSwiper } from '@/components/BannerSwiper';
import { ProductCard } from '@/components/ProductCard';
import { useAuth } from '@lago/ui';
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  LogIn,
  MapPin,
  Package,
  Plus,
  Shield,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';
import MediaPreview from '@lago/ui/src/components/MediaPreview';
import {
  productDetail,
  communities,
  communitieJoin,
  communitieLeave,
  communitieUpdateMemberRole,
} from '@/lib/apis';
import { useOnboarding } from '@/lib/apis/onboarding';
import { CommunityMemberRole } from '@/lib/apis/types';
import {
  CommunityActionSheet,
  CommunityActionKey,
} from '@/components/CommunityActionSheet';

interface CommunityMember {
  id: string;
  userId: string;
  role: CommunityMemberRole;
  user: {
    id: string;
    nickname?: string;
    avatarUrl?: string;
    creditScore: number;
    isVerified: boolean;
  };
}

interface CommunityActivity {
  id: string;
  type: string;
  title: string;
  description?: string;
  images: string[];
  startTime?: string;
  endTime?: string;
  location?: string;
  status: string;
}

interface CommunityResponse {
  community: {
    id: string;
    name: string;
    address?: string;
    images: string[];
    description?: string;
    province?: { id: string; name: string };
    city?: { id: string; name: string };
    district?: { id: string; name: string };
    verificationStatus: 'pending' | 'processing' | 'approved' | 'rejected';
    partnerId?: string | null;
    isJoined: boolean;
    currentUserRole?: CommunityMemberRole | null;
    memberRole?: CommunityMemberRole | null;
    members: CommunityMember[];
    activities: CommunityActivity[];
    _count?: {
      members: number;
      products: number;
      activities: number;
    };
  };
}

const ROLE_LABELS: Record<CommunityMemberRole, string> = {
  [CommunityMemberRole.SUPERVISOR]: '物业主管',
  [CommunityMemberRole.STEWARD]: '物业管家',
  [CommunityMemberRole.MAINTENANCE]: '物业维修',
  [CommunityMemberRole.SECURITY]: '物业保安',
  [CommunityMemberRole.RESIDENT]: '住户',
};

const ROLE_SELECT_OPTIONS = [
  {
    value: CommunityMemberRole.STEWARD,
    label: ROLE_LABELS[CommunityMemberRole.STEWARD],
  },
  {
    value: CommunityMemberRole.MAINTENANCE,
    label: ROLE_LABELS[CommunityMemberRole.MAINTENANCE],
  },
  {
    value: CommunityMemberRole.SECURITY,
    label: ROLE_LABELS[CommunityMemberRole.SECURITY],
  },
  {
    value: CommunityMemberRole.RESIDENT,
    label: ROLE_LABELS[CommunityMemberRole.RESIDENT],
  },
];

function getVerificationStatusInfo(
  status: CommunityResponse["community"]["verificationStatus"]
) {
  switch (status) {
    case "approved":
      return {
        label: "已认证",
        badgeClass: "bg-emerald-50 text-emerald-600",
        Icon: CheckCircle,
      };
    case "processing":
      return {
        label: "审核中",
        badgeClass: "bg-orange-50 text-orange-600",
        Icon: Clock,
      };
    case "rejected":
      return {
        label: "认证未通过",
        badgeClass: "bg-red-50 text-red-500",
        Icon: XCircle,
      };
    default:
      return {
        label: "未认证",
        badgeClass: "bg-gray-100 text-gray-500",
        Icon: Shield,
      };
  }
}

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

export default function CommunityDetailPage() {
  const router = useRouter();
  const params = useParams();
  const communityId = params.id as string;
  const { user } = useAuth();

  const [community, setCommunity] = useState<CommunityResponse["community"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const [showAllMembers, setShowAllMembers] = useState(false);
  const [showMediaPreview, setShowMediaPreview] = useState(false);
  const [mediaPreviewIndex, setMediaPreviewIndex] = useState(0);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null);

  const {
    data: onboardingData,
    isFetching: onboardingFetching,
    refetch: refetchOnboarding,
  } = useOnboarding({ enabled: Boolean(user) });

  const hasApprovedOnboarding = useMemo(() => {
    const applications = onboardingData?.data?.applications || [];
    return applications.some(
      (app: any) => (app.status || "").toLowerCase() === "approved"
    );
  }, [onboardingData]);

  const fetchCommunity = useCallback(
    async (withLoading = false) => {
      try {
        if (withLoading) {
          setLoading(true);
        }
        const response = await communities({ id: communityId }, true);
        const data = response.data as CommunityResponse | undefined;
        if (response.success && data?.community) {
          setCommunity(data.community);
        } else {
          setCommunity(null);
        }
      } catch (error) {
        console.error("加载小区详情失败:", error);
        setCommunity(null);
      } finally {
        if (withLoading) {
          setLoading(false);
        }
      }
    },
    [communityId]
  );

  useEffect(() => {
    function handleScroll() {
      setShowStickyHeader(window.scrollY > 120);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    fetchCommunity(true);
  }, [fetchCommunity]);

  useEffect(() => {
    if (showActionSheet && user) {
      refetchOnboarding();
    }
  }, [showActionSheet, user, refetchOnboarding]);

  useEffect(() => {
    async function loadProducts() {
      if (!community) return;
      try {
        setProductsLoading(true);
        const response = await productDetail(
          {
            communityId: community.id,
            limit: '6',
            page: '1',
          },
          true
        );
        if (response.success && response.data?.products) {
          setProducts(response.data.products || []);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error('加载小区商品失败:', error);
        setProducts([]);
      } finally {
        setProductsLoading(false);
      }
    }

    loadProducts();
  }, [community]);

  const handleJoin = async () => {
    if (!user) {
      toast.error('请先登录');
      router.push('/login');
      return;
    }

    if (community?.verificationStatus !== 'approved') {
      toast.error('该小区尚未认证，无法加入');
      return;
    }

    try {
      const response = await communitieJoin({ id: communityId });
      if (response.success) {
        toast.success('加入小区成功');
        fetchCommunity();
      } else {
        toast.error(response.message || '加入小区失败');
      }
    } catch (error: any) {
      toast.error(error.message || '加入失败');
    }
  };

  const handleLeave = async () => {
    try {
      const response = await communitieLeave({ id: communityId });
      if (response.success) {
        toast.success('已退出小区');
        fetchCommunity();
      } else {
        toast.error(response.message || '退出小区失败');
      }
    } catch (error: any) {
      toast.error(error.message || '退出失败');
    }
  };

  const handleVerify = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    router.push(`/communities/${communityId}/verify`);
  };

  const updateMemberRoleMutation = useMutation(
    async ({ memberId, role }: { memberId: string; role: CommunityMemberRole }) =>
      communitieUpdateMemberRole(
        { id: communityId, memberId },
        { role }
      ),
    {
      onMutate: ({ memberId }) => {
        setUpdatingMemberId(memberId);
      },
      onSuccess: async () => {
        toast.success('成员角色已更新');
        await fetchCommunity();
      },
      onError: (error: any) => {
        toast.error(error?.message || '更新成员角色失败');
      },
      onSettled: () => {
        setUpdatingMemberId(null);
      },
    }
  );

  const handleMemberRoleChange = (memberUserId: string, role: CommunityMemberRole) => {
    if (!community) return;
    const target = community.members.find((m) => m.userId === memberUserId);
    if (!target || target.role === role) {
      return;
    }
    updateMemberRoleMutation.mutate({ memberId: memberUserId, role });
  };

  const handleOpenCommunityActions = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!community) {
      toast.error('小区信息加载中，请稍候');
      return;
    }
    setShowActionSheet(true);
  };

  const handleCommunityAction = useCallback(
    (action: CommunityActionKey) => {
      if (!user) {
        router.push('/login');
        return;
      }

      const needsOnboarding =
        action === 'publish' || action === 'resell' || action === 'skill';

      if (needsOnboarding) {
        if (onboardingFetching) {
          toast('正在检查入驻状态，请稍候完成再操作');
          return;
        }

        if (!hasApprovedOnboarding) {
          setShowActionSheet(false);
          toast.error('请先完成入驻申请，再发布闲置或技能');
          router.push('/profile/onboarding');
          return;
        }
      }

      if (community?.verificationStatus !== 'approved') {
        toast.error('该小区尚未认证，暂无法使用此功能');
        return;
      }

      const requiresMembership =
        action === 'community-post' || action === 'community-live';

      if (
        requiresMembership &&
        !community?.isJoined &&
        community?.currentUserRole !== CommunityMemberRole.SUPERVISOR
      ) {
        toast.error('请先加入小区或联系物业主管');
        return;
      }

      const encodedCommunityName = community?.name
        ? encodeURIComponent(community.name)
        : '';

      setShowActionSheet(false);

      switch (action) {
        case 'publish':
          router.push(
            `/publish?communityId=${communityId}${
              encodedCommunityName ? `&communityName=${encodedCommunityName}` : ''
            }`
          );
          break;
        case 'resell':
          router.push(
            `/publish?mode=resell&communityId=${communityId}${
              encodedCommunityName ? `&communityName=${encodedCommunityName}` : ''
            }`
          );
          break;
        case 'skill':
          router.push(
            `/publish?mode=skill&communityId=${communityId}${
              encodedCommunityName ? `&communityName=${encodedCommunityName}` : ''
            }`
          );
          break;
        case 'community-post':
          router.push(`/communities/${communityId}/dynamics/new`);
          break;
        case 'community-live':
          router.push('/property/live');
          break;
        default:
          router.push('/publish');
      }
    },
    [
      community,
      communityId,
      hasApprovedOnboarding,
      onboardingFetching,
      router,
      user,
    ]
  );

  const mediaItems = useMemo(
    () => community?.images?.map((url) => ({ url, type: 'image' as const })) || [],
    [community]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center pt-24">
          <Loading text="加载中..." />
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-background">
        <EmptyState
          icon="package"
          title="小区不存在"
          description="该小区可能已被删除"
          action={{
            label: '返回',
            onClick: () => router.back(),
          }}
        />
      </div>
    );
  }

  const statusInfo = getVerificationStatusInfo(community.verificationStatus);
  const StatusIcon = statusInfo.Icon;
  const canApplyVerification =
    community.verificationStatus === 'pending' || community.verificationStatus === 'rejected';
  const isVerificationProcessing = community.verificationStatus === 'processing';
  const canManageMembers =
    community.currentUserRole === CommunityMemberRole.SUPERVISOR ||
    (!!community.partnerId && community.partnerId === user?.id);

  return (
    <div className="min-h-screen bg-background pb-24">
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-transform duration-300 ${
          showStickyHeader ? 'translate-y-0 bg-white/95 backdrop-blur border-b border-gray-100' : '-translate-y-full'
        }`}
      >
        <div className="px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="返回"
          >
            <ArrowLeft className="w-5 h-5 text-text-primary" />
          </button>
          <h1 className="text-base font-semibold text-text-primary line-clamp-1 flex-1 text-center">
            {community.name}
          </h1>
          <div className="w-9" />
        </div>
      </header>

      <main className="max-w-6xl mx-auto pb-20">
        <section className="relative bg-gray-200">
          {community.images?.length ? (
            <BannerSwiper
              banners={community.images.map((image, index) => ({ id: `${index}`, image }))}
              onBannerClick={(banner) => {
                const index = community.images.findIndex((img) => img === banner.image);
                setMediaPreviewIndex(Math.max(index, 0));
                setShowMediaPreview(true);
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <MapPin className="w-12 h-12" />
            </div>
          )}
          <div className="absolute top-6 left-4 z-30">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              aria-label="返回"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
        </section>

        <section className="relative px-4">
          <div className="-mt-4 bg-white rounded-3xl shadow-lg p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-semibold text-text-primary">
                    {community.name}
                  </h1>
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusInfo.badgeClass}`}
                  >
                    <StatusIcon className="w-4 h-4" />
                    {statusInfo.label}
                  </span>
                </div>
                {community.address && (
                  <div className="flex items-center gap-1 text-sm text-text-secondary mt-2">
                    <MapPin className="w-4 h-4" />
                    <span>{community.address}</span>
                  </div>
                )}
                {community.description && (
                  <p className="text-sm text-text-secondary mt-2 line-clamp-2">
                    {community.description}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {community.verificationStatus === 'approved' ? (
                  community.isJoined ? (
                    <button
                      onClick={handleLeave}
                      className="px-4 py-2 rounded-full border border-gray-200 text-sm text-text-primary hover:bg-gray-50 transition-colors"
                    >
                      退出小区
                    </button>
                  ) : (
                    <button
                      onClick={handleJoin}
                      className="px-4 py-2 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      <span className="inline-flex items-center gap-1">
                        <LogIn className="w-4 h-4" />
                        加入小区
                      </span>
                    </button>
                  )
                ) : canApplyVerification ? (
                  <button
                    onClick={handleVerify}
                    className="px-4 py-2 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    <span className="inline-flex items-center gap-1">
                      <Shield className="w-4 h-4" />
                      {community.verificationStatus === 'rejected' ? '重新认证' : '立即认证'}
                    </span>
                  </button>
                ) : isVerificationProcessing ? (
                  <button
                    type="button"
                    disabled
                    className="px-4 py-2 rounded-full border border-gray-200 text-sm text-text-secondary bg-gray-50 cursor-default"
                  >
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      审核中
                    </span>
                  </button>
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center text-sm text-text-secondary">
              <div className="bg-gray-50 rounded-2xl py-3">
                <div className="text-base font-semibold text-text-primary">
                  {community._count?.members ?? 0}
                </div>
                <div className="mt-1 flex items-center justify-center gap-1 text-xs">
                  <Users className="w-3 h-3" />
                  成员
                </div>
              </div>
              <div className="bg-gray-50 rounded-2xl py-3">
                <div className="text-base font-semibold text-text-primary">
                  {community._count?.products ?? 0}
                </div>
                <div className="mt-1 flex items-center justify-center gap-1 text-xs">
                  <Package className="w-3 h-3" />
                  闲置
                </div>
              </div>
              <div className="bg-gray-50 rounded-2xl py-3">
                <div className="text-base font-semibold text-text-primary">
                  {community._count?.activities ?? 0}
                </div>
                <div className="mt-1 flex items-center justify-center gap-1 text-xs">
                  <Calendar className="w-3 h-3" />
                  动态
                </div>
              </div>
            </div>
          </div>
        </section>

        {products.length > 0 && (
          <section className="px-4 mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">小区闲置商品</h2>
              <button
                onClick={() => router.push(`/property/${community.id}`)}
                className="text-sm text-primary hover:underline"
              >
                查看更多
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  title={product.title}
                  price={product.price}
                  images={product.images}
                  location={product.location}
                  communityName={product.community?.name || community.name}
                  viewCount={product.viewCount}
                  likeCount={product.likeCount}
                  type={product.type}
                  isVerified={product.isVerified}
                />
              ))}
            </div>
          </section>
        )}

        {productsLoading && products.length === 0 ? (
          <div className="px-4 mt-8">
            <div className="bg-white rounded-3xl p-6 shadow-sm text-center">
              <Loading text="加载小区闲置商品..." />
            </div>
          </div>
        ) : <EmptyState icon="package" title="暂无闲置商品" description="该小区暂无闲置商品" />}

        {community.members && community.members.length > 0 ? (
          <section className="px-4 mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">小区住户</h2>
              {community._count?.members && community._count.members > 8 && (
                <button
                  onClick={() => setShowAllMembers(true)}
                  className="text-sm text-primary hover:underline"
                >
                  查看全部
                </button>
              )}
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {community.members.slice(0, 8).map((member) => (
                <div
                  key={member.id}
                  onClick={() => router.push(`/users/${member.user.id}`)}
                  className="flex-shrink-0 flex flex-col items-center gap-2 cursor-pointer"
                >
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100">
                    {member.user.avatarUrl ? (
                      <img
                        src={member.user.avatarUrl}
                        alt={member.user.nickname || '用户'}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg text-gray-400">
                        {member.user.nickname?.[0] || '用'}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-text-secondary text-center max-w-[80px] line-clamp-1">
                    {member.user.nickname || '用户'}
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-gray-100 text-[11px] text-text-secondary">
                    {ROLE_LABELS[member.role]}
                  </span>
                  {canManageMembers &&
                    member.role !== CommunityMemberRole.SUPERVISOR &&
                    member.userId !== user?.id && (
                      <select
                        value={member.role}
                        onClick={(event) => event.stopPropagation()}
                        onChange={(event) =>
                          handleMemberRoleChange(
                            member.userId,
                            event.target.value as CommunityMemberRole
                          )
                        }
                        disabled={updatingMemberId === member.userId}
                        className="mt-1 text-[11px] px-2 py-1 rounded-full border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        {ROLE_SELECT_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}
                </div>
              ))}
            </div>
          </section>
        ) : <EmptyState icon="users" title="暂无住户" description="该小区暂无住户" />}

        {community.activities && community.activities.length > 0 ? (
          <section className="px-4 mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">小区动态</h2>
              <span className="text-xs text-text-secondary">
                共 {community._count?.activities ?? community.activities.length} 条
              </span>
            </div>
            <div className="space-y-4">
              {community.activities.map((activity) => (
                <div
                  key={activity.id}
                  onClick={() => router.push(`/communities/${communityId}/dynamics/${activity.id}`)}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                    {activity.images?.[0] && (
                      <div className="relative h-48">
                        <img
                          src={activity.images[0]}
                          alt={activity.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                  )}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs">
                        {activity.type === 'announcement'
                          ? '公告'
                          : activity.type === 'market'
                          ? '集市'
                          : activity.type === 'festival'
                          ? '节庆'
                          : '动态'}
                      </span>
                      <h3 className="text-base font-semibold text-text-primary line-clamp-1">
                        {activity.title}
                      </h3>
                    </div>
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
                            ? new Date(activity.startTime).toLocaleString('zh-CN', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '时间待定'}
                        </span>
                      </div>
                      <span>{activity.location || '线下地点'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : <EmptyState icon="calendar" title="暂无动态" description="该小区暂无社区动态" />}
      </main>

      <button
        onClick={handleOpenCommunityActions}
        className="fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
        aria-label="发布闲置"
      >
        <Plus className="w-6 h-6" />
      </button>

      <CommunityActionSheet
        open={showActionSheet}
        onClose={() => setShowActionSheet(false)}
        onAction={handleCommunityAction}
        checkingOnboarding={showActionSheet && !!user && onboardingFetching}
      />

      {showAllMembers && community.members && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-semibold text-text-primary">
                全部成员 ({community._count?.members ?? community.members.length})
              </h3>
              <button
                onClick={() => setShowAllMembers(false)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-text-secondary" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-4 gap-4">
                {community.members.map((member) => (
                  <div
                    key={member.id}
                    onClick={() => {
                      router.push(`/users/${member.user.id}`);
                      setShowAllMembers(false);
                    }}
                    className="flex flex-col items-center gap-2 cursor-pointer"
                  >
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100">
                      {member.user.avatarUrl ? (
                        <img
                          src={member.user.avatarUrl}
                          alt={member.user.nickname || '用户'}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl text-gray-400">
                          {member.user.nickname?.[0] || '用'}
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-text-primary line-clamp-1">
                        {member.user.nickname || '用户'}
                      </p>
                      <p className="text-xs text-text-secondary">信用 {member.user.creditScore}</p>
                      <p className="text-[11px] text-primary mt-1">{ROLE_LABELS[member.role]}</p>
                    </div>
                    {canManageMembers &&
                      member.role !== CommunityMemberRole.SUPERVISOR &&
                      member.userId !== user?.id && (
                        <select
                          value={member.role}
                          onClick={(event) => event.stopPropagation()}
                          onChange={(event) =>
                            handleMemberRoleChange(
                              member.userId,
                              event.target.value as CommunityMemberRole
                            )
                          }
                          disabled={updatingMemberId === member.userId}
                          className="w-full text-xs px-2 py-1 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          {ROLE_SELECT_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showMediaPreview && mediaItems.length > 0 && (
        <MediaPreview
          isOpen={showMediaPreview}
          onClose={() => setShowMediaPreview(false)}
          mediaItems={mediaItems}
          initialIndex={mediaPreviewIndex}
        />
      )}
    </div>
  );
}

