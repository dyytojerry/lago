'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isAuthenticated } from '@/lib/auth';
import apiClient from '@/lib/api';

interface User {
  id: string;
  nickname: string | null;
  avatarUrl: string | null;
  phone: string | null;
  email: string | null;
  role: string;
  creditScore: number;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  _count: {
    products: number;
    ordersAsBuyer: number;
    ordersAsSeller: number;
  };
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    search: '',
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/admin/login');
      return;
    }

    loadUsers();
  }, [router, page, filters]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(filters.role && { role: filters.role }),
        ...(filters.status && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
      });

      const response = await apiClient.get(`/admin/users?${params}`);
      setUsers(response.data.users);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('加载用户列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, isActive: boolean) => {
    if (!confirm(`确定要${isActive ? '激活' : '冻结'}这个用户吗？`)) {
      return;
    }

    try {
      await apiClient.put(`/admin/users/${id}/status`, { isActive });
      alert(`用户已${isActive ? '激活' : '冻结'}`);
      loadUsers();
    } catch (error: any) {
      alert(error.response?.data?.error || '操作失败');
    }
  };

  if (!isAuthenticated()) {
    return null;
  }

  const roleNames: Record<string, string> = {
    user: '用户',
    merchant: '商家',
    property: '物业',
    admin: '管理员',
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">用户管理</h1>

      {/* 筛选器 */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              角色
            </label>
            <select
              value={filters.role}
              onChange={(e) => {
                setFilters({ ...filters, role: e.target.value });
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">全部</option>
              <option value="user">用户</option>
              <option value="merchant">商家</option>
              <option value="property">物业</option>
              <option value="admin">管理员</option>
            </select>
          </div>

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
              <option value="active">正常</option>
              <option value="inactive">已冻结</option>
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
              placeholder="昵称/手机号/邮箱"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setFilters({ role: '', status: '', search: '' });
                setPage(1);
              }}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              重置
            </button>
          </div>
        </div>
      </div>

      {/* 用户列表 */}
      {loading ? (
        <div className="text-center py-12">加载中...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 text-gray-500">暂无用户</div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    用户信息
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    联系方式
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    角色
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    信用积分
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    统计
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    状态
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.nickname || '用户'}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500">👤</span>
                          </div>
                        )}
                        <div>
                          <Link
                            href={`/admin/users/${user.id}`}
                            className="font-medium text-gray-900 hover:text-blue-600"
                          >
                            {user.nickname || '未设置昵称'}
                          </Link>
                          <p className="text-sm text-gray-500">{user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div>
                        <div>{user.phone || '--'}</div>
                        <div className="text-gray-500">{user.email || '--'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {roleNames[user.role] || user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="font-medium">{user.creditScore}</span>
                      {user.isVerified && (
                        <span className="ml-2 text-xs text-green-600">✓ 已认证</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div>商品: {user._count.products}</div>
                      <div>买: {user._count.ordersAsBuyer} | 卖: {user._count.ordersAsSeller}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.isActive ? '正常' : '已冻结'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          详情
                        </Link>
                        <button
                          onClick={() => handleUpdateStatus(user.id, !user.isActive)}
                          className={`${
                            user.isActive
                              ? 'text-red-600 hover:text-red-800'
                              : 'text-green-600 hover:text-green-800'
                          }`}
                        >
                          {user.isActive ? '冻结' : '激活'}
                        </button>
                      </div>
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

