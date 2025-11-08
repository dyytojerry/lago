'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Loading } from '@/components/Loading';
import { EmptyState } from '@/components/EmptyState';
import { communities, CommunitiesPathParams } from '@/lib/apis';
import { ArrowLeft, Calendar, Users, MapPin, Video } from 'lucide-react';

interface CommunityActivity {
  id: string;
  title: string;
  description?: string;
  images: string[];
  startTime?: string;
  endTime?: string;
  location?: string;
  status: string;
  streamUrl?: string | null;
}

interface CommunityResponse {
  community: {
    id: string;
    name: string;
    address?: string;
    images: string[];
    activities: CommunityActivity[];
  };
}

export default function FleaMarketLivePage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const activityId = params.id;
  const communityId = searchParams.get('community');

  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState<CommunityActivity | null>(null);
  const [communityName, setCommunityName] = useState('');
  const [coverImage, setCoverImage] = useState<string | null>(null);

  useEffect(() => {
    async function loadActivity() {
      if (!communityId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await communities(
          { id: communityId } as CommunitiesPathParams,
          true
        );

        if (response.success && response.data?.community) {
          const community = response.data.community;
          setCommunityName(community.name);
          setCoverImage(community.images?.[0] || null);
          const found = community.activities.find((item) => item.id === activityId);
          setActivity(found || null);
        } else {
          setActivity(null);
        }
      } catch (error) {
        console.error('加载直播活动失败:', error);
        setActivity(null);
      } finally {
        setLoading(false);
      }
    }

    loadActivity();
  }, [activityId, communityId]);

  const isLive = useMemo(() => {
    if (!activity?.startTime) return false;
    const now = Date.now();
    const start = new Date(activity.startTime).getTime();
    const end = activity.endTime ? new Date(activity.endTime).getTime() : start + 2 * 60 * 60 * 1000;
    return now >= start && now <= end && activity.status === 'published';
  }, [activity?.startTime, activity?.endTime, activity?.status]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loading text="直播间准备中" />
      </div>
    );
  }

  if (!communityId || !activity) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-6">
          <EmptyState
            icon="video"
            title="直播间尚未开启"
            description="返回跳蚤市场看看其他地摊活动"
            action={{ label: '回到跳蚤市场', onClick: () => router.push('/flea-market') }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-20">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-white/90"
        >
          <ArrowLeft className="w-4 h-4" />
          返回
        </button>
        <span className="text-xs text-white/70">由 {communityName} 发起</span>
      </header>

      <section className="relative h-[60vh] bg-black">
        {activity.streamUrl ? (
          <iframe
            src={activity.streamUrl}
            title={activity.title}
            className="w-full h-full"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        ) : coverImage ? (
          <img src={coverImage} alt={activity.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-white/80">
            <Video className="w-10 h-10" />
            <span>直播设备尚未接入</span>
          </div>
        )}

        {isLive && (
          <div className="absolute top-4 right-4 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-500 text-white text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
            </span>
            直播中
          </div>
        )}
      </section>

      <main className="bg-white text-text-primary rounded-t-3xl -mt-10 relative z-10 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs bg-primary/10 text-primary">地摊直播</span>
          <h1 className="text-xl font-semibold line-clamp-2">{activity.title}</h1>
        </div>

        {activity.description && (
          <p className="text-sm leading-6 text-text-secondary whitespace-pre-wrap">{activity.description}</p>
        )}

        <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
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
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{activity.location || '活动地点待公布'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{communityName}</span>
          </div>
        </div>
      </main>
    </div>
  );
}

