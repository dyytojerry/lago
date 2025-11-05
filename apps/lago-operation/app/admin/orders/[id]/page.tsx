'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import apiClient from '@/lib/api';

interface OrderDetail {
  id: string;
  type: string;
  status: string;
  amount: number;
  deposit: number | null;
  startDate: string | null;
  endDate: string | null;
  deliveryType: string;
  deliveryAddress: string | null;
  remark: string | null;
  createdAt: string;
  updatedAt: string;
  product: {
    id: string;
    title: string;
    description: string | null;
    images: string[];
    price: number;
    owner: {
      id: string;
      nickname: string | null;
      phone: string | null;
    };
  };
  buyer: {
    id: string;
    nickname: string | null;
    phone: string | null;
    email: string | null;
  };
  seller: {
    id: string;
    nickname: string | null;
    phone: string | null;
    email: string | null;
  };
  depositRecord: {
    id: string;
    amount: number;
    refundStatus: string;
    refundedAt: string | null;
  } | null;
}

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [remark, setRemark] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/admin/login');
      return;
    }

    loadOrder();
  }, [router, orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/admin/orders/${orderId}`);
      setOrder(response.data.order);
      if (response.data.order) {
        setStatus(response.data.order.status);
        setRemark(response.data.order.remark || '');
      }
    } catch (error) {
      console.error('加载订单详情失败:', error);
      alert('加载订单详情失败');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!confirm(`确定要将订单状态更新为 ${status} 吗？`)) {
      return;
    }

    try {
      setIsUpdating(true);
      await apiClient.put(`/admin/orders/${orderId}/status`, {
        status,
        remark: remark || undefined,
      });
      alert('订单状态已更新');
      loadOrder();
    } catch (error: any) {
      alert(error.response?.data?.error || '操作失败');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isAuthenticated() || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12 text-gray-500">订单不存在</div>
    );
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-blue-100 text-blue-800',
    confirmed: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-800',
    refunded: 'bg-red-100 text-red-800',
  };

  const statusNames: Record<string, string> = {
    pending: '待支付',
    paid: '已支付',
    confirmed: '已确认',
    completed: '已完成',
    cancelled: '已取消',
    refunded: '已退款',
  };

  const typeNames: Record<string, string> = {
    rent: '租赁',
    sell: '出售',
  };

  const deliveryTypeNames: Record<string, string> = {
    self_pickup: '自提',
    delivery: '配送',
    cabinet: '循环柜',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-900"
        >
          ← 返回
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：订单信息 */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">订单详情</h1>
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full ${
                  statusColors[order.status] || statusColors.pending
                }`}
              >
                {statusNames[order.status] || order.status}
              </span>
            </div>

            <div className="border-t pt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-600 text-sm">订单ID:</span>
                  <div className="font-mono text-xs">{order.id}</div>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">订单类型:</span>
                  <div className="font-medium">{typeNames[order.type] || order.type}</div>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">订单金额:</span>
                  <div className="font-medium text-lg text-red-600">
                    ¥{Number(order.amount).toFixed(2)}
                  </div>
                </div>
                {order.deposit && (
                  <div>
                    <span className="text-gray-600 text-sm">押金:</span>
                    <div className="font-medium">¥{Number(order.deposit).toFixed(2)}</div>
                  </div>
                )}
                <div>
                  <span className="text-gray-600 text-sm">配送方式:</span>
                  <div className="font-medium">
                    {deliveryTypeNames[order.deliveryType] || order.deliveryType}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">创建时间:</span>
                  <div className="text-sm">{new Date(order.createdAt).toLocaleString('zh-CN')}</div>
                </div>
              </div>

              {order.startDate && (
                <div>
                  <span className="text-gray-600 text-sm">租赁期间:</span>
                  <div>
                    {new Date(order.startDate).toLocaleDateString('zh-CN')} -{' '}
                    {order.endDate ? new Date(order.endDate).toLocaleDateString('zh-CN') : '未设置'}
                  </div>
                </div>
              )}

              {order.deliveryAddress && (
                <div>
                  <span className="text-gray-600 text-sm">配送地址:</span>
                  <div>{order.deliveryAddress}</div>
                </div>
              )}

              {order.remark && (
                <div>
                  <span className="text-gray-600 text-sm">备注:</span>
                  <div className="bg-gray-50 p-3 rounded">{order.remark}</div>
                </div>
              )}
            </div>
          </div>

          {/* 商品信息 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">商品信息</h3>
            <div className="flex gap-4">
              {order.product.images && order.product.images.length > 0 && (
                <img
                  src={order.product.images[0]}
                  alt={order.product.title}
                  className="w-24 h-24 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <Link
                  href={`/admin/products/${order.product.id}`}
                  className="text-lg font-medium text-blue-600 hover:text-blue-800"
                >
                  {order.product.title}
                </Link>
                {order.product.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {order.product.description}
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  价格: ¥{Number(order.product.price).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* 押金记录 */}
          {order.depositRecord && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">押金记录</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-gray-600 text-sm">押金金额:</span>
                  <div className="font-medium">¥{Number(order.depositRecord.amount).toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">退款状态:</span>
                  <div>
                    {order.depositRecord.refundStatus === 'refunded' ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                        已退款
                      </span>
                    ) : order.depositRecord.refundStatus === 'forfeited' ? (
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                        已没收
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                        待处理
                      </span>
                    )}
                  </div>
                </div>
                {order.depositRecord.refundedAt && (
                  <div>
                    <span className="text-gray-600 text-sm">退款时间:</span>
                    <div className="text-sm">
                      {new Date(order.depositRecord.refundedAt).toLocaleString('zh-CN')}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 右侧：用户信息和操作 */}
        <div className="space-y-6">
          {/* 买家信息 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">买家信息</h3>
            <div className="space-y-3">
              <div>
                <span className="text-gray-600 text-sm">昵称:</span>
                <div className="font-medium">{order.buyer.nickname || '未设置'}</div>
              </div>
              <div>
                <span className="text-gray-600 text-sm">手机号:</span>
                <div className="font-medium">{order.buyer.phone || '--'}</div>
              </div>
              <div>
                <span className="text-gray-600 text-sm">邮箱:</span>
                <div className="font-medium">{order.buyer.email || '--'}</div>
              </div>
              <Link
                href={`/admin/users/${order.buyer.id}`}
                className="block text-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
              >
                查看买家详情
              </Link>
            </div>
          </div>

          {/* 卖家信息 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">卖家信息</h3>
            <div className="space-y-3">
              <div>
                <span className="text-gray-600 text-sm">昵称:</span>
                <div className="font-medium">{order.seller.nickname || '未设置'}</div>
              </div>
              <div>
                <span className="text-gray-600 text-sm">手机号:</span>
                <div className="font-medium">{order.seller.phone || '--'}</div>
              </div>
              <div>
                <span className="text-gray-600 text-sm">邮箱:</span>
                <div className="font-medium">{order.seller.email || '--'}</div>
              </div>
              <Link
                href={`/admin/users/${order.seller.id}`}
                className="block text-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
              >
                查看卖家详情
              </Link>
            </div>
          </div>

          {/* 订单操作 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">订单操作</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  订单状态
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="pending">待支付</option>
                  <option value="paid">已支付</option>
                  <option value="confirmed">已确认</option>
                  <option value="completed">已完成</option>
                  <option value="cancelled">已取消</option>
                  <option value="refunded">已退款</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  备注
                </label>
                <textarea
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="填写备注..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>
              <button
                onClick={handleUpdateStatus}
                disabled={isUpdating || status === order.status}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isUpdating ? '更新中...' : '更新订单状态'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

