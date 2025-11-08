'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiRequest } from '@lago/common';
import { MapPin, Shield, CheckCircle, XCircle, Users, Package, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

interface Community {
  id: string;
  name: string;
  address?: string;
  images: string[];
  description?: string;
  province?: { name: string };
  city?: { name: string };
  district?: { name: string };
  verificationStatus: 'pending' | 'approved' | 'rejected';
  verifiedAt?: string;
  verification?: {
    id: string;
    companyName: string;
    contactName: string;
    contactPhone: string;
    licenseUrl: string;
    proofUrl?: string;
    status: string;
    rejectReason?: string;
    reviewedAt?: string;
  };
  _count?: {
    members: number;
    products: number;
    activities: number;
  };
}

export default function CommunityDetailPage() {
  const router = useRouter();
  const params = useParams();
  const communityId = params.id as string;

  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCommunity();
  }, [communityId]);

  const loadCommunity = async () => {
    try {
      const response = await apiRequest<{ community: Community }>(
        `/api/admin/communities/${communityId}`,
        {
          method: 'GET',
        }
      );
      if (response.success && response.data) {
        setCommunity(response.data.community);
      }
    } catch (error) {
      console.error('加载小区详情失败:', error);
      toast.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!confirm('确定要通过该小区的认证申请吗？')) return;

    try {
      const response = await apiRequest(`/api/admin/communities/${communityId}/approve`, {
        method: 'POST',
      });
      if (response.success) {
        toast.success('认证审批通过');
        loadCommunity();
      }
    } catch (error: any) {
      toast.error(error.message || '操作失败');
    }
  };

  const handleReject = async () => {
    const reason = prompt('请输入拒绝原因：');
    if (!reason) return;

    try {
      const response = await apiRequest(`/api/admin/communities/${communityId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
      if (response.success) {
        toast.success('认证审批已拒绝');
        loadCommunity();
      }
    } catch (error: any) {
      toast.error(error.message || '操作失败');
    }
  };

  if (loading) {
    return <div className="p-6">加载中...</div>;
  }

  if (!community) {
    return <div className="p-6">小区不存在</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-800 mb-4"
        >
          ← 返回
        </button>
        <h1 className="text-2xl font-bold text-gray-900">小区详情</h1>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* 小区基本信息 */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              {community.images?.[0] ? (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                  <img
                    src={community.images[0]}
                    alt={community.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center">
                  <MapPin className="w-12 h-12 text-gray-400" />
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">{community.name}</h2>
                {community.address && (
                  <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>{community.address}</span>
                  </div>
                )}
                {community.province && community.city && (
                  <div className="text-sm text-gray-600">
                    {community.province.name} {community.city.name}
                    {community.district && ` ${community.district.name}`}
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <span
                className={`px-3 py-1 text-sm rounded-full ${
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
            </div>
          </div>

          {community.description && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">小区介绍</h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{community.description}</p>
            </div>
          )}

          {/* 统计信息 */}
          <div className="mt-4 flex gap-6 text-sm">
            <div className="flex items-center gap-1 text-gray-600">
              <Users className="w-4 h-4" />
              <span>{community._count?.members || 0} 位成员</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <Package className="w-4 h-4" />
              <span>{community._count?.products || 0} 件商品</span>
            </div>
            {community._count && community._count.activities > 0 && (
              <div className="flex items-center gap-1 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{community._count.activities} 个活动</span>
              </div>
            )}
          </div>
        </div>

        {/* 认证信息 */}
        {community.verification && (
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">认证信息</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  物业公司名称
                </label>
                <p className="text-sm text-gray-900">{community.verification.companyName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">联系人</label>
                <p className="text-sm text-gray-900">{community.verification.contactName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">联系电话</label>
                <p className="text-sm text-gray-900">{community.verification.contactPhone}</p>
              </div>
              {community.verification.reviewedAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">审核时间</label>
                  <p className="text-sm text-gray-900">
                    {new Date(community.verification.reviewedAt).toLocaleString('zh-CN')}
                  </p>
                </div>
              )}
            </div>

            {/* 营业执照 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">营业执照</label>
              {community.verification.licenseUrl && (
                <div className="relative w-full max-w-md h-48 rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={community.verification.licenseUrl}
                    alt="营业执照"
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </div>
              )}
            </div>

            {/* 其他证明资料 */}
            {community.verification.proofUrl && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">其他证明资料</label>
                <div className="relative w-full max-w-md h-48 rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={community.verification.proofUrl}
                    alt="证明资料"
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </div>
              </div>
            )}

            {/* 拒绝原因 */}
            {community.verification.rejectReason && (
              <div className="mt-4 p-3 bg-red-50 rounded-lg">
                <label className="block text-sm font-medium text-red-700 mb-1">拒绝原因</label>
                <p className="text-sm text-red-600">{community.verification.rejectReason}</p>
              </div>
            )}

            {/* 操作按钮 */}
            {community.verificationStatus === 'pending' && (
              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleApprove}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>通过认证</span>
                </button>
                <button
                  onClick={handleReject}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <XCircle className="w-5 h-5" />
                  <span>拒绝认证</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* 小区相册 */}
        {community.images && community.images.length > 0 && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">小区相册</h3>
            <div className="grid grid-cols-4 gap-4">
              {community.images.map((image, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-lg overflow-hidden border border-gray-200"
                >
                  <img
                    src={image}
                    alt={`${community.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

