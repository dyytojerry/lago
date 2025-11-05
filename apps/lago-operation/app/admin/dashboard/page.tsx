'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getStaff, hasPermission } from '@/lib/auth';

export default function DashboardPage() {
  const router = useRouter();
  const staff = getStaff();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/admin/login');
    }
  }, [router]);

  if (!isAuthenticated() || !staff) {
    return null;
  }

  const roleNames: Record<string, string> = {
    super_admin: '超级管理员',
    audit_staff: '审核专员',
    service_staff: '客服专员',
    operation_staff: '运营专员',
    finance_staff: '财务专员',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold mb-4">运营系统仪表盘</h1>
          <div className="border-t pt-4">
            <h2 className="text-xl font-semibold mb-4">登录信息</h2>
            <div className="space-y-2">
              <p><strong>用户名:</strong> {staff.username}</p>
              <p><strong>邮箱:</strong> {staff.email}</p>
              <p><strong>姓名:</strong> {staff.realName || '未设置'}</p>
              <p><strong>角色:</strong> {roleNames[staff.role] || staff.role}</p>
              <p><strong>手机号:</strong> {staff.phone || '未绑定'}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hasPermission(['super_admin', 'audit_staff']) && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-2">入驻审核</h3>
              <p className="text-gray-600">审核小区、物业、商家入驻申请</p>
            </div>
          )}

          {hasPermission(['super_admin', 'audit_staff']) && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-2">商品审核</h3>
              <p className="text-gray-600">审核商品内容和合规性</p>
            </div>
          )}

          {hasPermission(['super_admin', 'service_staff']) && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-2">逆向维权</h3>
              <p className="text-gray-600">处理用户投诉和纠纷</p>
            </div>
          )}

          {hasPermission(['super_admin', 'operation_staff']) && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-2">数据看板</h3>
              <p className="text-gray-600">查看平台运营数据和分析</p>
            </div>
          )}

          {hasPermission(['super_admin', 'finance_staff']) && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-2">财务结算</h3>
              <p className="text-gray-600">处理提现申请和财务结算</p>
            </div>
          )}

          {hasPermission(['super_admin']) && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-2">系统设置</h3>
              <p className="text-gray-600">配置系统参数和权限</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

