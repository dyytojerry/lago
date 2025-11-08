"use client";

import { useMemo, useState } from "react";
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

  const menuItems = useMemo(() => {
    return [
      {
        title: "仪表盘",
        path: "/admin/dashboard",
        icon: "📊",
        permission: "dashboard:view",
      },
      {
        title: "商品审核",
        path: "/admin/products",
        icon: "📦",
        permission: "products:review",
      },
      {
        title: "小区管理",
        path: "/admin/communities",
        icon: "🏘️",
        permission: "communities:manage",
      },
      {
        title: "用户管理",
        path: "/admin/users",
        icon: "👥",
        permission: "users:manage",
      },
      {
        title: "订单管理",
        path: "/admin/orders",
        icon: "🛒",
        permission: "orders:manage",
      },
      {
        title: "入驻管理",
        path: "/admin/onboarding",
        icon: "✅",
        permission: "approvals:review",
      },
      {
        title: "数据看板",
        path: "/admin/analytics",
        icon: "📈",
        permission: "analytics:view",
      },
      {
        title: "财务结算",
        path: "/admin/finance",
        icon: "💰",
        permission: "finance:manage",
      },
      {
        title: "系统设置",
        path: "/admin/settings",
        icon: "⚙️",
        permission: "system:roles",
      },
      {
        title: "角色权限",
        path: "/admin/system/roles",
        icon: "🛠️",
        permission: "system:roles",
      },
      {
        title: "员工角色",
        path: "/admin/system/staff-roles",
        icon: "👤",
        permission: "system:staff_roles",
      },
    ].filter((item) => {
      if (!isLoggedIn) return false;
      if (user?.isSuperAdmin) return true;
      return user?.permissions?.includes(item.permission);
    })
  }, [isLoggedIn, user]);

  const displayName = user?.realName || user?.username || user?.email;
  const roleNames = Array.isArray(user?.roles)
    ? user.roles.map((role: any) => (typeof role === "string" ? role : role?.name)).filter(Boolean)
    : [];

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
              <span className="font-medium">{displayName}</span>
              <span className="ml-2 text-gray-400">
                ({roleNames.length > 0 ? roleNames.join(", ") : "无角色"})
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
