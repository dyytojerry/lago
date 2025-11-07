'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@lago/common';
import { MapPin, Shield, CheckCircle, XCircle, Clock, Search } from 'lucide-react';
import toast from 'react-hot-toast';

interface Community {
  id: string;
  name: string;
  address?: string;
  images: string[];
  verificationStatus: 'pending' | 'approved' | 'rejected';
  province?: { name: string };
  city?: { name: string };
  district?: { name: string };
  verification?: {
    status: string;
    companyName: string;
    contactName: string;
    contactPhone: string;
  };
  _count?: {
    members: number;
    products: number;
  };
}

export default function CommunitiesPage() {
  const router = useRouter();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | ''>('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    loadCommunities();
  }, [pagination.page, searchQuery, statusFilter]);

  const loadCommunities = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: String(pagination.page),
        limit: '20',
      };

      if (searchQuery) {
        params.search = searchQuery;
      }

      if (statusFilter) {
        params.verificationStatus = statusFilter;
      }

      const response = await apiRequest<{
        communities: Community[];
        pagination: { page: number; limit: number; total: number; totalPages: number };
      }>('/api/admin/communities', {
        method: 'GET',
        params,
      });

      if (response.success && response.data) {
        setCommunities(response.data.communities || []);
        setPagination(response.data.pagination || pagination);
      }
    } catch (error) {
      console.error('加载小区列表失败:', error);
      toast.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (communityId: string) => {
    if (!confirm('确定要通过该小区的认证申请吗？')) return;

    try {
      const response = await apiRequest(`/api/admin/communities/${communityId}/approve`, {
        method: 'POST',
      });
      if (response.success) {
        toast.success('认证审批通过');
        loadCommunities();
      }
    } catch (error: any) {
      toast.error(error.message || '操作失败');
    }
  };

  const handleReject = async (communityId: string) => {
    const reason = prompt('请输入拒绝原因：');
    if (!reason) return;

    try {
      const response = await apiRequest(`/api/admin/communities/${communityId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
      if (response.success) {
        toast.success('认证审批已拒绝');
        loadCommunities();
      }
    } catch (error: any) {
      toast.error(error.message || '操作失败');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">小区管理</h1>

        {/* 搜索和筛选 */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索小区名称或地址..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">全部状态</option>
            <option value="pending">待审核</option>
            <option value="approved">已认证</option>
            <option value="rejected">已拒绝</option>
          </select>
        </div>
      </div>

      {/* 小区列表 */}
      {loading ? (
        <div className="text-center py-12">加载中...</div>
      ) : communities.length === 0 ? (
        <div className="text-center py-12 text-gray-500">暂无小区</div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    小区信息
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    位置
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    认证状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    统计
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {communities.map((community) => (
                  <tr key={community.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {community.images?.[0] ? (
                          <div className="relative w-12 h-12 rounded overflow-hidden">
                            <img
                              src={community.images[0]}
                              alt={community.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center">
                            <MapPin className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {community.name}
                          </div>
                          {community.address && (
                            <div className="text-sm text-gray-500">{community.address}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {community.province && community.city && (
                        <>
                          {community.province.name} {community.city.name}
                          {community.district && ` ${community.district.name}`}
                        </>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          community.verificationStatus === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : community.verificationStatus === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {community.verificationStatus === 'approved'
                          ? '已认证'
                          : community.verificationStatus === 'rejected'
                          ? '已拒绝'
                          : '待审核'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {community._count && (
                        <>
                          <div>成员: {community._count.members}</div>
                          <div>商品: {community._count.products}</div>
                        </>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(`/admin/communities/${community.id}`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          查看
                        </button>
                        {community.verificationStatus === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(community.id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              通过
                            </button>
                            <button
                              onClick={() => handleReject(community.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              拒绝
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 分页 */}
          {pagination.totalPages > 1 && (
            <div className="mt-4 flex justify-center gap-2">
              <button
                disabled={pagination.page === 1}
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
              >
                上一页
              </button>
              <span className="px-4 py-2 text-sm text-gray-700">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                disabled={pagination.page === pagination.totalPages}
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
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

