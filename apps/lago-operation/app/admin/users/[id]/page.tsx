'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { isAuthenticated } from '@/lib/auth';
import apiClient from '@/lib/api';

interface UserDetail {
  id: string;
  nickname: string | null;
  avatarUrl: string | null;
  phone: string | null;
  email: string | null;
  role: string;
  creditScore: number;
  isVerified: boolean;
  isActive: boolean;
  communityIds: string[];
  wechatOpenid: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    products: number;
    ordersAsBuyer: number;
    ordersAsSeller: number;
  };
}

interface Product {
  id: string;
  title: string;
  status: string;
  price: number;
  createdAt: string;
}

interface Order {
  id: string;
  type: string;
  status: string;
  amount: number;
  createdAt: string;
  buyer: {
    id: string;
    nickname: string | null;
  };
  seller: {
    id: string;
    nickname: string | null;
  };
}

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const [user, setUser] = useState<UserDetail | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [creditScore, setCreditScore] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/admin/login');
      return;
    }

    loadUser();
  }, [router, userId]);

  const loadUser = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/admin/users/${userId}`);
      setUser(response.data.user);
      setProducts(response.data.products || []);
      setOrders(response.data.orders || []);
      if (response.data.user) {
        setCreditScore(response.data.user.creditScore);
      }
    } catch (error) {
      console.error('加载用户详情失败:', error);
      alert('加载用户详情失败');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (isActive: boolean) => {
    if (!confirm(`确定要${isActive ? '激活' : '冻结'}这个用户吗？`)) {
      return;
    }

    try {
      await apiClient.put(`/admin/users/${userId}/status`, { isActive });
      alert(`用户已${isActive ? '激活' : '冻结'}`);
      loadUser();
    } catch (error: any) {
      alert(error.response?.data?.error || '操作失败');
    }
  };

  const handleUpdateCreditScore = async () => {
    if (!confirm(`确定要将信用积分调整为 ${creditScore} 吗？`)) {
      return;
    }

    try {
      setIsUpdating(true);
      await apiClient.put(`/admin/users/${userId}/status`, { creditScore });
      alert('信用积分已更新');
      loadUser();
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

  if (!user) {
    return (
      <div className="text-center py-12 text-gray-500">用户不存在</div>
    );
  }

  const roleNames: Record<string, string> = {
    user: '用户',
    merchant: '商家',
    property: '物业',
    admin: '管理员',
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
        <div className="flex gap-2">
          <button
            onClick={() => handleUpdateStatus(!user.isActive)}
            className={`px-4 py-2 rounded-lg ${
              user.isActive
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {user.isActive ? '冻结账号' : '激活账号'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：用户信息 */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-4 mb-6">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.nickname || '用户'}
                  className="w-20 h-20 rounded-full"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-3xl text-gray-500">👤</span>
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold">{user.nickname || '未设置昵称'}</h1>
                <p className="text-gray-500">用户ID: {user.id}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t pt-4">
              <div>
                <span className="text-gray-600 text-sm">手机号:</span>
                <div className="font-medium">{user.phone || '--'}</div>
              </div>
              <div>
                <span className="text-gray-600 text-sm">邮箱:</span>
                <div className="font-medium">{user.email || '--'}</div>
              </div>
              <div>
                <span className="text-gray-600 text-sm">角色:</span>
                <div className="font-medium">{roleNames[user.role] || user.role}</div>
              </div>
              <div>
                <span className="text-gray-600 text-sm">状态:</span>
                <div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {user.isActive ? '正常' : '已冻结'}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-gray-600 text-sm">信用积分:</span>
                <div className="font-medium text-lg">{user.creditScore}</div>
              </div>
              <div>
                <span className="text-gray-600 text-sm">实名认证:</span>
                <div>
                  {user.isVerified ? (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                      ✓ 已认证
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                      未认证
                    </span>
                  )}
                </div>
              </div>
              <div>
                <span className="text-gray-600 text-sm">注册时间:</span>
                <div className="text-sm">{new Date(user.createdAt).toLocaleString('zh-CN')}</div>
              </div>
              <div>
                <span className="text-gray-600 text-sm">最后更新:</span>
                <div className="text-sm">{new Date(user.updatedAt).toLocaleString('zh-CN')}</div>
              </div>
            </div>
          </div>

          {/* 信用积分调整 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">调整信用积分</h3>
            <div className="flex items-center gap-4">
              <input
                type="number"
                value={creditScore}
                onChange={(e) => setCreditScore(parseInt(e.target.value) || 0)}
                min="0"
                max="1000"
                className="px-3 py-2 border border-gray-300 rounded-md w-32"
              />
              <button
                onClick={handleUpdateCreditScore}
                disabled={isUpdating || creditScore === user.creditScore}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isUpdating ? '更新中...' : '更新积分'}
              </button>
            </div>
          </div>

          {/* 商品列表 */}
          {products.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">发布的商品 ({products.length})</h3>
              <div className="space-y-3">
                {products.map((product) => (
                  <div key={product.id} className="border-b pb-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="font-medium text-blue-600 hover:text-blue-800"
                        >
                          {product.title}
                        </Link>
                        <div className="text-sm text-gray-500">
                          价格: ¥{Number(product.price).toFixed(2)} | 状态: {product.status}
                        </div>
                      </div>
                      <span className="text-sm text-gray-600">
                        {new Date(product.createdAt).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 订单列表 */}
          {orders.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">订单记录 ({orders.length})</h3>
              <div className="space-y-3">
                {orders.map((order) => (
                  <div key={order.id} className="border-b pb-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-medium text-blue-600 hover:text-blue-800"
                        >
                          订单 {order.id.slice(0, 8)}...
                        </Link>
                        <div className="text-sm text-gray-500">
                          {order.type === 'rent' ? '租赁' : '出售'} | 金额: ¥{Number(order.amount).toFixed(2)} | 状态: {order.status}
                        </div>
                      </div>
                      <span className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 右侧：统计信息 */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">统计信息</h3>
            <div className="space-y-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{user._count.products}</div>
                <div className="text-sm text-gray-600">发布商品</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{user._count.ordersAsBuyer}</div>
                <div className="text-sm text-gray-600">购买订单</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{user._count.ordersAsSeller}</div>
                <div className="text-sm text-gray-600">销售订单</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">其他信息</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">微信 OpenID:</span>
                <div className="font-mono text-xs break-all">{user.wechatOpenid || '--'}</div>
              </div>
              <div>
                <span className="text-gray-600">加入小区:</span>
                <div>{user.communityIds.length} 个</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

