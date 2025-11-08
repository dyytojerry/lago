'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Loading } from '@/components/Loading';
import { EmptyState } from '@/components/EmptyState';
import {
  useOnboarding,
} from '@/lib/apis/onboarding';
import { OnboardingApplicationStatus, OnboardingApplicationType, OnboardingApplicationCreateRequestServiceCategory } from '@/lib/apis/types';
import { Building2, Factory, User, Wrench } from 'lucide-react';

const TYPE_CONFIG: Record<
  OnboardingApplicationType,
  {
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  personal_seller: {
    title: '个人卖家入驻',
    description: '面向个人用户开通卖家权限，提交身份证明材料即可快速入驻平台。',
    icon: User,
  },
  small_business_seller: {
    title: '小微商家入驻',
    description: '个体工商户、工作室等小微商家需提交营业执照等资料完成入驻。',
    icon: Factory,
  },
  personal_service_provider: {
    title: '个人服务商入驻',
    description: '维修、安装、保洁等个人技能服务者，需完善实名信息和服务类别。',
    icon: Wrench,
  },
  enterprise_service_provider: {
    title: '企业服务商入驻',
    description: '面向专业维修、装修、回收企业，提供工商信息与服务资质完成入驻。',
    icon: Building2,
  },
};

function mapStatus(status: OnboardingApplicationStatus) {
  switch (status) {
    case OnboardingApplicationStatus.APPROVED:
      return { text: '已通过', className: 'bg-emerald-100 text-emerald-600' };
    case OnboardingApplicationStatus.REJECTED:
      return { text: '已拒绝', className: 'bg-red-100 text-red-600' };
    case OnboardingApplicationStatus.PROCESSING:
      return { text: '审核中', className: 'bg-amber-100 text-amber-600' };
    case OnboardingApplicationStatus.PENDING:
    default:
      return { text: '草稿', className: 'bg-gray-100 text-gray-600' };
  }
}

export default function OnboardingCenterPage() {
  const router = useRouter();
  const { data, isLoading } = useOnboarding();

  const latestByType = useMemo(() => {
    const record: Partial<Record<OnboardingApplicationType, any>> = {};
    const apps = data?.data?.applications || [];
    for (const app of apps) {
      const existing = record[app.type as OnboardingApplicationType];
      if (!existing) {
        record[app.type as OnboardingApplicationType] = app;
        continue;
      }
      if (new Date(app.submittedAt).getTime() > new Date(existing.submittedAt).getTime()) {
        record[app.type as OnboardingApplicationType] = app;
      }
    }
    return record;
  }, [data?.data?.applications]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="入驻中心" />

      <main className="max-w-5xl mx-auto px-4 py-4 space-y-4">
        <section className="bg-white rounded-2xl shadow-sm p-4">
          <h2 className="text-lg font-semibold text-text-primary mb-2">入驻说明</h2>
          <p className="text-sm text-text-secondary leading-6">
            根据不同的经营场景选择对应的入驻类型，完善必要的资质材料后提交审核。平台将在1-3个工作日内完成审核并通过站内通知告知结果。
          </p>
        </section>

        {isLoading ? (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <Loading text="加载入驻进度..." />
          </div>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(Object.keys(TYPE_CONFIG) as OnboardingApplicationType[]).map((type) => {
              const config = TYPE_CONFIG[type];
              const Icon = config.icon;
              const latest = latestByType[type];
              const statusMeta = latest ? mapStatus(latest.status as OnboardingApplicationStatus) : null;
              return (
                <div
                  key={type}
                  className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-3 border border-transparent hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="p-3 rounded-full bg-primary/10 text-primary">
                      <Icon className="w-6 h-6" />
                    </span>
                    <div>
                      <h3 className="text-base font-semibold text-text-primary">
                        {config.title}
                      </h3>
                      <p className="text-xs text-text-tertiary">
                        {config.description}
                      </p>
                    </div>
                  </div>
                  {latest ? (
                    <div className="text-sm text-text-secondary bg-gray-50 rounded-xl px-3 py-2">
                      <div className="flex items-center justify-between">
                        <span>最近提交：{new Date(latest.submittedAt).toLocaleString()}</span>
                        {statusMeta && (
                          <span className={`px-2 py-0.5 rounded-full text-xs ${statusMeta.className}`}>
                            {statusMeta.text}
                          </span>
                        )}
                      </div>
                      {latest.rejectReason && (
                        <p className="text-xs text-red-500 mt-1">
                          拒绝原因：{latest.rejectReason}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-text-tertiary bg-gray-50 rounded-xl px-3 py-2">
                      尚未提交该类型的入驻申请
                    </div>
                  )}
                  <button
                    onClick={() => router.push(`/profile/onboarding/${type}`)}
                    className="mt-auto inline-flex items-center justify-center px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    {latest ? '更新入驻资料' : '立即入驻'}
                  </button>
                </div>
              );
            })}
          </section>
        )}

        <section className="bg-white rounded-2xl shadow-sm p-4">
          <h3 className="text-sm font-semibold text-text-primary mb-2">服务商可选类别</h3>
          <p className="text-xs text-text-secondary mb-3">
            家具家电维修、装修改造、回收处理等服务涉及多种类型，可在入驻时根据自身业务选择以下分类：
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.values(OnboardingApplicationCreateRequestServiceCategory).map((category) => (
              <span
                key={category as keyof typeof SERVICE_CATEGORY_TEXT}
                className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs"
              >
                {SERVICE_CATEGORY_TEXT[category as keyof typeof SERVICE_CATEGORY_TEXT]}
              </span>
            ))}
          </div>
        </section>

        {(!data?.data?.applications || data.data.applications.length === 0) && !isLoading && (
          <EmptyState
            icon="building"
            title="暂未提交入驻申请"
            description="选择合适的入驻类型，完善资料即可开始入驻流程。"
          />
        )}
      </main>

      <BottomNavigation />
    </div>
  );
}

const SERVICE_CATEGORY_TEXT: Record<OnboardingApplicationCreateRequestServiceCategory, string> = {
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
  other: '其他服务',
};

