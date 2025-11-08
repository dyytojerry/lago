'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, MapPin, MessageCircle, User } from 'lucide-react';

function isActivePath(pathname: string, target: string) {
  if (target === '/') return pathname === '/';
  return pathname === target || pathname.startsWith(`${target}/`);
}

export function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [cityLabel, setCityLabel] = useState('同城');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = window.localStorage.getItem('selectedLocation');
      if (saved) {
        const parsed = JSON.parse(saved);
        const text = parsed?.city?.name || parsed?.cityName || parsed?.province?.name;
        if (text) {
          setCityLabel(text.replace(/市$/u, ''));
          return;
        }
      }
    } catch (error) {
      console.warn('Failed to read selected location:', error);
    }
    setCityLabel('同城');
  }, [pathname]);

  const goTo = (href: string) => {
    if (pathname === href) return;
    router.push(href);
  };

  const homeActive = isActivePath(pathname, '/');
  const cityActive = isActivePath(pathname, '/city');
  const fleaActive = isActivePath(pathname, '/flea-market');
  const messagesActive = isActivePath(pathname, '/messages');
  const profileActive = isActivePath(pathname, '/profile');

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex items-center justify-around h-[60px] px-4">
        <Link
          href="/"
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            homeActive ? 'text-primary' : 'text-gray-500'
          }`}
        >
          <Home className="w-6 h-6" />
          <span className={`text-xs mt-1 ${homeActive ? 'text-primary font-medium' : ''}`}>首页</span>
        </Link>

        <button
          type="button"
          onClick={() => goTo('/city')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            cityActive ? 'text-primary' : 'text-gray-500'
          }`}
        >
          <MapPin className="w-6 h-6" />
          <span className={`text-xs mt-1 ${cityActive ? 'text-primary font-medium' : ''}`}>
            {cityLabel || '同城'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => goTo('/flea-market')}
          className="flex flex-col items-center justify-end flex-1 h-full relative -top-2"
          aria-label="跳蚤市场"
        >
          <span
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-full border-2 shadow-md transition-all ${
              fleaActive
                ? 'border-primary bg-gradient-to-br from-primary to-primary/80 text-white'
                : 'border-transparent bg-gradient-to-br from-amber-400 to-orange-500 text-white'
            }`}
          >
            <span className="text-base font-semibold leading-none">跳蚤</span>
            <span className="text-[11px] tracking-wider leading-tight mt-1">市场</span>
          </span>
        </button>

        <Link
          href="/messages"
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            messagesActive ? 'text-primary' : 'text-gray-500'
          }`}
        >
          <MessageCircle className="w-6 h-6" />
          <span className={`text-xs mt-1 ${messagesActive ? 'text-primary font-medium' : ''}`}>消息</span>
        </Link>

        <Link
          href="/profile"
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            profileActive ? 'text-primary' : 'text-gray-500'
          }`}
        >
          <User className="w-6 h-6" />
          <span className={`text-xs mt-1 ${profileActive ? 'text-primary font-medium' : ''}`}>我的</span>
        </Link>
      </div>
    </nav>
  );
}

