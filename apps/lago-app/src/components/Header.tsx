'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, Bell, MapPin } from 'lucide-react';
import { useAuth } from '@lago/ui';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showSearch?: boolean;
  showNotification?: boolean;
  showCommunity?: boolean;
  onBack?: () => void;
  onSearch?: () => void;
  rightContent?: React.ReactNode;
}

export function Header({
  title,
  showBack = false,
  showSearch = false,
  showNotification = false,
  showCommunity = true,
  onBack,
  onSearch,
  rightContent,
}: HeaderProps) {
  const router = useRouter();
  const { user } = useAuth();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* 左侧 */}
          <div className="flex items-center gap-3 flex-1">
            {showBack && (
              <button
                onClick={handleBack}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-text-primary" />
              </button>
            )}
            {title ? (
              <h1 className="text-lg font-semibold text-text-primary">{title}</h1>
            ) : (
              <h1 className="text-xl font-bold text-primary">来购</h1>
            )}
            {showCommunity && user?.communityIds && user.communityIds.length > 0 && (
              <div className="flex items-center gap-1 text-sm text-text-secondary">
                <MapPin className="w-4 h-4" />
                <span>附近小区</span>
              </div>
            )}
          </div>

          {/* 右侧 */}
          <div className="flex items-center gap-2">
            {showSearch && (
              <button
                onClick={onSearch || (() => router.push('/search'))}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Search className="w-5 h-5 text-text-primary" />
              </button>
            )}
            {showNotification && (
              <button
                onClick={() => router.push('/messages')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
              >
                <Bell className="w-5 h-5 text-text-primary" />
                {/* 可以在这里添加未读消息红点 */}
              </button>
            )}
            {rightContent}
          </div>
        </div>
      </div>
    </header>
  );
}

