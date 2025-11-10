"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, SingleMediaUploader, UploadedMedia } from "@lago/ui";
import toast from "react-hot-toast";
import {
  useAdminMallBanners,
  useAdminMallBanner,
  useAdminMallBannerUpdate,
  adminMallBannerDelete,
} from "@/lib/apis";
import { defaultUploadHandler } from "@/lib/upload";

const STATUS_OPTIONS = [
  { label: "全部状态", value: "" },
  { label: "启用", value: "active" },
  { label: "停用", value: "inactive" },
];

const STATUS_BADGE: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-600",
  inactive: "bg-gray-100 text-gray-600",
};

interface MallBannerForm {
  id?: string;
  title: string;
  image: UploadedMedia | null;
  linkUrl: string;
  status: "active" | "inactive";
  sortOrder: number;
}

function createEmptyBannerForm(): MallBannerForm {
  return {
    id: undefined,
    title: "",
    image: null,
    linkUrl: "",
    status: "active",
    sortOrder: 0,
  };
}

function bannerImageFromUrl(url: string): UploadedMedia {
  const name = url.split("/").pop() || "banner-image";
  return {
    url,
    name,
    size: 0,
    mimeType: "image/*",
    kind: "image",
  };
}

export default function MallBannersPage() {
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<MallBannerForm>(() =>
    createEmptyBannerForm()
  );

  const hasPermission = useMemo(() => {
    if (!user) return false;
    if ((user as any)?.isSuperAdmin) return true;
    const permissions: string[] = Array.isArray((user as any)?.permissions)
      ? ((user as any)?.permissions as string[])
      : [];
    if (permissions.includes("*")) return true;
    return permissions.includes("mall_banners:manage");
  }, [user]);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
    }
  }, [isLoggedIn, router]);

  const bannersQuery = useAdminMallBanners(
    {
      page,
      limit: 50,
      status: statusFilter ? (statusFilter as any) : undefined,
    },
    { queryKey: ["mallbanners"], enabled: isLoggedIn && hasPermission }
  );

  const createMutation = useAdminMallBanner();
  const updateMutation = useAdminMallBannerUpdate({ id: form.id || "" });

  const handleOpenCreate = () => {
    setForm(createEmptyBannerForm());
    setFormOpen(true);
  };

  const handleEdit = (banner: any) => {
    setForm({
      id: banner.id,
      title: banner.title ?? "",
      image: banner.imageUrl ? bannerImageFromUrl(banner.imageUrl) : null,
      linkUrl: banner.linkUrl ?? "",
      status: banner.status ?? "active",
      sortOrder: banner.sortOrder ?? 0,
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setForm(createEmptyBannerForm());
    setFormOpen(false);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const payload = {
        title: form.title.trim(),
        imageUrl: form.image?.url || "",
        linkUrl: form.linkUrl?.trim() || undefined,
        status: form.status,
        sortOrder: Number(form.sortOrder) || 0,
      };

      if (!payload.title) {
        toast.error("请输入标题");
        return;
      }

      if (!payload.imageUrl) {
        toast.error("请上传图片");
        return;
      }

      if (form.id) {
        await updateMutation.mutateAsync(payload);
        toast.success("钻石位已更新");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("钻石位已创建");
      }

      closeForm();
      bannersQuery.refetch();
    } catch (error: any) {
      console.error("保存钻石位失败:", error);
      toast.error(error?.response?.data?.error || "保存失败");
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm("确定删除该钻石位？")) return;
    try {
      await adminMallBannerDelete({ id });
      toast.success("已删除");
      bannersQuery.refetch();
    } catch (error: any) {
      console.error("删除钻石位失败:", error);
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

  const banners = bannersQuery.data?.data?.banners || [];
  const pagination = bannersQuery.data?.data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">商城钻石位</h1>
          <p className="text-sm text-gray-500">
            管理首页 Banner，支持上传图片和跳转链接。
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90"
        >
          新建钻石位
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
              {STATUS_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setStatusFilter("");
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
        {bannersQuery.isLoading ? (
          <div className="py-16 text-center text-gray-500">加载中...</div>
        ) : banners.length === 0 ? (
          <div className="py-16 text-center text-gray-400">暂无钻石位</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {banners.map((banner: any) => (
              <div
                key={banner.id}
                className="p-5 flex flex-col md:flex-row gap-4"
              >
                <div className="flex-1 flex gap-4">
                  <div className="w-20 h-20 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                    {banner.imageUrl ? (
                      <img
                        src={banner.imageUrl}
                        alt={banner.title}
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
                        {banner.title}
                      </h3>
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          STATUS_BADGE[banner.status] || STATUS_BADGE.active
                        }`}
                      >
                        {banner.status === "active" ? "启用" : "停用"}
                      </span>
                    </div>
                    {banner.linkUrl && (
                      <a
                        href={banner.linkUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary break-all"
                      >
                        {banner.linkUrl}
                      </a>
                    )}
                    <p className="text-xs text-gray-400">
                      排序：{banner.sortOrder ?? 0}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 md:justify-end">
                  <button
                    onClick={() => handleEdit(banner)}
                    className="px-3 py-1 rounded-lg border border-primary text-primary hover:bg-primary/5"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleRemove(banner.id)}
                    className="px-3 py-1 rounded-lg border border-red-200 text-red-500 hover:bg-red-50"
                  >
                    删除
                  </button>
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
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {form.id ? "编辑钻石位" : "新建钻石位"}
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
                  标题
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
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Banner 图片
                </p>
                <SingleMediaUploader
                  value={form.image}
                  onChange={(media) =>
                    setForm((prev) => ({
                      ...prev,
                      image: media,
                    }))
                  }
                  accept="image"
                  uploadHandler={defaultUploadHandler}
                  placeholder="上传或拖拽图片"
                  buttonText="上传图片"
                  allowRemove
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  跳转链接（可选）
                </label>
                <input
                  value={form.linkUrl}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      linkUrl: event.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="https://example.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    状态
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
                    <option value="active">启用</option>
                    <option value="inactive">停用</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    排序
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.sortOrder}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        sortOrder: Number(event.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
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
