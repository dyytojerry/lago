'use client';

import Link from 'next/link';
import { MapPin, Eye, Heart } from 'lucide-react';

export interface ProductCardProps {
  id: string;
  title: string;
  price: number | string;
  images: string[];
  location?: string;
  communityName?: string;
  viewCount?: number;
  likeCount?: number;
  type?: 'rent' | 'sell' | 'both';
  isVerified?: boolean;
}

export function ProductCard({
  id,
  title,
  price,
  images,
  location,
  communityName,
  viewCount = 0,
  likeCount = 0,
  type,
  isVerified = false,
}: ProductCardProps) {
  const imageUrl = images?.[0] || '/placeholder-product.jpg';
  const priceDisplay = typeof price === 'string' ? price : `¥${price}`;
  const typeLabel = type === 'rent' ? '租赁' : type === 'sell' ? '出售' : '租售';

  return (
    <Link href={`/products/${id}`} className="block">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden transition-shadow hover:shadow-md">
        {/* 商品图片 */}
        <div className="relative w-full h-48 bg-gray-100">
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" loading="lazy" />
          {isVerified && (
            <div className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded">
              认证
            </div>
          )}
          {type && (
            <div className="absolute top-2 left-2 bg-accent text-white text-xs px-2 py-1 rounded">
              {typeLabel}
            </div>
          )}
        </div>

        {/* 商品信息 */}
        <div className="p-3">
          <h3 className="text-base font-semibold text-text-primary line-clamp-2 mb-2">
            {title}
          </h3>

          {/* 价格 */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xl font-bold text-accent">{priceDisplay}</span>
            {type === 'rent' && (
              <span className="text-sm text-text-secondary">/天</span>
            )}
          </div>

          {/* 位置和统计 */}
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <div className="flex items-center gap-1">
              {communityName && (
                <>
                  <MapPin className="w-3 h-3" />
                  <span>{communityName}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-3">
              {viewCount > 0 && (
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{viewCount}</span>
                </div>
              )}
              {likeCount > 0 && (
                <div className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  <span>{likeCount}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

