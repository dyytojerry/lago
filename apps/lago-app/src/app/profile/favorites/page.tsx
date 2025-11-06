'use client';

import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { EmptyState } from '@/components/EmptyState';
import { BottomNavigation } from '@/components/BottomNavigation';
import { ProductCard } from '@/components/ProductCard';
import { useProducts } from '@/lib/apis/products';
import { Heart } from 'lucide-react';

export default function FavoritesPage() {
  const router = useRouter();

  // TODO: 需要后端提供获取收藏商品的接口
  // 暂时使用空列表
  const favorites: any[] = [];

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="我的收藏" showBack />

      <main className="max-w-7xl mx-auto px-4 py-4">
        {favorites.length === 0 ? (
          <EmptyState
            icon="package"
            title="暂无收藏"
            description="还没有收藏任何商品"
            action={{
              label: '去逛逛',
              onClick: () => router.push('/'),
            }}
          />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {favorites.map((product: any) => (
              <ProductCard
                key={product.id}
                id={product.id}
                title={product.title}
                price={product.price}
                images={product.images}
                location={product.location}
                communityName={product.community?.name}
                viewCount={product.viewCount}
                likeCount={product.likeCount}
                type={product.type}
                isVerified={product.isVerified}
              />
            ))}
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
}

