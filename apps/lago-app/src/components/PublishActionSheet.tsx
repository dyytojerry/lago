"use client";

import { Fragment } from "react";
import {
  X,
  Camera,
  RefreshCcw,
  Sparkles,
  Recycle,
  HandIcon,
  ChevronRight,
  Infinity,
} from "lucide-react";

export type PublishActionKey =
  | "publish"
  | "resell"
  | "skill"
  | "recycle"
  | "consignment";

interface PublishAction {
  id: PublishActionKey;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
  badge?: string;
}

interface PublishActionSheetProps {
  open: boolean;
  onClose: () => void;
  onAction: (action: PublishActionKey) => void;
  checkingOnboarding?: boolean;
}

const SELF_ACTIONS: PublishAction[] = [
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

const PLATFORM_ACTIONS: PublishAction[] = [
  {
    id: "recycle",
    title: "极速回收",
    description: "上门质检，立即结算",
    icon: Recycle,
  },
  {
    id: "consignment",
    title: "官方帮卖",
    description: "全程托管，省心售卖",
    icon: HandIcon,
  },
];

function ActionCard({
  action,
  onClick,
  disabled,
}: {
  action: PublishAction;
  onClick: (id: PublishActionKey) => void;
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
            action.highlight
              ? "bg-white/20 text-white"
              : "bg-primary/10 text-primary"
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
                  action.highlight
                    ? "bg-white/25 text-white"
                    : "bg-primary/10 text-primary"
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

export function PublishActionSheet({
  open,
  onClose,
  onAction,
  checkingOnboarding,
}: PublishActionSheetProps) {
  if (!open) return null;

  const handleBackdropClick = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70]">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={handleBackdropClick}
      />

      <div className="relative z-10 flex flex-col min-h-full bg-gradient-to-b from-amber-50 via-white to-white">
        <header className="px-6 pt-14 pb-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 text-xs text-primary shadow-sm">
            <Infinity className="w-3.5 h-3.5" />
            <span>社区闲置，一键变现</span>
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-slate-900 tracking-wide">
              来购赚点钱！
            </h2>
            <p className="text-sm text-slate-500 leading-6">
              选择合适的方式发布闲置或服务，平台为你匹配社区用户和优质买家。
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
                  AI 发布助手，拍照即可生成标题与描述
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
            <h3 className="text-base font-semibold text-slate-900">平台卖</h3>
            <div className="space-y-3">
              {PLATFORM_ACTIONS.map((action) => (
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
            aria-label="关闭发布面板"
            className="w-12 h-12 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-slate-600 hover:bg-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
