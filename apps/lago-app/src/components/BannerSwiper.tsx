'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { OptimizedMedia } from '@lago/ui';

interface Banner {
  id: string;
  image: string;
  title?: string;
  link?: string;
}

interface BannerSwiperProps {
  banners: Banner[];
  autoPlay?: boolean;
  interval?: number;
  onBannerClick?: (banner: Banner) => void;
}

export function BannerSwiper({
  banners,
  autoPlay = true,
  interval = 3000,
  onBannerClick,
}: BannerSwiperProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!autoPlay || banners.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, banners.length]);

  if (banners.length === 0) {
    return null;
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const handleBannerClick = () => {
    const banner = banners[currentIndex];
    if (onBannerClick && banner) {
      onBannerClick(banner);
    } else if (banner?.link) {
      window.location.href = banner.link;
    }
  };

  return (
    <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100">
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-500 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <OptimizedMedia
            src={banner.image}
            originalSrc={banner.image}
            type="image"
            alt={banner.title || 'Banner'}
            fit="cover"
            className="w-full h-full"
            mediaClassName="cursor-pointer"
            onClick={handleBannerClick}
          />
          {banner.title && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
              <p className="text-white font-medium">{banner.title}</p>
            </div>
          )}
        </div>
      ))}

      {/* 指示器 */}
      {banners.length > 1 && (
        <>
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* 左右箭头 */}
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 p-1 bg-black/30 hover:bg-black/50 rounded-full text-white transition-colors"
            aria-label="Previous banner"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 bg-black/30 hover:bg-black/50 rounded-full text-white transition-colors"
            aria-label="Next banner"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  );
}

