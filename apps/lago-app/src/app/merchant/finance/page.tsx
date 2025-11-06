'use client';

import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { EmptyState } from '@/components/EmptyState';
import { DollarSign, TrendingUp, Download, CreditCard, Clock } from 'lucide-react';

export default function MerchantFinancePage() {
  // TODO: 实现财务数据API
  const financeData = {
    totalRevenue: 0,
    pendingSettlement: 0,
    availableBalance: 0,
    thisMonthRevenue: 0,
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="财务结算" showBack />

      <main className="max-w-7xl mx-auto px-4 py-4">
        {/* 财务概览 */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-accent" />
              <span className="text-2xl font-bold text-text-primary">
                ¥{financeData.totalRevenue}
              </span>
            </div>
            <p className="text-sm text-text-secondary">累计收益</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <CreditCard className="w-5 h-5 text-primary" />
              <span className="text-2xl font-bold text-text-primary">
                ¥{financeData.availableBalance}
              </span>
            </div>
            <p className="text-sm text-text-secondary">可提现余额</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <span className="text-2xl font-bold text-text-primary">
                ¥{financeData.pendingSettlement}
              </span>
            </div>
            <p className="text-sm text-text-secondary">待结算</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="text-2xl font-bold text-text-primary">
                ¥{financeData.thisMonthRevenue}
              </span>
            </div>
            <p className="text-sm text-text-secondary">本月收益</p>
          </div>
        </div>

        {/* 提现按钮 */}
        <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
          <button className="w-full px-4 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
            <Download className="w-5 h-5" />
            <span>申请提现</span>
          </button>
        </div>

        {/* 账单明细 */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h2 className="text-base font-semibold text-text-primary mb-3">账单明细</h2>
          <EmptyState
            icon="shopping"
            title="暂无账单"
            description="还没有账单记录"
          />
        </div>
      </main>
    </div>
  );
}

