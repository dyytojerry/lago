'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { EmptyState } from '@/components/EmptyState';
import { BannerSwiper } from '@/components/BannerSwiper';
import { apiRequest } from '@lago/common';
import { useAuth } from '@lago/ui';
import { MapPin, Users, Package, Calendar, Shield, LogIn, CheckCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';
import MediaPreview from '@lago/ui/src/components/MediaPreview';

interface Community {
  id: string;
  name: string;
  address?: string;
  images: string[];
  description?: string;
  province?: { id: string; name: string };
  city?: { id: string; name: string };
  district?: { id: string; name: string };
  verificationStatus: 'pending' | 'approved' | 'rejected';
  isJoined: boolean;
  members: Array<{
    id: string;
    user: {
      id: string;
      nickname?: string;
      avatarUrl?: string;
      creditScore: number;
      isVerified: boolean;
    };
  }>;
  activities: Array<{
    id: string;
    type: string;
    title: string;
    description?: string;
    images: string[];
    startTime?: string;
    endTime?: string;
    location?: string;
    status: string;
  }>;
  _count?: {
    members: number;
    products: number;
    activities: number;
  };
}

export default function CommunityDetailPage() {
  const router = useRouter();
  const params = useParams();
  const communityId = params.id as string;
  const { user } = useAuth();

  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllMembers, setShowAllMembers] = useState(false);
  const [showMediaPreview, setShowMediaPreview] = useState(false);
  const [mediaPreviewIndex, setMediaPreviewIndex] = useState(0);

  useEffect(() => {
    async function loadCommunity() {
      try {
        const response = await apiRequest<{ community: Community }>(
          `/api/communities/${communityId}`,
          {
            method: 'GET',
          }
        );
        if (response.success && response.data) {
          setCommunity(response.data.community);
        }
      } catch (error) {
        console.error('加载小区详情失败:', error);
      } finally {
        setLoading(false);
      }
    }
    loadCommunity();
  }, [communityId]);

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
      const response = await apiRequest(`/api/communities/${communityId}/join`, {
        method: 'POST',
      });
      if (response.success) {
        toast.success('加入小区成功');
        // 重新加载数据
        const refreshResponse = await apiRequest<{ community: Community }>(
          `/api/communities/${communityId}`,
          {
            method: 'GET',
          }
        );
        if (refreshResponse.success && refreshResponse.data) {
          setCommunity(refreshResponse.data.community);
        }
      }
    } catch (error: any) {
      toast.error(error.message || '加入失败');
    }
  };

  const handleLeave = async () => {
    try {
      const response = await apiRequest(`/api/communities/${communityId}/leave`, {
        method: 'POST',
      });
      if (response.success) {
        toast.success('已退出小区');
        // 重新加载数据
        const refreshResponse = await apiRequest<{ community: Community }>(
          `/api/communities/${communityId}`,
          {
            method: 'GET',
          }
        );
        if (refreshResponse.success && refreshResponse.data) {
          setCommunity(refreshResponse.data.community);
        }
      }
    } catch (error: any) {
      toast.error(error.message || '退出失败');
    }
  };

  const handleVerify = () => {
    router.push(`/communities/${communityId}/verify`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="小区详情" showBack />
        <Loading text="加载中..." />
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="小区详情" showBack />
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

  const mediaItems = community.images.map((url) => ({
    url,
    type: 'image' as const,
  }));

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="小区详情" showBack />

      <main className="max-w-7xl mx-auto">
        {/* 小区相册 */}
        {community.images.length > 0 ? (
          <div className="relative w-full h-64 bg-gray-100">
            <BannerSwiper
              banners={community.images.map((img, index) => ({
                id: String(index),
                image: img,
              }))}
              onBannerClick={() => {
                setMediaPreviewIndex(0);
                setShowMediaPreview(true);
              }}
            />
          </div>
        ) : (
          <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
            <MapPin className="w-16 h-16 text-gray-400" />
          </div>
        )}

        {/* 小区基本信息 */}
        <div className="bg-white px-4 py-4 mb-2">
          <div className="flex items-start justify-between mb-2">
            <h1 className="text-xl font-bold text-text-primary flex-1">{community.name}</h1>
            {community.verificationStatus === 'approved' && (
              <div className="flex items-center gap-1 text-primary text-sm">
                <Shield className="w-4 h-4" />
                <span>已认证</span>
              </div>
            )}
          </div>

          {community.address && (
            <div className="flex items-center gap-1 text-sm text-text-secondary mb-2">
              <MapPin className="w-4 h-4" />
              <span>{community.address}</span>
            </div>
          )}

          {community.province && community.city && (
            <div className="text-sm text-text-secondary mb-3">
              {community.province.name} {community.city.name}
              {community.district && ` ${community.district.name}`}
            </div>
          )}

          {/* 统计信息 */}
          <div className="flex items-center gap-4 text-sm text-text-secondary pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{community._count?.members || 0} 位成员</span>
            </div>
            <div className="flex items-center gap-1">
              <Package className="w-4 h-4" />
              <span>{community._count?.products || 0} 件商品</span>
            </div>
            {community._count && community._count.activities > 0 && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{community._count.activities} 个活动</span>
              </div>
            )}
          </div>
        </div>

        {/* 小区介绍 */}
        {community.description && (
          <div className="bg-white px-4 py-4 mb-2">
            <h2 className="text-base font-semibold text-text-primary mb-2">小区介绍</h2>
            <p className="text-sm text-text-secondary whitespace-pre-wrap">
              {community.description}
            </p>
          </div>
        )}

        {/* 成员列表 */}
        {community.members && community.members.length > 0 && (
          <div className="bg-white px-4 py-4 mb-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-text-primary">
                成员 ({community._count?.members || 0})
              </h2>
              {community._count && community._count.members > 10 && (
                <button
                  onClick={() => setShowAllMembers(true)}
                  className="text-sm text-primary"
                >
                  查看全部
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              {community.members.slice(0, 10).map((member) => (
                <div
                  key={member.id}
                  onClick={() => router.push(`/users/${member.user.id}`)}
                  className="flex flex-col items-center gap-1 cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                    {member.user.avatarUrl ? (
                      <Image
                        src={member.user.avatarUrl}
                        alt={member.user.nickname || '用户'}
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span className="text-lg">
                          {member.user.nickname?.[0] || '用'}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-text-secondary text-center max-w-[48px] truncate">
                    {member.user.nickname || '用户'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 小区活动 */}
        {community.activities && community.activities.length > 0 && (
          <div className="bg-white px-4 py-4 mb-2">
            <h2 className="text-base font-semibold text-text-primary mb-3">
              社区活动 ({community._count?.activities || 0})
            </h2>
            <div className="space-y-3">
              {community.activities.map((activity) => (
                <div
                  key={activity.id}
                  onClick={() => router.push(`/communities/${communityId}/activities/${activity.id}`)}
                  className="border border-gray-200 rounded-lg p-3 cursor-pointer hover:border-primary transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        activity.type === 'announcement'
                          ? 'bg-blue-100 text-blue-600'
                          : activity.type === 'market'
                          ? 'bg-orange-100 text-orange-600'
                          : activity.type === 'festival'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {activity.type === 'announcement'
                        ? '公告'
                        : activity.type === 'market'
                        ? '摆摊'
                        : activity.type === 'festival'
                        ? '过节'
                        : '活动'}
                    </span>
                    <h3 className="text-sm font-medium text-text-primary flex-1">
                      {activity.title}
                    </h3>
                  </div>
                  {activity.description && (
                    <p className="text-xs text-text-secondary line-clamp-2 mb-2">
                      {activity.description}
                    </p>
                  )}
                  {activity.startTime && (
                    <div className="flex items-center gap-1 text-xs text-text-secondary">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(activity.startTime).toLocaleString('zh-CN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 pb-safe">
          <div className="max-w-7xl mx-auto px-4 py-3 flex gap-3">
            {community.verificationStatus !== 'approved' && user?.role === 'property' && (
              <button
                onClick={handleVerify}
                className="flex-1 px-4 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <Shield className="w-5 h-5" />
                <span>申请认证</span>
              </button>
            )}
            {community.verificationStatus === 'approved' && (
              <>
                {community.isJoined ? (
                  <button
                    onClick={handleLeave}
                    className="flex-1 px-4 py-3 bg-gray-100 text-text-primary rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    退出小区
                  </button>
                ) : (
                  <button
                    onClick={handleJoin}
                    className="flex-1 px-4 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-5 h-5" />
                    <span>加入小区</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* 成员列表弹窗 */}
      {showAllMembers && community.members && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary">
                全部成员 ({community._count?.members || 0})
              </h3>
              <button
                onClick={() => setShowAllMembers(false)}
                className="text-text-secondary hover:text-text-primary"
              >
                <X className="w-5 h-5" />
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
                    <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
                      {member.user.avatarUrl ? (
                        <Image
                          src={member.user.avatarUrl}
                          alt={member.user.nickname || '用户'}
                          width={64}
                          height={64}
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <span className="text-xl">
                            {member.user.nickname?.[0] || '用'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-text-primary">
                        {member.user.nickname || '用户'}
                      </p>
                      <p className="text-xs text-text-secondary">
                        信用: {member.user.creditScore}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 图片预览 */}
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

