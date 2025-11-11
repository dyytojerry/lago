'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Loading } from '@/components/Loading';
import { EmptyState } from '@/components/EmptyState';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  MessageCircle,
  Share2,
  Users,
} from 'lucide-react';
import { communities, CommunitiesPathParams } from '@/lib/apis';
import toast from 'react-hot-toast';

interface CommunityDynamic {
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
    images: string[];
    address?: string;
    activities: CommunityDynamic[];
    members: Array<{
      id: string;
      user: {
        id: string;
        nickname?: string;
      };
    }>;
  };
}

interface DynamicComment {
  id: string;
  author: {
    id: string;
    nickname: string;
    avatarUrl?: string;
  };
  content: string;
  createdAt: string;
}

export default function CommunityDynamicDetailPage() {
  const router = useRouter();
  const params = useParams();
  const communityId = params.id as string;
  const dynamicId = params.dynamicId as string;

  const [community, setCommunity] = useState<CommunityResponse['community'] | null>(null);
  const [dynamic, setDynamic] = useState<CommunityDynamic | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments] = useState<DynamicComment[]>([]);

  useEffect(() => {
    async function loadDynamic() {
      try {
        setLoading(true);
        const response = await communities({ id: communityId } as CommunitiesPathParams, true);
        const data = response.data as CommunityResponse | undefined;
        if (response.success && data?.community) {
          setCommunity(data.community);
          const found = data.community.activities.find((item) => item.id === dynamicId);
          setDynamic(found || null);
        } else {
          setCommunity(null);
          setDynamic(null);
        }
      } catch (error) {
        console.error('加载社区动态详情失败:', error);
        setCommunity(null);
        setDynamic(null);
      } finally {
        setLoading(false);
      }
    }

    loadDynamic();
  }, [communityId, dynamicId]);

  const bannerImage = useMemo(() => {
    if (dynamic?.images?.length) return dynamic.images[0];
    if (community?.images?.length) return community.images[0];
    return null;
  }, [dynamic?.images, community?.images]);

  const formattedTime = useMemo(() => {
    if (!dynamic?.startTime) return '时间待定';
    return new Date(dynamic.startTime).toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [dynamic?.startTime]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center pt-24">
          <Loading text="加载社区动态详情..." />
        </div>
      </div>
    );
  }

  if (!community || !dynamic) {
    return (
      <div className="min-h-screen bg-background">
        <EmptyState
          icon="calendar"
          title="动态不存在"
          description="可能已被删除或设置为隐私"
          action={{
            label: '返回小区',
            onClick: () => router.push(`/communities/${communityId}`),
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="返回"
          >
            <ArrowLeft className="w-5 h-5 text-text-primary" />
          </button>
          <h1 className="text-base font-semibold text-text-primary line-clamp-1 flex-1 text-center">
            {dynamic.title}
          </h1>
          <button
            onClick={() => navigator.share?.({ title: dynamic.title })}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="分享"
          >
            <Share2 className="w-5 h-5 text-text-primary" />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto pt-20 pb-16 px-4 space-y-8">
        <section className="relative h-60 rounded-3xl overflow-hidden bg-gray-200">
          {bannerImage ? (
            <img
              src={bannerImage}
              alt={dynamic.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Calendar className="w-10 h-10" />
            </div>
          )}
        </section>

        <section className="bg-white rounded-3xl shadow-sm p-6 space-y-4">
          <div className="flex flex-col gap-3">
            <span className="inline-flex items-center gap-2 text-xs text-primary px-3 py-1 bg-primary/10 rounded-full self-start">
              {dynamic.type === 'announcement'
                ? '公告'
                : dynamic.type === 'market'
                ? '集市'
                : dynamic.type === 'festival'
                ? '节庆'
                : dynamic.type === 'event'
                ? '活动'
                : '动态'}
            </span>
            <h2 className="text-2xl font-semibold text-text-primary">{dynamic.title}</h2>
            <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formattedTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{dynamic.location || community.address || '位置待定'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>来自 {community.name}</span>
              </div>
            </div>
          </div>

          {dynamic.images?.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {dynamic.images.map((image, index) => (
                <img
                  key={`${dynamic.id}-image-${index}`}
                  src={image}
                  alt={`${dynamic.title}-${index}`}
                  className="w-full h-40 object-cover rounded-2xl"
                  loading="lazy"
                />
              ))}
            </div>
          )}

          {dynamic.description && (
            <p className="text-sm text-text-secondary leading-6 whitespace-pre-wrap">
              {dynamic.description}
            </p>
          )}
        </section>

        <section className="bg-white rounded-3xl shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-text-primary">互动评论</h3>
            <button
              type="button"
              className="inline-flex items-center gap-1 text-xs text-primary px-3 py-1 rounded-full bg-primary/10"
              onClick={() => toast.info('评论功能即将上线，敬请期待')}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              即将上线
            </button>
          </div>

          {comments.length === 0 ? (
            <EmptyState
              icon="message"
              title="暂无评论"
              description="发布动态后，与社区成员交流互动"
            />
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="p-4 rounded-2xl bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-text-primary">
                      {comment.author.nickname}
                    </div>
                    <div className="text-xs text-text-tertiary">
                      {new Date(comment.createdAt).toLocaleString('zh-CN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                  <p className="text-sm text-text-secondary">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
