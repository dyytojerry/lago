'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { apiRequest } from '@lago/common';
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
    images: string[];
    address?: string;
    activities: CommunityActivity[];
    members: Array<{
      id: string;
      user: {
        id: string;
        nickname?: string;
      };
    }>;
  };
}

interface ActivityComment {
  id: string;
  author: {
    id: string;
    nickname: string;
    avatarUrl?: string;
  };
  content: string;
  createdAt: string;
}

export default function ActivityDetailPage() {
  const router = useRouter();
  const params = useParams();
  const communityId = params.id as string;
  const activityId = params.activityId as string;

  const [community, setCommunity] = useState<CommunityResponse['community'] | null>(null);
  const [activity, setActivity] = useState<CommunityActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments] = useState<ActivityComment[]>([]);

  useEffect(() => {
    async function loadActivity() {
      try {
        setLoading(true);
        const response = await apiRequest<CommunityResponse>(`/api/communities/${communityId}`, {
          method: 'GET',
          noAuthorize: true,
        });
        if (response.success && response.data?.community) {
          setCommunity(response.data.community);
          const found = response.data.community.activities.find((item) => item.id === activityId);
          setActivity(found || null);
        } else {
          setCommunity(null);
          setActivity(null);
        }
      } catch (error) {
        console.error('加载活动详情失败:', error);
        setCommunity(null);
        setActivity(null);
      } finally {
        setLoading(false);
      }
    }

    loadActivity();
  }, [communityId, activityId]);

  const bannerImage = useMemo(() => {
    if (activity?.images?.length) return activity.images[0];
    if (community?.images?.length) return community.images[0];
    return null;
  }, [activity?.images, community?.images]);

  const formattedTime = useMemo(() => {
    if (!activity?.startTime) return '时间待定';
    return new Date(activity.startTime).toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [activity?.startTime]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center pt-24">
          <Loading text="加载活动详情..." />
        </div>
      </div>
    );
  }

  if (!community || !activity) {
    return (
      <div className="min-h-screen bg-background">
        <EmptyState
          icon="calendar"
          title="活动不存在"
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
            {activity.title}
          </h1>
          <button
            onClick={() => navigator.share?.({ title: activity.title })}
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
            <Image src={bannerImage} alt={activity.title} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Calendar className="w-10 h-10" />
            </div>
          )}
        </section>

        <section className="bg-white rounded-3xl shadow-sm p-6 space-y-4">
          <div className="flex flex-col gap-3">
            <span className="inline-flex items-center gap-2 text-xs text-primary px-3 py-1 bg-primary/10 rounded-full self-start">
              {activity.type === 'announcement'
                ? '公告'
                : activity.type === 'market'
                ? '集市'
                : activity.type === 'festival'
                ? '节庆'
                : '活动'}
            </span>
            <h2 className="text-2xl font-semibold text-text-primary">{activity.title}</h2>
            <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formattedTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{activity.location || community.address || '位置待定'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>来自 {community.name}</span>
              </div>
            </div>
          </div>

          {activity.description && (
            <div className="pt-2 border-t border-gray-100">
              <h3 className="text-base font-semibold text-text-primary mb-2">活动简介</h3>
              <p className="text-sm leading-6 text-text-secondary whitespace-pre-wrap">
                {activity.description}
              </p>
            </div>
          )}
        </section>

        <section className="bg-white rounded-3xl shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-text-primary">活动评论</h3>
            <button
              onClick={() => router.push('/login')}
              className="flex items-center gap-1 text-sm text-primary"
            >
              <MessageCircle className="w-4 h-4" />
              我要评论
            </button>
          </div>

          {comments.length === 0 ? (
            <div className="bg-gray-50 rounded-2xl p-8 text-center text-sm text-text-secondary">
              暂无评论，快来抢占沙发吧～
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="border border-gray-100 rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
                      {comment.author.avatarUrl ? (
                        <Image
                          src={comment.author.avatarUrl}
                          alt={comment.author.nickname}
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          {comment.author.nickname[0]}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        {comment.author.nickname}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {new Date(comment.createdAt).toLocaleString('zh-CN')}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-text-secondary leading-6 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
