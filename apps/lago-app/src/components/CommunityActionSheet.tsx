"use client";

import {
  X,
  Camera,
  RefreshCcw,
  Sparkles,
  Megaphone,
  Video,
  ChevronRight,
} from "lucide-react";

export type CommunityActionKey =
  | "publish"
  | "resell"
  | "skill"
  | "community-post"
  | "community-live";

interface CommunityAction {
  id: CommunityActionKey;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
  badge?: string;
}

interface CommunityActionSheetProps {
  open: boolean;
  onClose: () => void;
  onAction: (action: CommunityActionKey) => void;
  checkingOnboarding?: boolean;
}

const SELF_ACTIONS: CommunityAction[] = [
  {
    id: "publish",
    title: "发闲置",
    description: "自己拍图卖，轻松换现金",
    icon: Camera,
    highlight: true,
    badge: "推荐",
  },
  {
    id: "resell",
    title: "一键转卖",
    description: "快速转卖买到的好物",
    icon: RefreshCcw,
  },
  {
    id: "skill",
    title: "发技能",
    description: "发布技能服务赚取收益",
    icon: Sparkles,
  },
];

const COMMUNITY_ACTIONS: CommunityAction[] = [
  {
    id: "community-post",
    title: "发布动态",
    description: "发布公告或社区通知",
    icon: Megaphone,
  },
  {
    id: "community-live",
    title: "开启直播",
    description: "面向小区住户开展实时直播",
    icon: Video,
  },
];

function ActionCard({
  action,
  onClick,
  disabled,
}: {
  action: CommunityAction;
  onClick: (id: CommunityActionKey) => void;
  disabled?: boolean;
}) {
  const Icon = action.icon;

  const baseClasses =
    "w-full rounded-3xl px-5 py-4 flex items-center justify-between transition-colors border shadow-sm text-left";
  const variantClasses = action.highlight
    ? "bg-gradient-to-r from-primary to-primary/80 text-white border-transparent shadow-lg"
    : "bg-white/90 text-text-primary border-transparent hover:border-primary/20";

  return (
    <button
      type="button"
      onClick={() => onClick(action.id)}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses} ${
        disabled ? "opacity-60 cursor-not-allowed" : "hover:shadow-md"
      }`}
    >
      <div className="flex items-center gap-4">
        <span
          className={`flex items-center justify-center w-12 h-12 rounded-2xl ${
            action.highlight ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
          }`}
        >
          <Icon className="w-6 h-6" />
        </span>
        <div>
          <div className="flex items-center gap-2">
            <h4
              className={`text-base font-semibold ${
                action.highlight ? "text-white" : "text-text-primary"
              }`}
            >
              {action.title}
            </h4>
            {action.badge && (
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                  action.highlight ? "bg-white/25 text-white" : "bg-primary/10 text-primary"
                }`}
              >
                {action.badge}
              </span>
            )}
          </div>
          <p
            className={`text-xs mt-1 ${
              action.highlight ? "text-white/80" : "text-text-secondary"
            }`}
          >
            {action.description}
          </p>
        </div>
      </div>
      <ChevronRight
        className={`w-5 h-5 ${
          action.highlight ? "text-white/70" : "text-primary/60"
        }`}
      />
    </button>
  );
}

export function CommunityActionSheet({
  open,
  onClose,
  onAction,
  checkingOnboarding,
}: CommunityActionSheetProps) {
  if (!open) return null;

  const handleBackdropClick = () => {
    onClose();
  };

  const handleContainerClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest('button')) {
      return;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70]">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={handleBackdropClick}
      />

      <div
        className="relative z-10 flex flex-col min-h-full bg-gradient-to-b from-blue-50 via-white to-white"
        onClick={handleContainerClick}
      >
        <header className="px-6 pt-14 pb-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 text-xs text-primary shadow-sm">
            <span>社区协作中心</span>
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-slate-900 tracking-wide">
              搭建活力社区
            </h2>
            <p className="text-sm text-slate-500 leading-6">
              发布闲置、动态或直播互动，让社区成员保持紧密联系。
            </p>
          </div>
        </header>

        <main className="flex-1 px-6 pb-28 space-y-10 overflow-y-auto">
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  自己卖
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  AI 帮助快速生成标题与描述
                </p>
              </div>
              {checkingOnboarding && (
                <span className="text-xs text-primary animate-pulse">
                  检查入驻状态...
                </span>
              )}
            </div>
            <div className="space-y-3">
              {SELF_ACTIONS.map((action) => (
                <ActionCard
                  key={action.id}
                  action={action}
                  onClick={onAction}
                  disabled={checkingOnboarding}
                />
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">小区互动</h3>
              <p className="text-xs text-slate-500 mt-1">
                与社区成员保持沟通，发布动态或开启直播
              </p>
            </div>
            <div className="space-y-3">
              {COMMUNITY_ACTIONS.map((action) => (
                <ActionCard
                  key={action.id}
                  action={action}
                  onClick={onAction}
                />
              ))}
            </div>
          </section>
        </main>

        <div className="absolute bottom-10 inset-x-0 flex justify-center">
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭操作面板"
            className="w-12 h-12 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-slate-600 hover:bg-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
