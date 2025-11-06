'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, Search, Plus, MessageCircle, User } from 'lucide-react';

export function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { href: '/', label: '首页', icon: Home },
    { href: '/search', label: '搜索', icon: Search },
    { href: '/publish', label: '发布', icon: Plus },
    { href: '/messages', label: '消息', icon: MessageCircle },
    { href: '/profile', label: '我的', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center h-16 px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive ? 'text-primary' : 'text-gray-500'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'text-primary' : ''}`} />
              <span className={`text-xs mt-1 ${isActive ? 'text-primary font-medium' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

