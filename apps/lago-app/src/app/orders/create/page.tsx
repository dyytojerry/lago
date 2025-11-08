'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { EmptyState } from '@/components/EmptyState';
import { useProductDetail } from '@/lib/apis/products';
import { useOrderCreate } from '@/lib/apis/orders';
import { Calendar, MapPin, Package, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CreateOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId');

  const [formData, setFormData] = useState({
    type: 'rent' as 'rent' | 'sell',
    startDate: '',
    endDate: '',
    deliveryType: 'self_pickup' as 'self_pickup' | 'delivery' | 'cabinet',
    deliveryAddress: '',
    remark: '',
  });

  const { data, isLoading } = useProductDetail(
    { id: productId || '' },
    { enabled: !!productId }
  );
  const product = data?.data?.product;

  const createOrderMutation = useOrderCreate({
    onSuccess: (result) => {
      toast.success('订单创建成功');
      if (result.data?.order?.id) {
        router.push(`/orders/${result.data.order.id}`);
      }
    },
    onError: (error: any) => {
      toast.error(error.message || '创建订单失败');
    },
  });

  useEffect(() => {
    if (product?.type) {
      if (product.type === 'rent' || product.type === 'both') {
        setFormData((prev) => ({ ...prev, type: 'rent' }));
      } else {
        setFormData((prev) => ({ ...prev, type: 'sell' }));
      }
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productId) {
      toast.error('商品ID缺失');
      return;
    }

    if (formData.type === 'rent' && (!formData.startDate || !formData.endDate)) {
      toast.error('请选择租赁日期');
      return;
    }

    try {
      await createOrderMutation.mutateAsync({
        productId,
        type: formData.type,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        deliveryType: formData.deliveryType,
        deliveryAddress: formData.deliveryAddress || undefined,
        remark: formData.remark || undefined,
      });
    } catch (error) {
      // Error handled in onError
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="创建订单" showBack />
        <Loading text="加载中..." />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="创建订单" showBack />
        <EmptyState
          icon="shopping"
          title="商品不存在"
          description="该商品可能已下架"
          action={{
            label: '返回',
            onClick: () => router.back(),
          }}
        />
      </div>
    );
  }

  const priceDisplay = typeof product.price === 'string' ? product.price : `¥${product.price}`;
  const totalAmount = formData.type === 'rent' && formData.startDate && formData.endDate
    ? (() => {
        const days = Math.ceil(
          (new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) /
            (1000 * 60 * 60 * 24)
        );
        return days * parseFloat(priceDisplay.replace('¥', ''));
      })()
    : parseFloat(priceDisplay.replace('¥', ''));

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="创建订单" showBack />

      <main className="max-w-7xl mx-auto px-4 py-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 商品信息 */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h2 className="text-base font-semibold text-text-primary mb-3">商品信息</h2>
            <div className="flex gap-3">
              {product.images?.[0] && (
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-text-primary line-clamp-2 mb-1">
                  {product.title}
                </h3>
                <div className="text-lg font-bold text-accent">{priceDisplay}</div>
              </div>
            </div>
          </div>

          {/* 交易类型 */}
          {(product.type === 'rent' || product.type === 'both') && (
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <label className="block text-sm font-medium text-text-primary mb-2">
                交易类型
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'rent' })}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm transition-colors ${
                    formData.type === 'rent'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-text-primary'
                  }`}
                >
                  租赁
                </button>
                {product.type === 'both' && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'sell' })}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm transition-colors ${
                      formData.type === 'sell'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-text-primary'
                    }`}
                  >
                    购买
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 租赁日期 */}
          {formData.type === 'rent' && (
            <div className="bg-white rounded-lg p-4 shadow-sm space-y-3">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  开始日期 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 bg-container rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  结束日期 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  min={formData.startDate || new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 bg-container rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>
          )}

          {/* 配送方式 */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <label className="block text-sm font-medium text-text-primary mb-2">
              配送方式 <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="deliveryType"
                  value="self_pickup"
                  checked={formData.deliveryType === 'self_pickup'}
                  onChange={(e) =>
                    setFormData({ ...formData, deliveryType: e.target.value as any })
                  }
                  className="text-primary"
                />
                <span className="flex-1 text-sm text-text-primary">自提</span>
              </label>
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="deliveryType"
                  value="delivery"
                  checked={formData.deliveryType === 'delivery'}
                  onChange={(e) =>
                    setFormData({ ...formData, deliveryType: e.target.value as any })
                  }
                  className="text-primary"
                />
                <span className="flex-1 text-sm text-text-primary">配送</span>
              </label>
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="deliveryType"
                  value="cabinet"
                  checked={formData.deliveryType === 'cabinet'}
                  onChange={(e) =>
                    setFormData({ ...formData, deliveryType: e.target.value as any })
                  }
                  className="text-primary"
                />
                <span className="flex-1 text-sm text-text-primary">智能柜</span>
              </label>
            </div>
          </div>

          {/* 配送地址 */}
          {formData.deliveryType !== 'self_pickup' && (
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <label className="block text-sm font-medium text-text-primary mb-2">
                配送地址
              </label>
              <input
                type="text"
                value={formData.deliveryAddress}
                onChange={(e) =>
                  setFormData({ ...formData, deliveryAddress: e.target.value })
                }
                placeholder="请输入配送地址"
                className="w-full px-4 py-2 bg-container rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}

          {/* 备注 */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <label className="block text-sm font-medium text-text-primary mb-2">
              备注
            </label>
            <textarea
              value={formData.remark}
              onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
              placeholder="请输入备注信息（可选）"
              rows={3}
              className="w-full px-4 py-2 bg-container rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* 费用明细 */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h2 className="text-base font-semibold text-text-primary mb-3">费用明细</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-text-secondary">
                <span>商品价格</span>
                <span>{priceDisplay}</span>
              </div>
              {formData.type === 'rent' && formData.startDate && formData.endDate && (
                <div className="flex justify-between text-text-secondary">
                  <span>租赁天数</span>
                  <span>
                    {Math.ceil(
                      (new Date(formData.endDate).getTime() -
                        new Date(formData.startDate).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}{' '}
                    天
                  </span>
                </div>
              )}
              {product.deposit && formData.type === 'rent' && (
                <div className="flex justify-between text-text-secondary">
                  <span>押金</span>
                  <span>¥{product.deposit}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-text-primary pt-2 border-t border-gray-200">
                <span>总计</span>
                <span className="text-accent">¥{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* 提交按钮 */}
          <button
            type="submit"
            disabled={createOrderMutation.isPending}
            className="w-full px-4 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createOrderMutation.isPending ? '创建中...' : '确认下单'}
          </button>
        </form>
      </main>
    </div>
  );
}

