'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { EmptyState } from '@/components/EmptyState';
import { useChatRoomDetail, useChatRoomsMessages, useChatRoomsMessage } from '@/lib/apis/chat';
import { Send, Image as ImageIcon, Package } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.id as string;
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: roomData, isLoading: roomLoading } = useChatRoomDetail({ id: roomId });
  const { data: messagesData, isLoading: messagesLoading } = useChatRoomsMessages(
    { id: roomId },
    { page: '1', limit: '50' }
  );

  const room = roomData?.data?.room;
  const messages = messagesData?.data?.messages || [];
  const otherUser = room?.participants?.find((p: any) => p.id !== room?.currentUserId);

  const sendMessageMutation = useChatRoomsMessage({ id: roomId });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      await sendMessageMutation.mutateAsync({
        content: message.trim(),
        type: 'text',
      });
      setMessage('');
    } catch (error: any) {
      toast.error(error.message || '发送失败');
    }
  };

  if (roomLoading || messagesLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          title={otherUser?.nickname || '聊天'}
          showBack
          onBack={() => router.push('/messages')}
        />
        <Loading text="加载中..." />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="聊天" showBack onBack={() => router.push('/messages')} />
        <EmptyState
          icon="message"
          title="聊天室不存在"
          description="该聊天室可能已被删除"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header
        title={otherUser?.nickname || '聊天'}
        showBack
        onBack={() => router.push('/messages')}
      />

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg: any) => {
          const isOwn = msg.senderId === room.currentUserId;

          return (
            <div
              key={msg.id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-3 py-2 ${
                  isOwn
                    ? 'bg-primary text-white'
                    : 'bg-white text-text-primary border border-gray-200'
                }`}
              >
                {msg.type === 'text' && <p className="text-sm whitespace-pre-wrap">{msg.content}</p>}
                {msg.type === 'image' && msg.fileUrl && (
                  <img
                    src={msg.fileUrl}
                    alt="消息图片"
                    className="max-w-[200px] rounded"
                    loading="lazy"
                  />
                )}
                {msg.type === 'product_card' && msg.productId && (
                  <div className="bg-white/10 rounded p-2">
                    <Package className="w-4 h-4 inline mr-1" />
                    <span className="text-sm">商品卡片</span>
                  </div>
                )}
                <p className="text-xs mt-1 opacity-70">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入框 */}
      <form
        onSubmit={handleSendMessage}
        className="bg-white border-t border-gray-200 px-4 py-3 pb-safe"
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="p-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="输入消息..."
            className="flex-1 px-4 py-2 bg-container rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={!message.trim() || sendMessageMutation.isPending}
            className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}

