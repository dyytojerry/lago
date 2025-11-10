"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@lago/ui";
import toast from "react-hot-toast";
import {
  useAdminConsignments,
  adminConsignmentUpdate,
} from "@/lib/apis/mallconsignments";
import { adminMallProduct } from "@/lib/apis/mallproducts";

const STATUS_LABEL: Record<string, string> = {
  submitted: "已提交",
  received: "已收货",
  refurbishing: "整修中",
  listed: "已上架",
  sold: "已售出",
  settled: "已结算",
  cancelled: "已取消",
};

const STATUS_OPTIONS = Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label }));

export default function MallConsignmentsPage() {
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [page, setPage] = useState(1);
  const [autoCreating, setAutoCreating] = useState(false);

  const hasPermission = useMemo(() => {
    if (!user) return false;
    if ((user as any)?.isSuperAdmin) return true;
    const permissions: string[] = Array.isArray((user as any)?.permissions)
      ? ((user as any)?.permissions as string[])
      : [];
    if (permissions.includes("*")) return true;
    return permissions.includes("mall_consignments:manage");
  }, [user]);

  useEffect(() => {
    if (!isLoggedIn) router.push("/login");
  }, [isLoggedIn, router]);

  const consignmentsQuery = useAdminConsignments(
    {
      page,
      limit: 20,
      status: statusFilter ? (statusFilter as any) : undefined,
      search: searchKeyword || undefined,
    },
    { enabled: isLoggedIn && hasPermission }
  );

  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      await adminConsignmentUpdate({ id: orderId }, { status: status as any });
      toast.success("状态已更新");
      consignmentsQuery.refetch();
    } catch (error: any) {
      console.error('更新状态失败:', error);
      toast.error(error?.response?.data?.error || "更新失败");
    }
  };

  const handleAssignSelf = async (orderId: string) => {
    try {
      await adminConsignmentUpdate({ id: orderId }, { assignedStaffId: null });
      toast.success("已接单");
      consignmentsQuery.refetch();
    } catch (error: any) {
      console.error('接单失败:', error);
      toast.error(error?.response?.data?.error || "操作失败");
    }
  };

  const handleAutoCreateProduct = async (order: any) => {
    try {
      if (order.mallProductId) {
        toast('已关联商城商品');
        return;
      }
      setAutoCreating(true);
      const payload = {
        title: order.productTitle || '寄售商品',
        description: order.description || '',
        price: Number(order.expectedPrice || 0) || 1,
        images: Array.isArray(order.productImages) ? order.productImages : [],
        visibleCommunityIds: [],
        status: 'draft' as const,
      };
      const result = await adminMallProduct(payload);
      const createdId = result?.data?.product?.id;
      if (createdId) {
        await adminConsignmentUpdate({ id: order.id }, { mallProductId: createdId });
        toast.success("已生成商城商品并关联");
        consignmentsQuery.refetch();
      } else {
        toast.success("已创建商城商品");
      }
    } catch (error: any) {
      console.error('生成商城商品失败:', error);
      toast.error(error?.response?.data?.error || "生成失败");
    } finally {
      setAutoCreating(false);
    }
  };

  if (!isLoggedIn) return null;
  if (!hasPermission) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-sm">
        <h1 className="text-xl font-semibold text-gray-800 mb-2">无权限访问</h1>
        <p className="text-gray-500 text-sm">请联系管理员授予“商城运营”相关权限。</p>
      </div>
    );
  }

  const orders = consignmentsQuery.data?.data?.orders || [];
  const pagination = consignmentsQuery.data?.data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">寄售管理</h1>
          <p className="text-sm text-gray-500">处理用户提交的寄售订单，支持生成商城商品并跟进状态。</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">全部状态</option>
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">搜索</label>
            <input
              value={searchKeyword}
              onChange={(event) => {
                setSearchKeyword(event.target.value);
                setPage(1);
              }}
              placeholder="商品标题、用户昵称或手机号"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setStatusFilter("");
                setSearchKeyword("");
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
            >
              重置
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        {consignmentsQuery.isLoading ? (
          <div className="py-16 text-center text-gray-500">加载中...</div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-gray-400">暂无寄售订单</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {orders.map((order: any) => {
              const statusBadge = STATUS_LABEL[order.status] || order.status;
              return (
                <div key={order.id} className="p-5 space-y-4">
                  <div className="flex flex-wrap justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">{order.productTitle}</h3>
                        <span className="px-2 py-0.5 text-xs rounded-full bg-blue-50 text-blue-600">
                          {statusBadge}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        用户：{order.user?.nickname || '匿名'} / {order.user?.phone || '--'}
                      </p>
                      {order.description && (
                        <p className="text-sm text-gray-500">描述：{order.description}</p>
                      )}
                      <p className="text-sm text-gray-500">
                        期望价格：¥{order.expectedPrice ? Number(order.expectedPrice).toFixed(2) : '--'}
                      </p>
                      <p className="text-xs text-gray-400">
                        创建时间：{new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 min-w-[200px]">
                      <div className="flex gap-2 items-center">
                        <select
                          value={order.status}
                          onChange={(event) => handleStatusChange(order.id, event.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                          {STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleAssignSelf(order.id)}
                          className="px-3 py-2 text-sm border border-primary text-primary rounded-lg hover:bg-primary/5"
                        >
                          接单
                        </button>
                      </div>
                      <div className="flex gap-2 text-xs text-gray-500">
                        <span>负责人：{order.assignedStaff?.realName || order.assignedStaff?.username || '未分配'}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAutoCreateProduct(order)}
                          className="px-3 py-2 text-sm border border-amber-300 text-amber-600 rounded-lg hover:bg-amber-50 disabled:opacity-60"
                          disabled={autoCreating}
                        >
                          {order.mallProduct ? '已关联商品' : autoCreating ? '生成中...' : '生成商城商品'}
                        </button>
                        {order.mallProduct?.id && (
                          <a
                            href={`/admin/mall/products?highlight=${order.mallProduct.id}`}
                            className="px-3 py-2 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50"
                          >
                            查看商品
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="px-5 py-4 flex items-center justify-between text-sm text-gray-500">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-gray-200 rounded-lg disabled:opacity-60"
            >
              上一页
            </button>
            <span>
              第 {page} / {pagination.totalPages} 页
            </span>
            <button
              onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
              disabled={page === pagination.totalPages}
              className="px-3 py-1 border border-gray-200 rounded-lg disabled:opacity-60"
            >
              下一页
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
