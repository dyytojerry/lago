'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { EmptyState } from '@/components/EmptyState';
import { BottomNavigation } from '@/components/BottomNavigation';
import { useCommunitieNearby } from '@/lib/apis/communities';
import { MapPin, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SelectCommunityPage() {
  const router = useRouter();
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);

  const { data, isLoading, error } = useCommunitieNearby();
  const communities = data?.data?.communities || [];

  const handleJoin = async (communityId: string) => {
    // TODO: 实现加入小区的API调用
    toast.success('已加入小区');
    router.back();
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="选择小区" showBack />

      <main className="max-w-7xl mx-auto px-4 py-4">
        {isLoading ? (
          <Loading text="加载中..." />
        ) : error ? (
          <EmptyState
            icon="package"
            title="加载失败"
            description="请稍后重试"
          />
        ) : communities.length === 0 ? (
          <EmptyState
            icon="package"
            title="暂无小区"
            description="附近还没有可加入的小区"
          />
        ) : (
          <div className="space-y-3">
            {communities.map((community: any) => (
              <div
                key={community.id}
                className="bg-white rounded-lg p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-text-primary">
                        {community.name}
                      </h3>
                    </div>
                    {community.location && (
                      <div className="flex items-center gap-1 text-sm text-text-secondary">
                        <MapPin className="w-4 h-4" />
                        <span>{community.location}</span>
                      </div>
                    )}
                    {community.address && (
                      <p className="text-xs text-text-secondary mt-1">
                        {community.address}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleJoin(community.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCommunityId === community.id
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-text-primary hover:bg-gray-200'
                    }`}
                  >
                    {selectedCommunityId === community.id ? (
                      <span className="flex items-center gap-1">
                        <Check className="w-4 h-4" />
                        已加入
                      </span>
                    ) : (
                      '加入'
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
}

