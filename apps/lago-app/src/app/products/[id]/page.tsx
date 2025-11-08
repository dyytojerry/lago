'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { EmptyState } from '@/components/EmptyState';
import { useProductDetail, useProductLike, useProductUnlike } from '@/lib/apis/products';
import { useChatRoom } from '@/lib/apis/chat';
import { useOrderCreate } from '@/lib/apis/orders';
import { Heart, MessageCircle, ShoppingCart, MapPin, Shield, Eye, Calendar, Package } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const { data, isLoading, error } = useProductDetail({ id: productId });
  const product = data?.data?.product;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const likeMutation = useProductLike({ id: productId });
  const unlikeMutation = useProductUnlike({ id: productId });
  const createChatRoomMutation = useChatRoom();
  const createOrderMutation = useOrderCreate();

  const handleLike = async () => {
    try {
      if (isLiked) {
        await unlikeMutation.mutateAsync(null);
        setIsLiked(false);
        toast.success('已取消收藏');
      } else {
        await likeMutation.mutateAsync(null);
        setIsLiked(true);
        toast.success('已收藏');
      }
    } catch (error: any) {
      toast.error(error.message || '操作失败');
    }
  };

  const handleChat = async () => {
    if (!product?.owner?.id) return;

    try {
      const result = await createChatRoomMutation.mutateAsync({
        otherUserId: product.owner.id,
        productId: productId,
      });
      if (result.data?.room?.id) {
        router.push(`/chat/${result.data.room.id}`);
      }
    } catch (error: any) {
      toast.error(error.message || '创建聊天失败');
    }
  };

  const handleOrder = () => {
    router.push(`/orders/create?productId=${productId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="商品详情" showBack />
        <Loading text="加载中..." />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="商品详情" showBack />
        <EmptyState
          icon="package"
          title="商品不存在"
          description="该商品可能已下架或删除"
          action={{
            label: '返回首页',
            onClick: () => router.push('/'),
          }}
        />
      </div>
    );
  }

  const images = product.images || [];
  const priceDisplay = typeof product.price === 'string' ? product.price : `¥${product.price}`;
  const typeLabel = product.type === 'rent' ? '租赁' : product.type === 'sell' ? '出售' : '租售';

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="商品详情" showBack />

      <main className="max-w-7xl mx-auto">
        {/* 商品图片轮播 */}
        <div className="relative w-full h-80 bg-gray-100">
          {images.length > 0 ? (
            <>
              <img
                src={images[currentImageIndex]}
                alt={product.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {images.length > 1 && (
                <>
                  <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                  {currentImageIndex > 0 && (
                    <button
                      onClick={() => setCurrentImageIndex(currentImageIndex - 1)}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 bg-black/30 rounded-full text-white"
                    >
                      ←
                    </button>
                  )}
                  {currentImageIndex < images.length - 1 && (
                    <button
                      onClick={() => setCurrentImageIndex(currentImageIndex + 1)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-black/30 rounded-full text-white"
                    >
                      →
                    </button>
                  )}
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Package className="w-16 h-16" />
            </div>
          )}
        </div>

        {/* 商品信息 */}
        <div className="bg-white px-4 py-4 mb-2">
          <div className="flex items-start justify-between mb-2">
            <h1 className="text-xl font-bold text-text-primary flex-1">{product.title}</h1>
            {product.isVerified && (
              <div className="flex items-center gap-1 text-primary text-sm">
                <Shield className="w-4 h-4" />
                <span>认证</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl font-bold text-accent">{priceDisplay}</span>
            {product.type === 'rent' && (
              <>
                <span className="text-sm text-text-secondary">/天</span>
                {product.deposit && (
                  <span className="text-sm text-text-secondary">
                    押金: ¥{product.deposit}
                  </span>
                )}
              </>
            )}
            <span className="ml-auto px-2 py-1 bg-accent/10 text-accent text-xs rounded">
              {typeLabel}
            </span>
          </div>

          {/* 商品描述 */}
          {product.description && (
            <p className="text-sm text-text-secondary mb-3 whitespace-pre-wrap">
              {product.description}
            </p>
          )}

          {/* 商品属性 */}
          <div className="space-y-2 text-sm">
            {product.category && (
              <div className="flex items-center gap-2 text-text-secondary">
                <Package className="w-4 h-4" />
                <span>分类: {product.category === 'toys' ? '玩具' : '游戏机'}</span>
              </div>
            )}
            {product.location && (
              <div className="flex items-center gap-2 text-text-secondary">
                <MapPin className="w-4 h-4" />
                <span>{product.location}</span>
              </div>
            )}
            {product.community?.name && (
              <div className="flex items-center gap-2 text-text-secondary">
                <MapPin className="w-4 h-4" />
                <span>小区: {product.community.name}</span>
              </div>
            )}
            <div className="flex items-center gap-4 text-text-secondary">
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{product.viewCount || 0} 次浏览</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                <span>{product.likeCount || 0} 人收藏</span>
              </div>
            </div>
          </div>
        </div>

        {/* 卖家信息 */}
        {product.owner && (
          <div className="bg-white px-4 py-3 mb-2">
            <h2 className="text-base font-semibold text-text-primary mb-3">卖家信息</h2>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                {product.owner.avatarUrl ? (
                  <img
                    src={product.owner.avatarUrl}
                    alt={product.owner.nickname || '卖家'}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="text-lg">
                      {product.owner.nickname?.[0] || '用'}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-text-primary">
                    {product.owner.nickname || '用户'}
                  </span>
                  {product.owner.isVerified && (
                    <Shield className="w-4 h-4 text-primary" />
                  )}
                </div>
                <div className="text-sm text-text-secondary">
                  信用积分: {product.owner.creditScore || 0}
                </div>
              </div>
              <button
                onClick={() => router.push(`/users/${product.owner.id}`)}
                className="text-sm text-primary"
              >
                查看主页
              </button>
            </div>
          </div>
        )}

        {/* 底部操作栏 */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 pb-safe">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
            <button
              onClick={handleLike}
              className={`p-3 rounded-lg transition-colors ${
                isLiked ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-text-secondary'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleChat}
              className="flex-1 px-4 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              <span>联系卖家</span>
            </button>
            <button
              onClick={handleOrder}
              className="flex-1 px-4 py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>{product.type === 'rent' ? '立即租赁' : '立即购买'}</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

