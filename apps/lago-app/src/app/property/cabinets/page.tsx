'use client';

import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { EmptyState } from '@/components/EmptyState';
import { Package, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function PropertyCabinetsPage() {
  const router = useRouter();

  // TODO: 实现循环柜数据API
  const cabinets: any[] = [];

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="循环柜管理" showBack />

      <main className="max-w-7xl mx-auto px-4 py-4">
        {cabinets.length === 0 ? (
          <EmptyState
            icon="package"
            title="暂无循环柜"
            description="还没有配置循环柜"
          />
        ) : (
          <div className="space-y-3">
            {cabinets.map((cabinet: any) => (
              <div
                key={cabinet.id}
                className="bg-white rounded-lg p-4 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-base font-semibold text-text-primary mb-1">
                      {cabinet.name || `循环柜 ${cabinet.id}`}
                    </h3>
                    <p className="text-sm text-text-secondary">{cabinet.location}</p>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      cabinet.status === 'online'
                        ? 'bg-green-100 text-green-600'
                        : cabinet.status === 'offline'
                        ? 'bg-gray-100 text-gray-600'
                        : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {cabinet.status === 'online'
                      ? '在线'
                      : cabinet.status === 'offline'
                      ? '离线'
                      : '故障'}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-text-secondary mb-1">总格口</p>
                    <p className="text-lg font-semibold text-text-primary">
                      {cabinet.totalSlots || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-secondary mb-1">已使用</p>
                    <p className="text-lg font-semibold text-text-primary">
                      {cabinet.usedSlots || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-secondary mb-1">可用</p>
                    <p className="text-lg font-semibold text-green-600">
                      {(cabinet.totalSlots || 0) - (cabinet.usedSlots || 0)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

