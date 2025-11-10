"use client";

import { useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@lago/ui";
import Link from "next/link";

interface LayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  title: string;
  icon?: string;
  path?: string;
  permission?: string;
  children?: MenuItem[];
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn, user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const hasPermission = (permission?: string) => {
    if (!permission) return true;
    if (!isLoggedIn) return false;
    if (user?.isSuperAdmin) return true;
    const permissions: string[] = Array.isArray((user as any)?.permissions)
      ? ((user as any)?.permissions as string[])
      : [];
    if (permissions.includes("*")) return true;
    return permissions.includes(permission);
  };

  const menuItems = useMemo(() => {
    const rawMenu: MenuItem[] = [
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
        title: "商城运营",
        icon: "🛍️",
        permission: undefined,
        children: [
          {
            title: "商城商品",
            path: "/admin/mall/products",
            icon: "🛒",
            permission: "mall_products:manage",
          },
          {
            title: "商城活动",
            path: "/admin/mall/activities",
            icon: "🎉",
            permission: "mall_activities:manage",
          },
          {
            title: "商城钻石位",
            path: "/admin/mall/banners",
            icon: "💎",
            permission: "mall_banners:manage",
          },
          {
            title: "寄售管理",
            path: "/admin/mall/consignments",
            icon: "📦",
            permission: "mall_consignments:manage",
          },
        ],
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
    ];

    const filtered = rawMenu
      .map((item) => {
        if (item.children && item.children.length > 0) {
          const visibleChildren = item.children.filter((child) => hasPermission(child.permission));
          if (!isLoggedIn || visibleChildren.length === 0) {
            return null;
          }
          return { ...item, children: visibleChildren } as MenuItem;
        }

        if (!hasPermission(item.permission)) {
          return null;
        }
        return item;
      })
      .filter(Boolean) as MenuItem[];

    return filtered;
  }, [isLoggedIn, user]);

  const handleToggleGroup = (title: string) => {
    setOpenGroups((prev) => ({ ...prev, [title]: !prev[title] }));
  };

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
                const hasChildren = Array.isArray(item.children) && item.children.length > 0;

                if (hasChildren) {
                  const isExpanded = openGroups[item.title] ?? true;
                  const anyChildActive = item.children?.some((child) =>
                    pathname === child.path || pathname?.startsWith(child.path + "/")
                  );

                  return (
                    <li key={item.title} className="space-y-1">
                      <button
                        onClick={() => handleToggleGroup(item.title)}
                        className={`w-full flex items-center justify-between px-4 py-2 rounded-md text-left transition-colors ${
                          anyChildActive
                            ? "bg-blue-50 text-blue-600 font-medium"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          {item.icon && <span className="text-lg">{item.icon}</span>}
                          <span>{item.title}</span>
                        </span>
                        <span className="text-sm">{isExpanded ? "−" : "+"}</span>
                      </button>
                      {isExpanded && (
                        <ul className="pl-4 space-y-1">
                          {item.children?.map((child) => {
                            const childActive =
                              pathname === child.path || pathname?.startsWith(child.path + "/");
                            return (
                              <li key={child.path}>
                                <Link
                                  href={child.path!}
                                  className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
                                    childActive
                                      ? "bg-blue-50 text-blue-600 font-medium"
                                      : "text-gray-600 hover:bg-gray-100"
                                  }`}
                                >
                                  {child.icon && <span className="text-lg">{child.icon}</span>}
                                  <span>{child.title}</span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                }

                const isActive = pathname === item.path || pathname?.startsWith((item.path ?? '') + "/");
                return (
                  <li key={item.path}>
                    <Link
                      href={item.path!}
                      className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
                        isActive
                          ? "bg-blue-50 text-blue-600 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {item.icon && <span className="text-lg">{item.icon}</span>}
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
