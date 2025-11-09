"use client";

import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useAuth } from "@lago/ui";
import { useAuthMe } from "@/lib/apis/auth";
import {
  ShoppingBag,
  Heart,
  Package,
  MapPin,
  Shield,
  Settings,
  LogOut,
  Building2,
} from "lucide-react";
import { useAuthLogout } from "@/lib/apis/auth";
import toast from "react-hot-toast";
import { ProtectedRoute } from "@lago/ui";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const { data: userData } = useAuthMe();
  const logoutMutation = useAuthLogout();

  const currentUser = userData?.data?.user || user;

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync(null);
      setUser(null);
      router.push("/login");
      toast.success("已退出登录");
    } catch (error: any) {
      toast.error(error.message || "退出登录失败");
    }
  };

  const menuItems = [
    {
      icon: ShoppingBag,
      label: "我的订单",
      onClick: () => router.push("/profile/orders"),
      count: 0,
    },
    {
      icon: Heart,
      label: "我的收藏",
      onClick: () => router.push("/profile/favorites"),
      count: 0,
    },
    {
      icon: Package,
      label: "我的发布",
      onClick: () => router.push("/profile/products"),
      count: 0,
    },
    {
      icon: MapPin,
      label: "小区管理",
      onClick: () => router.push("/communities/select"),
    },
    {
      icon: Building2,
      label: "入驻中心",
      onClick: () => router.push("/profile/onboarding"),
    },
    {
      icon: Shield,
      label: "信用积分",
      onClick: () => router.push("/profile/credit"),
    },
    {
      icon: Settings,
      label: "设置",
      onClick: () => router.push("/profile/settings"),
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="我的" showBack={false} />

      <main className="max-w-7xl mx-auto px-4 py-4">
        {/* 用户信息卡片 */}
        <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
              {currentUser?.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.nickname || "用户"}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <span className="text-2xl">
                    {currentUser?.nickname?.[0] || "用"}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-text-primary mb-1">
                {currentUser?.nickname || "未设置昵称"}
              </h2>
              <div className="flex items-center gap-4 text-sm text-text-secondary">
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  <span>信用: {currentUser?.creditScore || 0}</span>
                </div>
                {currentUser?.isVerified && (
                  <span className="text-primary text-xs">已认证</span>
                )}
              </div>
            </div>
            <button
              onClick={() => router.push("/profile/edit")}
              className="text-sm text-primary"
            >
              编辑
            </button>
          </div>
        </div>

        {/* 快捷菜单 */}
        <div className="bg-white rounded-lg shadow-sm mb-4">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                onClick={item.onClick}
                className={`flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-text-secondary" />
                  <span className="text-text-primary">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.count !== undefined && item.count > 0 && (
                    <span className="text-xs text-text-secondary">
                      {item.count}
                    </span>
                  )}
                  <span className="text-text-secondary">›</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 退出登录 */}
        <button
          onClick={handleLogout}
          className="w-full px-4 py-3 bg-white rounded-lg shadow-sm text-red-500 font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          <span>退出登录</span>
        </button>
      </main>

      <BottomNavigation />
    </div>
  );
}
