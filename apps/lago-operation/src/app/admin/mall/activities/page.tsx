"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@lago/ui";
import toast from "react-hot-toast";
import {
  useAdminMallActivities,
  useAdminMallActivitie,
  adminMallActivitieUpdate,
  adminMallActivitieDelete,
  adminCommunities,
} from "@/lib/apis";

const STATUS_OPTIONS = [
  { label: "全部状态", value: "" },
  { label: "草稿", value: "draft" },
  { label: "已发布", value: "published" },
  { label: "已下架", value: "offline" },
];

const STATUS_BADGE: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  published: "bg-emerald-100 text-emerald-600",
  offline: "bg-red-100 text-red-600",
};

const EMPTY_FORM = {
  id: undefined as string | undefined,
  title: "",
  description: "",
  coverImage: "",
  startTime: "",
  endTime: "",
  visibleCommunityIds: [] as string[],
  status: "draft" as "draft" | "published" | "offline",
};

function formatDateTime(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (num: number) => num.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toIso(value?: string) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

export default function MallActivitiesPage() {
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();
  const [statusFilter, setStatusFilter] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formOpen, setFormOpen] = useState(false);
  const [communities, setCommunities] = useState<any[]>([]);
  const [loadingCommunities, setLoadingCommunities] = useState(false);

  const hasPermission = useMemo(() => {
    if (!user) return false;
    if ((user as any)?.isSuperAdmin) return true;
    const permissions: string[] = Array.isArray((user as any)?.permissions)
      ? ((user as any)?.permissions as string[])
      : [];
    if (permissions.includes("*")) return true;
    return permissions.includes("mall_activities:manage");
  }, [user]);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
    }
  }, [isLoggedIn, router]);

  const activitiesQuery = useAdminMallActivities(
    {
      page,
      limit: 20,
      status: statusFilter ? (statusFilter as any) : undefined,
      search: searchKeyword || undefined,
    },
    { queryKey: ["mallactivities"], enabled: isLoggedIn && hasPermission }
  );

  const createMutation = useAdminMallActivitie();
  const updateMutation = useAdminMallActivitie();

  useEffect(() => {
    if (
      !isLoggedIn ||
      !hasPermission ||
      communities.length > 0 ||
      loadingCommunities
    )
      return;
    setLoadingCommunities(true);
    adminCommunities({ limit: 200, page: 1 } as any)
      .then((res) => setCommunities(res.data?.communities || []))
      .catch((error) => console.error("加载小区列表失败:", error))
      .finally(() => setLoadingCommunities(false));
  }, [isLoggedIn, hasPermission, communities.length, loadingCommunities]);

  const handleOpenCreate = () => {
    setForm(EMPTY_FORM);
    setFormOpen(true);
  };

  const handleEdit = (activity: any) => {
    setForm({
      id: activity.id,
      title: activity.title ?? "",
      description: activity.description ?? "",
      coverImage: activity.coverImage ?? "",
      startTime: formatDateTime(activity.startTime),
      endTime: formatDateTime(activity.endTime),
      visibleCommunityIds: activity.visibleCommunityIds ?? [],
      status: activity.status ?? "draft",
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setForm(EMPTY_FORM);
    setFormOpen(false);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description?.trim() || undefined,
        coverImage: form.coverImage?.trim() || undefined,
        startTime: toIso(form.startTime),
        endTime: toIso(form.endTime),
        visibleCommunityIds: form.visibleCommunityIds,
        status: form.status,
      };

      if (!payload.title) {
        toast.error("请输入活动标题");
        return;
      }

      if (form.id) {
        await updateMutation.mutateAsync(payload);
        toast.success("活动已更新");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("活动已创建");
      }

      closeForm();
      activitiesQuery.refetch();
    } catch (error: any) {
      console.error("保存活动失败:", error);
      toast.error(error?.response?.data?.error || "保存失败");
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm("确定要下架该活动吗？")) return;
    try {
      await adminMallActivitieDelete({ id });
      toast.success("活动已下架");
      activitiesQuery.refetch();
    } catch (error: any) {
      console.error("下架活动失败:", error);
      toast.error(error?.response?.data?.error || "操作失败");
    }
  };

  if (!isLoggedIn) return null;

  if (!hasPermission) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-sm">
        <h1 className="text-xl font-semibold text-gray-800 mb-2">无权限访问</h1>
        <p className="text-gray-500 text-sm">
          请联系管理员授予“商城运营”相关权限。
        </p>
      </div>
    );
  }

  const activities = activitiesQuery.data?.data?.activities || [];
  const pagination = activitiesQuery.data?.data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">商城活动管理</h1>
          <p className="text-sm text-gray-500">
            配置平台活动，支持按小区投放。
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90"
        >
          新建活动
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              状态
            </label>
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              关键词
            </label>
            <input
              value={searchKeyword}
              onChange={(event) => {
                setSearchKeyword(event.target.value);
                setPage(1);
              }}
              placeholder="输入活动标题或描述"
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
        {activitiesQuery.isLoading ? (
          <div className="py-16 text-center text-gray-500">加载中...</div>
        ) : activities.length === 0 ? (
          <div className="py-16 text-center text-gray-400">暂无活动</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {activities.map((activity: any) => (
              <div
                key={activity.id}
                className="p-5 flex flex-col md:flex-row gap-4"
              >
                <div className="flex-1 flex gap-4">
                  <div className="w-20 h-20 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                    {activity.coverImage ? (
                      <img
                        src={activity.coverImage}
                        alt={activity.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                        无图
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {activity.title}
                      </h3>
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          STATUS_BADGE[activity.status] || STATUS_BADGE.draft
                        }`}
                      >
                        {STATUS_OPTIONS.find(
                          (item) => item.value === activity.status
                        )?.label || activity.status}
                      </span>
                    </div>
                    {activity.description && (
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {activity.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-400">
                      时间：
                      {activity.startTime
                        ? new Date(activity.startTime).toLocaleString()
                        : "未设置"}
                      {activity.endTime
                        ? ` ~ ${new Date(activity.endTime).toLocaleString()}`
                        : ""}
                    </p>
                    <p className="text-xs text-gray-400">
                      可见小区：
                      {activity.visibleCommunityIds?.length
                        ? activity.visibleCommunityIds.length
                        : "全部"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 md:justify-end">
                  <button
                    onClick={() => handleEdit(activity)}
                    className="px-3 py-1 rounded-lg border border-primary text-primary hover:bg-primary/5"
                  >
                    编辑
                  </button>
                  {activity.status !== "offline" && (
                    <button
                      onClick={() => handleRemove(activity.id)}
                      className="px-3 py-1 rounded-lg border border-red-200 text-red-500 hover:bg-red-50"
                    >
                      下架
                    </button>
                  )}
                </div>
              </div>
            ))}
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

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeForm} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {form.id ? "编辑活动" : "新建活动"}
              </h2>
              <button
                onClick={closeForm}
                className="text-gray-400 hover:text-gray-600"
                aria-label="关闭"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  活动标题
                </label>
                <input
                  value={form.title}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, title: event.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  活动描述
                </label>
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  封面图 URL
                </label>
                <input
                  value={form.coverImage}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      coverImage: event.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="https://example.com/banner.jpg"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    开始时间
                  </label>
                  <input
                    type="datetime-local"
                    value={form.startTime}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        startTime: event.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    结束时间
                  </label>
                  <input
                    type="datetime-local"
                    value={form.endTime}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        endTime: event.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  发布状态
                </label>
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      status: event.target.value as typeof form.status,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="draft">草稿</option>
                  <option value="published">已发布</option>
                  <option value="offline">已下架</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  指定可见小区（留空表示全部）
                </label>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 space-y-2">
                  {loadingCommunities ? (
                    <div className="text-sm text-gray-400">
                      加载小区列表中...
                    </div>
                  ) : communities.length === 0 ? (
                    <div className="text-sm text-gray-400">暂无小区数据</div>
                  ) : (
                    communities.map((community) => {
                      const checked = form.visibleCommunityIds.includes(
                        community.id
                      );
                      return (
                        <label
                          key={community.id}
                          className="flex items-center gap-2 text-sm text-gray-600"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(event) => {
                              setForm((prev) => {
                                const next = new Set(prev.visibleCommunityIds);
                                if (event.target.checked) {
                                  next.add(community.id);
                                } else {
                                  next.delete(community.id);
                                }
                                return {
                                  ...prev,
                                  visibleCommunityIds: Array.from(next),
                                };
                              });
                            }}
                          />
                          <span>{community.name}</span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-60"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "保存中..."
                    : "保存"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
