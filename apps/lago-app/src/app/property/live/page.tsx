'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { EmptyState } from '@/components/EmptyState';
import { Video, Play, Plus, Calendar } from 'lucide-react';

export default function PropertyLivePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'live' | 'recorded'>('upcoming');

  // TODO: 实现直播活动数据API
  const liveEvents: any[] = [];

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header
        title="活动直播"
        showBack
        rightContent={
          <button
            onClick={() => router.push('/property/live/create')}
            className="p-2 text-primary hover:bg-gray-100 rounded-full transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        }
      />

      <main className="max-w-7xl mx-auto">
        {/* 标签切换 */}
        <div className="px-4 py-3 bg-white border-b border-gray-200">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm transition-colors ${
                activeTab === 'upcoming'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-text-primary'
              }`}
            >
              即将开始
            </button>
            <button
              onClick={() => setActiveTab('live')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm transition-colors ${
                activeTab === 'live'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-text-primary'
              }`}
            >
              直播中
            </button>
            <button
              onClick={() => setActiveTab('recorded')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm transition-colors ${
                activeTab === 'recorded'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-text-primary'
              }`}
            >
              历史回放
            </button>
          </div>
        </div>

        {/* 活动列表 */}
        {liveEvents.length === 0 ? (
          <EmptyState
            icon="package"
            title="暂无活动"
            description={`还没有${activeTab === 'upcoming' ? '即将开始' : activeTab === 'live' ? '正在直播' : '历史'}的活动`}
            action={
              activeTab === 'upcoming'
                ? {
                    label: '创建活动',
                    onClick: () => router.push('/property/live/create'),
                  }
                : undefined
            }
          />
        ) : (
          <div className="px-4 py-4 space-y-3">
            {liveEvents.map((event: any) => (
              <div
                key={event.id}
                onClick={() => router.push(`/property/live/${event.id}`)}
                className="bg-white rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Video className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-text-primary mb-1">
                      {event.title}
                    </h3>
                    <p className="text-sm text-text-secondary line-clamp-2 mb-2">
                      {event.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-text-secondary">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {new Date(event.startTime).toLocaleString()}
                        </span>
                      </div>
                      {event.viewCount !== undefined && (
                        <span>观看: {event.viewCount}</span>
                      )}
                    </div>
                  </div>
                  {activeTab === 'live' && (
                    <div className="flex-shrink-0">
                      <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full flex items-center gap-1">
                        <Play className="w-3 h-3" />
                        直播中
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

