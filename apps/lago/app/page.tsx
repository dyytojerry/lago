'use client';

import ScrollReveal from '@/components/ScrollReveal';

const heroHighlights = [
  { label: 'AI 推荐', description: '根据邻里画像实时推送合适物品' },
  { label: '租赁', description: '小时级履约，智能柜自助取还' },
  { label: '社群活动', description: '线下体验 + 直播互动沉淀口碑' },
];

const capabilityCards = [
  {
    title: '智能循环柜',
    description: '为社区家庭提供 24 小时自助取还、消杀记录与押金托管。',
    icon: '🧊',
  },
  {
    title: 'SaaS 运营后台',
    description: '物业与 Lago 团队共享数据大屏，活动与资产状态一目了然。',
    icon: '💻',
  },
  {
    title: '用户小程序端',
    description: '小区专属频道聚合热卖、租赁、活动内容，体验丝滑。',
    icon: '📱',
  },
];

const aiSteps = [
  {
    title: '邻里画像推荐',
    description: '基于 GeoHash 与行为偏好聚类，自动匹配最适合的家庭与物品。',
  },
  {
    title: '自然语义搜索',
    description: '支持"租一个周末的 Switch"这类模糊描述，一键生成方案与价格。',
  },
  {
    title: '智能运营驾驶舱',
    description: '实时监控热度、库存、投诉风险，自动给出补货与活动建议。',
  },
];

