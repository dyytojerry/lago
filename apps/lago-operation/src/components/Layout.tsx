"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@lago/ui";
import Link from "next/link";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn, user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const menuItems = [
    {
      title: "仪表盘",
      path: "/admin/dashboard",
      icon: "📊",
      roles: [
        "super_admin",
        "audit_staff",
        "service_staff",
        "operation_staff",
        "finance_staff",
      ],
    },
    {
      title: "商品审核",
      path: "/admin/products",
      icon: "📦",
      roles: ["super_admin", "audit_staff"],
    },
    {
      title: "小区管理",
      path: "/admin/communities",
      icon: "🏘️",
      roles: ["super_admin", "audit_staff"],
    },
    {
      title: "用户管理",
      path: "/admin/users",
      icon: "👥",
      roles: ["super_admin", "service_staff", "operation_staff"],
    },
    {
      title: "订单管理",
      path: "/admin/orders",
      icon: "🛒",
      roles: [
        "super_admin",
        "service_staff",
        "operation_staff",
        "finance_staff",
      ],
    },
    {
      title: "入驻审核",
      path: "/admin/approvals",
      icon: "✅",
      roles: ["super_admin", "audit_staff"],
    },
    {
      title: "数据看板",
      path: "/admin/analytics",
      icon: "📈",
      roles: ["super_admin", "operation_staff"],
    },
    {
      title: "财务结算",
      path: "/admin/finance",
      icon: "💰",
      roles: ["super_admin", "finance_staff"],
    },
    {
      title: "系统设置",
      path: "/admin/settings",
      icon: "⚙️",
      roles: ["super_admin"],
    },
  ].filter((item) => user?.roles.includes(item.roles));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <span className="text-xl">☰</span>
            </button>
            <h1 className="text-xl font-bold text-gray-900">Lago 运营系统</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{user?.name || user?.email}</span>
              <span className="ml-2 text-gray-400">
                ({user?.roles.join(",")})
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
            >
              退出
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`bg-white border-r border-gray-200 transition-all duration-300 ${
            sidebarOpen ? "w-64" : "w-0"
          } overflow-hidden`}
        >
          <nav className="p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const isActive =
                  pathname === item.path ||
                  pathname?.startsWith(item.path + "/");
                return (
                  <li key={item.path}>
                    <Link
                      href={item.path}
                      className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
                        isActive
                          ? "bg-blue-50 text-blue-600 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span>{item.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? "ml-0" : ""
          }`}
        >
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
