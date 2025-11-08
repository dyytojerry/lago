'use client';

import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { EmptyState } from '@/components/EmptyState';
import { BottomNavigation } from '@/components/BottomNavigation';
import { useChatRooms } from '@/lib/apis/chat';
import { MessageCircle } from 'lucide-react';

export default function MessagesPage() {
  const router = useRouter();
  const { data, isLoading, error } = useChatRooms();
  const rooms = data?.data?.rooms || [];

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="消息" showBack={false} showNotification={false} />

      <main className="max-w-7xl mx-auto">
        {isLoading ? (
          <Loading text="加载中..." />
        ) : error ? (
          <EmptyState
            icon="message"
            title="加载失败"
            description="请稍后重试"
          />
        ) : rooms.length === 0 ? (
          <EmptyState
            icon="message"
            title="暂无消息"
            description="还没有聊天记录，快去联系卖家吧"
          />
        ) : (
          <div className="bg-white">
            {rooms.map((room: any) => {
              const otherUser = room.participants?.find(
                (p: any) => p.id !== room.currentUserId
              );
              const lastMessage = room.lastMessage;

              return (
                <div
                  key={room.id}
                  onClick={() => router.push(`/chat/${room.id}`)}
                  className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    {/* 头像 */}
                    <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                      {otherUser?.avatarUrl ? (
                        <img
                          src={otherUser.avatarUrl}
                          alt={otherUser.nickname || '用户'}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <span className="text-lg">
                            {otherUser?.nickname?.[0] || '用'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* 消息内容 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-text-primary truncate">
                          {otherUser?.nickname || '用户'}
                        </span>
                        {lastMessage?.createdAt && (
                          <span className="text-xs text-text-secondary flex-shrink-0 ml-2">
                            {new Date(lastMessage.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-text-secondary truncate flex-1">
                          {lastMessage?.content || '暂无消息'}
                        </p>
                        {room.unreadCount > 0 && (
                          <span className="ml-2 px-2 py-0.5 bg-accent text-white text-xs rounded-full flex-shrink-0">
                            {room.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
}

