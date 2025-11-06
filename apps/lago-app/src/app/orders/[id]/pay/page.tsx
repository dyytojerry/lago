'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { EmptyState } from '@/components/EmptyState';
import { useOrderDetail } from '@/lib/apis/orders';
import { CreditCard, Wallet, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OrderPayPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  const [paymentMethod, setPaymentMethod] = useState<'wechat' | 'alipay'>('wechat');

  const { data, isLoading, error } = useOrderDetail({ id: orderId });
  const order = data?.data?.order;

  const handlePay = async () => {
    // TODO: 实现支付API调用
    toast.success('支付成功');
    router.push(`/orders/${orderId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="支付订单" showBack />
        <Loading text="加载中..." />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="支付订单" showBack />
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

  const totalAmount = parseFloat(order.amount) + (order.deposit ? parseFloat(order.deposit) : 0);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="支付订单" showBack />

      <main className="max-w-7xl mx-auto px-4 py-4 space-y-4">
        {/* 订单信息 */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h2 className="text-base font-semibold text-text-primary mb-3">订单信息</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">订单号</span>
              <span className="text-text-primary">{order.id}</span>
            </div>
            {order.product && (
              <div className="flex justify-between">
                <span className="text-text-secondary">商品</span>
                <span className="text-text-primary">{order.product.title}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-text-primary pt-2 border-t border-gray-200">
              <span>支付金额</span>
              <span className="text-accent">¥{totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* 支付方式 */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h2 className="text-base font-semibold text-text-primary mb-3">选择支付方式</h2>
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-3 border-2 border-primary rounded-lg cursor-pointer bg-primary/5">
              <input
                type="radio"
                name="paymentMethod"
                value="wechat"
                checked={paymentMethod === 'wechat'}
                onChange={(e) => setPaymentMethod(e.target.value as 'wechat')}
                className="text-primary"
              />
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-medium text-text-primary">微信支付</p>
                  <p className="text-xs text-text-secondary">推荐使用</p>
                </div>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="paymentMethod"
                value="alipay"
                checked={paymentMethod === 'alipay'}
                onChange={(e) => setPaymentMethod(e.target.value as 'alipay')}
                className="text-primary"
              />
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-medium text-text-primary">支付宝</p>
                  <p className="text-xs text-text-secondary">安全便捷</p>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* 支付按钮 */}
        <button
          onClick={handlePay}
          className="w-full px-4 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          <Wallet className="w-5 h-5" />
          <span>确认支付 ¥{totalAmount.toFixed(2)}</span>
        </button>
      </main>
    </div>
  );
}

