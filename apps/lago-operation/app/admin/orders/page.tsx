'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isAuthenticated } from '@/lib/auth';
import apiClient from '@/lib/api';

interface Order {
  id: string;
  type: string;
  status: string;
  amount: number;
  deposit: number | null;
  createdAt: string;
  product: {
    id: string;
    title: string;
    images: string[];
  };
  buyer: {
    id: string;
    nickname: string | null;
    phone: string | null;
  };
  seller: {
    id: string;
    nickname: string | null;
    phone: string | null;
  };
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    search: '',
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/admin/login');
      return;
    }

    loadOrders();
  }, [router, page, filters]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(filters.status && { status: filters.status }),
        ...(filters.type && { type: filters.type }),
        ...(filters.search && { search: filters.search }),
      });

      const response = await apiClient.get(`/admin/orders?${params}`);
      setOrders(response.data.orders);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('加载订单列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated()) {
    return null;
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

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">订单管理</h1>

      {/* 筛选器 */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              状态
            </label>
            <select
              value={filters.status}
              onChange={(e) => {
                setFilters({ ...filters, status: e.target.value });
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">全部</option>
              <option value="pending">待支付</option>
              <option value="paid">已支付</option>
              <option value="confirmed">已确认</option>
              <option value="completed">已完成</option>
              <option value="cancelled">已取消</option>
              <option value="refunded">已退款</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              类型
            </label>
            <select
              value={filters.type}
              onChange={(e) => {
                setFilters({ ...filters, type: e.target.value });
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">全部</option>
              <option value="rent">租赁</option>
              <option value="sell">出售</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              搜索
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => {
                setFilters({ ...filters, search: e.target.value });
                setPage(1);
              }}
              placeholder="订单ID或商品标题"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setFilters({ status: '', type: '', search: '' });
                setPage(1);
              }}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              重置
            </button>
          </div>
        </div>
      </div>

      {/* 订单列表 */}
      {loading ? (
        <div className="text-center py-12">加载中...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 text-gray-500">暂无订单</div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    订单信息
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    买家
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    卖家
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    金额
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    类型
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    创建时间
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {order.product.images && order.product.images.length > 0 && (
                          <img
                            src={order.product.images[0]}
                            alt={order.product.title}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div>
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="font-medium text-gray-900 hover:text-blue-600"
                          >
                            {order.product.title}
                          </Link>
                          <p className="text-sm text-gray-500">订单ID: {order.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div>
                        <div className="font-medium">{order.buyer.nickname || '未设置'}</div>
                        <div className="text-gray-500">{order.buyer.phone || '--'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div>
                        <div className="font-medium">{order.seller.nickname || '未设置'}</div>
                        <div className="text-gray-500">{order.seller.phone || '--'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div>
                        <div className="font-medium">¥{Number(order.amount).toFixed(2)}</div>
                        {order.deposit && (
                          <div className="text-gray-500">押金: ¥{Number(order.deposit).toFixed(2)}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                        {typeNames[order.type] || order.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          statusColors[order.status] || statusColors.pending
                        }`}
                      >
                        {statusNames[order.status] || order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        详情
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50"
              >
                上一页
              </button>
              <span className="text-sm text-gray-700">
                第 {page} 页，共 {totalPages} 页
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50"
              >
                下一页
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

