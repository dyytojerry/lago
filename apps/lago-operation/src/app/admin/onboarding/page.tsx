'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { useAdminOnboardingList } from '@/lib/apis/adminonboarding';
import {
  OnboardingStatus,
  OnboardingType,
  ServiceCategory,
} from '@/lib/apis/types';
import { Loading } from '@/components/Loading';

const TYPE_TEXT: Record<OnboardingType, string> = {
  personal_seller: '个人卖家',
  small_business_seller: '小微商家',
  personal_service_provider: '个人服务商',
  enterprise_service_provider: '企业服务商',
};

const STATUS_META: Record<
  OnboardingStatus,
  { text: string; className: string }
> = {
  pending: { text: '草稿', className: 'bg-gray-100 text-gray-600' },
  processing: { text: '待审核', className: 'bg-yellow-100 text-yellow-700' },
  approved: { text: '已通过', className: 'bg-emerald-100 text-emerald-600' },
  rejected: { text: '已拒绝', className: 'bg-red-100 text-red-600' },
};

const SERVICE_CATEGORY_TEXT: Record<ServiceCategory, string> = {
  recycling: '废品回收',
  appliance_repair: '家电维修',
  appliance_install: '家电安装',
  appliance_cleaning: '家电清洗',
  furniture_repair: '家具维修',
  carpentry: '木工',
  masonry: '泥工砌筑',
  tiling: '瓦工贴砖',
  painting: '油漆翻新',
  plumbing: '水管/管道服务',
  electrician: '电工服务',
  hvac_install: '暖通空调',
  locksmith: '开锁换锁',
  pest_control: '除虫除害',
  cleaning: '专业保洁',
  moving_service: '搬家搬运',
  landscaping: '园艺绿化',
  decoration_design: '装修设计',
  renovation_general: '整体装修',
  other: '其他',
};

export default function AdminOnboardingPage() {
  const [filters, setFilters] = useState({
    type: '',
    status: 'processing',
    search: '',
    page: 1,
  });

  const { data, isLoading } = useAdminOnboardingList({
    page: String(filters.page),
    type: filters.type || undefined,
    status: filters.status || undefined,
    search: filters.search || undefined,
  });

  const applications = data?.data?.applications || [];
  const pagination = data?.data?.pagination;

  const totalText = useMemo(() => {
    if (!pagination) return '';
    return `共 ${pagination.total} 条`;
  }, [pagination]);

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      <Header title="入驻管理" />

      <main className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        <section className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap items-center gap-3">
          <div>
            <label className="text-xs text-gray-500">类型</label>
            <select
              value={filters.type}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, type: e.target.value, page: 1 }))
              }
              className="ml-2 px-3 py-1 text-sm border border-gray-200 rounded-lg"
            >
              <option value="">全部</option>
              {(Object.keys(TYPE_TEXT) as OnboardingType[]).map((type) => (
                <option key={type} value={type}>
                  {TYPE_TEXT[type]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500">状态</label>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, status: e.target.value, page: 1 }))
              }
              className="ml-2 px-3 py-1 text-sm border border-gray-200 rounded-lg"
            >
              <option value="">全部</option>
              {(Object.entries(STATUS_META) as [OnboardingStatus, any][]).map(
                ([value, meta]) => (
                  <option key={value} value={value}>
                    {meta.text}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="flex-1 min-w-[180px]">
            <input
              placeholder="搜索姓名 / 公司 / 手机"
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))
              }
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
            />
          </div>

          <span className="text-xs text-gray-500">{totalText}</span>
        </section>

        <section className="bg-white rounded-xl shadow-sm overflow-hidden">
          {isLoading ? (
            <Loading text="加载中..." />
          ) : applications.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500">暂无入驻申请</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left">申请人</th>
                  <th className="px-4 py-3 text-left">入驻类型</th>
                  <th className="px-4 py-3 text-left">联系方式</th>
                  <th className="px-4 py-3 text-left">服务类别</th>
                  <th className="px-4 py-3 text-left">提交时间</th>
                  <th className="px-4 py-3 text-left">状态</th>
                  <th className="px-4 py-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {applications.map((app) => {
                  const statusMeta = STATUS_META[app.status as OnboardingStatus];
                  return (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {app.fullName || app.businessName || app.user?.nickname || '—'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {app.user?.phone || app.user?.email || '—'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {TYPE_TEXT[app.type as OnboardingType]}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        <div>{app.contactPhone || '—'}</div>
                        <div className="text-xs text-gray-400">{app.contactEmail || ''}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {app.serviceCategory
                          ? SERVICE_CATEGORY_TEXT[app.serviceCategory as ServiceCategory]
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(app.submittedAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${statusMeta.className}`}
                        >
                          {statusMeta.text}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/onboarding/${app.id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          查看
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between text-sm text-gray-600">
            <button
              disabled={filters.page <= 1}
              onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
              className="px-3 py-1 rounded-lg border border-gray-200 disabled:opacity-50"
            >
              上一页
            </button>
            <span>
              第 {pagination.page} / {pagination.totalPages} 页
            </span>
            <button
              disabled={filters.page >= pagination.totalPages}
              onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
              className="px-3 py-1 rounded-lg border border-gray-200 disabled:opacity-50"
            >
              下一页
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

