'use client';

import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { EmptyState } from '@/components/EmptyState';
import { useOrderDetail, useOrderStatu, useOrderCancel } from '@/lib/apis/orders';
import { Package, MapPin, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const statusMap: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: '待支付', color: 'text-orange-500', icon: Clock },
  paid: { label: '已支付', color: 'text-blue-500', icon: CheckCircle },
  confirmed: { label: '已确认', color: 'text-green-500', icon: CheckCircle },
  completed: { label: '已完成', color: 'text-green-600', icon: CheckCircle },
  cancelled: { label: '已取消', color: 'text-gray-500', icon: XCircle },
  refunded: { label: '已退款', color: 'text-red-500', icon: XCircle },
};

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const { data, isLoading, error } = useOrderDetail({ id: orderId });
  const order = data?.data?.order;

  const updateStatusMutation = useOrderStatu({ id: orderId });
  const cancelMutation = useOrderCancel({ id: orderId });

  const handleUpdateStatus = async (status: 'paid' | 'confirmed' | 'completed' | 'cancelled') => {
    try {
      await updateStatusMutation.mutateAsync({ status });
      toast.success('订单状态已更新');
    } catch (error: any) {
      toast.error(error.message || '操作失败');
    }
  };

  const handleCancel = async () => {
    if (!confirm('确定要取消订单吗？')) return;

    try {
      await cancelMutation.mutateAsync(null);
      toast.success('订单已取消');
    } catch (error: any) {
      toast.error(error.message || '取消失败');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="订单详情" showBack />
        <Loading text="加载中..." />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="订单详情" showBack />
        <EmptyState
          icon="shopping"
          title="订单不存在"
          description="该订单可能已被删除"
          action={{
            label: '返回',
            onClick: () => router.back(),
          }}
        />
      </div>
    );
  }

  const statusInfo = statusMap[order.status] || statusMap.pending;
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="订单详情" showBack />

      <main className="max-w-7xl mx-auto px-4 py-4 space-y-4">
        {/* 订单状态 */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-secondary">订单状态</span>
            <div className={`flex items-center gap-2 ${statusInfo.color}`}>
              <StatusIcon className="w-5 h-5" />
              <span className="font-medium">{statusInfo.label}</span>
            </div>
          </div>
          <div className="text-xs text-text-secondary">
            订单号: {order.id}
          </div>
        </div>

        {/* 商品信息 */}
        {order.product && (
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h2 className="text-base font-semibold text-text-primary mb-3">商品信息</h2>
            <div className="flex gap-3">
              {order.product.images?.[0] && (
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <Image
                    src={order.product.images[0]}
                    alt={order.product.title}
                    width={80}
                    height={80}
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-text-primary line-clamp-2 mb-1">
                  {order.product.title}
                </h3>
                <div className="text-lg font-bold text-accent">¥{order.amount}</div>
              </div>
            </div>
          </div>
        )}

        {/* 订单信息 */}
        <div className="bg-white rounded-lg p-4 shadow-sm space-y-3">
          <h2 className="text-base font-semibold text-text-primary mb-3">订单信息</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">订单类型</span>
              <span className="text-text-primary">
                {order.type === 'rent' ? '租赁' : '购买'}
              </span>
            </div>
            {order.startDate && (
              <div className="flex justify-between">
                <span className="text-text-secondary">开始日期</span>
                <span className="text-text-primary">
                  {new Date(order.startDate).toLocaleDateString()}
                </span>
              </div>
            )}
            {order.endDate && (
              <div className="flex justify-between">
                <span className="text-text-secondary">结束日期</span>
                <span className="text-text-primary">
                  {new Date(order.endDate).toLocaleDateString()}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-text-secondary">配送方式</span>
              <span className="text-text-primary">
                {order.deliveryType === 'self_pickup'
                  ? '自提'
                  : order.deliveryType === 'delivery'
                  ? '配送'
                  : '智能柜'}
              </span>
            </div>
            {order.deliveryAddress && (
              <div className="flex justify-between">
                <span className="text-text-secondary">配送地址</span>
                <span className="text-text-primary">{order.deliveryAddress}</span>
              </div>
            )}
            {order.remark && (
              <div className="flex justify-between">
                <span className="text-text-secondary">备注</span>
                <span className="text-text-primary">{order.remark}</span>
              </div>
            )}
          </div>
        </div>

        {/* 费用明细 */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h2 className="text-base font-semibold text-text-primary mb-3">费用明细</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-text-secondary">
              <span>订单金额</span>
              <span>¥{order.amount}</span>
            </div>
            {order.deposit && (
              <div className="flex justify-between text-text-secondary">
                <span>押金</span>
                <span>¥{order.deposit}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-text-primary pt-2 border-t border-gray-200">
              <span>总计</span>
              <span className="text-accent">
                ¥{(parseFloat(order.amount) + (order.deposit ? parseFloat(order.deposit) : 0)).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="space-y-2">
          {order.status === 'pending' && (
            <>
              <button
                onClick={() => router.push(`/orders/${orderId}/pay`)}
                className="w-full px-4 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                立即支付
              </button>
              <button
                onClick={handleCancel}
                className="w-full px-4 py-3 bg-white border border-gray-200 text-text-primary rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                取消订单
              </button>
            </>
          )}
          {order.status === 'paid' && (
            <button
              onClick={() => handleUpdateStatus('confirmed')}
              className="w-full px-4 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              确认收货
            </button>
          )}
          {order.status === 'confirmed' && (
            <button
              onClick={() => handleUpdateStatus('completed')}
              className="w-full px-4 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              完成订单
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