const partnerBenefits = [
  {
    title: '物业增值服务',
    points: [
      '闲置空间转化为循环柜、体验营等增收场景',
      '共建运营计划，收益分成透明可追溯',
      '社区口碑提升，增强业主粘性',
    ],
  },
  {
    title: 'Lago 运营效率',
    points: [
      '标准化硬件部署与巡检流程，确保交付质量',
      'AI 驱动的运营工具降低人力成本',
      '多社区联动带来活动规模效应',
    ],
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-lago">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
        <div className="container-lago">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-12 xl:gap-16">
            {/* Left Content */}
            <div className="space-y-6 sm:space-y-8">
              <ScrollReveal>
                <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary sm:text-sm">
                  Lago 来购
                </div>
              </ScrollReveal>
              
              <ScrollReveal delay={0.1}>
                <h1 className="text-heading">
                  智能邻里推荐，一站式运营体验
                </h1>
              </ScrollReveal>
              
              <ScrollReveal delay={0.2}>
                <p className="text-body">
                  Lago 的 AI 不是外挂，而是产品底座。我们以社区为单位，连接 AI 推荐、循环柜硬件与物业共建流程，让闲置物品在邻里之间高效循环。
                </p>
              </ScrollReveal>
              
              <ScrollReveal delay={0.3}>
                <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                  <a href="#ai-core" className="btn-primary">
                    了解 AI 中枢
                  </a>
                  <a href="#partnership" className="btn-secondary">
                    查看合作模式
                  </a>
                </div>
              </ScrollReveal>
              
              <ScrollReveal delay={0.4}>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                  {heroHighlights.map((item, index) => (
                    <div
                      key={item.label}
                      className="card-hover rounded-2xl border border-primary-100 bg-container/90 backdrop-blur-sm sm:p-5"
                    >
                      <p className="text-label">{item.label}</p>
                      <p className="mt-2 text-caption leading-relaxed">{item.description}</p>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            </div>

            {/* Right Illustration - Circular Diagram */}
            <ScrollReveal delay={0.2}>
              <div className="relative mx-auto w-full max-w-md lg:max-w-lg">
                <div className="relative aspect-square rounded-card-xl bg-container p-8 shadow-elevated-lg sm:p-10 lg:p-12">
                  {/* Outer Circle */}
                  <div className="absolute inset-4 rounded-full border-[16px] border-primary-50 sm:inset-6 lg:inset-8" />
                  
                  {/* Middle Circle */}
                  <div className="absolute inset-12 rounded-full border-[14px] border-primary-200 sm:inset-16 lg:inset-20" />
                  
                  {/* Inner Circle */}
                  <div className="absolute inset-20 flex flex-col items-center justify-center gap-2 rounded-full border-[12px] border-primary/80 bg-container shadow-lg sm:inset-24 lg:inset-28">
                    <span className="text-base font-bold text-text-primary sm:text-lg lg:text-xl">AI 推荐</span>
                    <span className="text-xs text-text-secondary sm:text-sm">驱动邻里循环</span>
                  </div>
                  
                  {/* Labels */}
                  <div className="absolute left-1/2 top-2 flex -translate-x-1/2 items-center gap-1.5 text-xs font-medium text-primary sm:top-3 sm:text-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                    <span>社群活动</span>
                  </div>
                  
                  <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1.5 text-xs font-medium text-primary sm:right-3 sm:text-sm">
                    <span>即时履约</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                  </div>
                  
                  <div className="absolute left-2 top-1/2 flex -translate-y-1/2 items-center gap-1.5 text-xs font-medium text-primary sm:left-3 sm:text-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                    <span>邻里信任</span>
                  </div>
                  
                  <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 text-xs font-medium text-primary sm:bottom-6 sm:text-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                    <span>智能柜数据</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Capability Cards Section */}
      <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="container-lago">
          <ScrollReveal>
            <div className="text-center">
              <h2 className="section-title">
                智能循环，连接每一个社区触点
              </h2>
              <p className="section-subtitle">
                硬件、软件与用户端同步升级，让物业、运营团队与家庭住户共享同一套体验与数据。
              </p>
            </div>
          </ScrollReveal>
          
          <div className="mt-10 grid gap-6 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {capabilityCards.map((card, index) => (
              <ScrollReveal key={card.title} delay={index * 0.1}>
                <div className="card-hover flex h-full flex-col rounded-card-xl p-6 sm:p-8">
                  <div className="text-4xl sm:text-5xl">{card.icon}</div>
                  <h3 className="mt-6 text-xl font-semibold text-text-primary sm:text-2xl">{card.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-text-secondary sm:text-base">{card.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* AI Core Section */}
      <section id="ai-core" className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
        <div className="container-lago">
          <ScrollReveal>
            <div className="text-center">
              <h2 className="section-title">
                AI 中枢 · 产品底座
              </h2>
              <p className="section-subtitle">
                Lago 的 AI 内嵌于产品流程，连接推荐、搜索与运营决策，让团队以更少人力跑出更高效率。
              </p>
            </div>
          </ScrollReveal>
          
          <div className="mt-10 grid gap-8 lg:mt-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-12">
            {/* Left: Steps List */}
            <ScrollReveal>
              <div className="space-y-4 sm:space-y-5">
                {aiSteps.map((step, index) => (
                  <div
                    key={step.title}
                    className="card-hover flex items-start gap-4 rounded-card-xl sm:gap-5 sm:p-6"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-50 text-base font-bold text-primary sm:h-14 sm:w-14 sm:text-lg">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-text-primary sm:text-lg lg:text-xl">
                        {step.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-text-secondary sm:text-base">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollReveal>
            
            {/* Right: Illustration */}
            <ScrollReveal delay={0.2}>
              <div className="relative mt-8 lg:mt-0">
                <div className="relative overflow-hidden rounded-card-xl bg-gradient-card p-8 shadow-elevated-lg sm:p-10 lg:p-12">
                  {/* Decorative Blur Circles */}
                  <div className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
                  <div className="pointer-events-none absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-accent/20 blur-3xl" />
                  
                  {/* Content */}
                  <div className="relative mx-auto max-w-xs text-center">
                    <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-container shadow-lg sm:h-28 sm:w-28">
                      <span className="text-4xl sm:text-5xl">🤝</span>
                    </div>
                    <h3 className="mt-6 text-xl font-semibold text-text-primary sm:text-2xl">
                      邻里互动不断线
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-text-secondary sm:text-base">
                      AI 将线下体验、线上沟通与履约节点串联，让每一次共享都建立在信任与数据之上。
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Partnership Section */}
      <section id="partnership" className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
        <div className="container-lago">
          <ScrollReveal>
            <div className="text-center">
              <h2 className="section-title">
                Woy 与 Lago 的双赢合作
              </h2>
              <p className="section-subtitle">
                物业、品牌与 Lago 联合共建，以更低的投入获得更高的服务满意度与资产复用效率。
              </p>
            </div>
          </ScrollReveal>
          
          <div className="mt-10 grid gap-6 sm:mt-12 sm:grid-cols-2 lg:gap-8">
            {partnerBenefits.map((item, index) => (
              <ScrollReveal key={item.title} delay={index * 0.1}>
                <div className="card-hover flex h-full flex-col rounded-card-xl p-6 shadow-xl sm:p-8">
                  <h3 className="text-xl font-semibold text-text-primary sm:text-2xl">{item.title}</h3>
                  <ul className="mt-5 space-y-3 sm:mt-6 sm:space-y-4">
                    {item.points.map((point, pointIndex) => (
                      <li key={pointIndex} className="flex items-start gap-3">
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary sm:mt-2 sm:h-2.5 sm:w-2.5" />
                        <span className="text-sm leading-relaxed text-text-secondary sm:text-base">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-primary-50 bg-container/90 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="container-lago text-center">
          <p className="text-sm text-text-secondary sm:text-base">
            © 2025 Lago 来购 · 社区共享经济平台 · 让闲置物品在邻里之间高效循环
          </p>
        </div>
      </footer>
    </div>
  );
}
