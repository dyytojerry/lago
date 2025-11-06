"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { ArrowLeftCircle } from "lucide-react";
import { useWechatAuth } from "@lago/common";

type LoginMethod = "password" | "phone" | "email" | "wechat";

export interface AuthForm {
  nickname: string;
  phone?: string;
  email?: string;
  wechatOpenid?: string;
  password?: string;
}
interface LoginMethodDialogProps {
  readonly onClose?: () => void;
  readonly onSubmit?: (loginData: AuthForm) => void;
  readonly onChange: (account: AuthForm) => void;
  readonly account: AuthForm;
  readonly titleClassName?: string;
  readonly quickLogin?: boolean;
}

// 登录方式选择对话框组件
export default function LoginMethod({
  onClose,
  onSubmit,
  onChange,
  account,
  titleClassName = "",
  quickLogin = false,
}: LoginMethodDialogProps) {
  const [loginMethod, setLoginMethod] = useState<LoginMethod | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWechatLoading, setIsWechatLoading] = useState(false);
  const { startAuth, isWechatBrowser } = useWechatAuth();
  const loginMethods = [
    {
      key: "password" as LoginMethod,
      label: "密码登录",
      icon: "🔐",
      enabled: !quickLogin, // 隐藏密码登录选项
    },
    {
      key: "phone" as LoginMethod,
      label: "手机号登录",
      icon: "📱",
      enabled: true,
    },
    {
      key: "email" as LoginMethod,
      label: "邮箱登录",
      icon: "📧",
      enabled: true,
    },
    {
      key: "wechat" as LoginMethod,
      label: isWechatBrowser ? "微信授权登录" : "微信扫码登录",
      icon: "💬",
      enabled: false,
    },
  ];
  const handleSubmit = async () => {
    if (!quickLogin) {
      if (!account.nickname) {
        toast.error("请填写昵称");
        return;
      }
    }

    // 根据登录方式验证相应的字段
    if (loginMethod === "phone" && !account.phone) {
      toast.error("请填写手机号");
      return;
    }

    if (loginMethod === "email" && !account.email) {
      toast.error("请填写邮箱");
      return;
    }

    if (loginMethod === "password" && !account.password) {
      toast.error("请填写密码");
      return;
    }

    try {
      setIsSubmitting(true);

      onSubmit?.(account);
      onClose?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "登录失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 处理微信登录
  const handleWechatLogin = async () => {
    if (isWechatLoading) return;

    setIsWechatLoading(true);

    try {
      // 微信登录流程：
      // 1. 在微信浏览器中：直接跳转到授权页面
      // 2. 在普通浏览器中：打开新窗口进行授权，然后监听结果
      await startAuth(
        (userInfo: any) => {
          // 非微信浏览器环境下的成功回调
          // 构建登录数据
          const loginData = {
            ...account,
            wechatOpenid: userInfo.openid,
            nickname: userInfo.nickname,
          };

          // 提交登录数据
          onSubmit?.(loginData);
          onClose?.();
          setIsWechatLoading(false);
        },
        (error: string) => {
          toast.error(error);
          setIsWechatLoading(false);
        }
      );
    } catch (error) {
      console.error("微信登录失败:", error);
      toast.error("微信登录失败，请重试");
      setIsWechatLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-text-primary ${titleClassName}`}>
          {!loginMethod ? (
            "选择登录方式"
          ) : (
            <div className="flex items-center space-x-2">
              <ArrowLeftCircle
                className="w-4 h-4"
                onClick={() => setLoginMethod(null)}
              />
              <span>选择登录方式</span>
            </div>
          )}
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      <div className="space-y-3">
        {loginMethod ? (
          <>
            {/* 根据登录方式显示不同的输入组件 */}
            {loginMethod === "phone" && (
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-text-primary mb-2"
                >
                  手机号 *
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={account.phone || ""}
                  onChange={(e) =>
                    onChange({ ...account, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-primary-coral focus:border-transparent"
                  placeholder="输入手机号"
                  required
                />
              </div>
            )}

            {loginMethod === "email" && (
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-text-primary mb-2"
                >
                  邮箱 *
                </label>
                <input
                  id="email"
                  type="email"
                  value={account.email || ""}
                  onChange={(e) =>
                    onChange({ ...account, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-primary-coral focus:border-transparent"
                  placeholder="输入邮箱"
                  required
                />
              </div>
            )}

            {loginMethod === "password" && (
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-text-primary mb-2"
                >
                  密码 *
                </label>
                <input
                  id="password"
                  type="password"
                  value={account.password || ""}
                  onChange={(e) =>
                    onChange({ ...account, password: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-primary-coral focus:border-transparent"
                  placeholder="输入密码"
                  required
                />
              </div>
            )}
            {onSubmit && (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-accent-blue text-white py-3 rounded-lg hover:bg-accent-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isSubmitting ? "登录中..." : "登录"}
              </button>
            )}
          </>
        ) : (
          loginMethods.map((method) =>
            !method.enabled ? null : (
              <button
                key={method.key}
                onClick={() => {
                  if (method.enabled) {
                    if (method.key === "wechat") {
                      handleWechatLogin();
                    } else {
                      setLoginMethod(method.key);
                    }
                  }
                }}
                disabled={
                  !method.enabled ||
                  (method.key === "wechat" && isWechatLoading)
                }
                className={`w-full p-4 rounded-lg border text-left transition-colors ${
                  method.enabled
                    ? "border-border-light hover:bg-gray-50"
                    : "border-gray-200 bg-gray-50 cursor-not-allowed opacity-50"
                } ${method.key === "wechat" && isWechatLoading ? "opacity-50" : ""}`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{method.icon}</span>
                  <div>
                    <div className="font-medium text-text-primary">
                      {method.label}
                    </div>
                    {!method.enabled && (
                      <div className="text-sm text-text-secondary">
                        暂未开放
                      </div>
                    )}
                    {method.key === "wechat" && isWechatLoading && (
                      <div className="text-sm text-primary-coral">
                        正在授权...
                      </div>
                    )}
                  </div>
                </div>
              </button>
            )
          )
        )}
      </div>
    </>
  );
}
