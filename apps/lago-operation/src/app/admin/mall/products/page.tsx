"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@lago/ui";
import toast from "react-hot-toast";
import {
  adminMallProducts,
  adminMallProduct,
  adminMallProductUpdate,
  adminMallProductDelete,
} from "@/lib/apis";
import { adminCommunities } from "@/lib/apis/admincommunities";

interface MallProductForm {
  id?: string;
  title: string;
  description: string;
  price: string;
  images: string;
  visibleCommunityIds: string[];
  status: "draft" | "published" | "offline";
}

const STATUS_OPTIONS = [
  { value: "", label: "全部状态" },
  { value: "draft", label: "草稿" },
  { value: "published", label: "已发布" },
  { value: "offline", label: "已下架" },
];

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  published: "bg-emerald-100 text-emerald-600",
  offline: "bg-red-100 text-red-600",
};

const EMPTY_FORM: MallProductForm = {
  title: "",
  description: "",
  price: "",
  images: "",
  visibleCommunityIds: [],
  status: "draft",
};

export default function MallProductsPage() {
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchKeyword, setSearchKeyword] = useState<string>("");

  const [communities, setCommunities] = useState<any[]>([]);
  const [communityLoading, setCommunityLoading] = useState(false);

  const [form, setForm] = useState<MallProductForm>(EMPTY_FORM);
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
    }
  }, [isLoggedIn, router]);

  const hasMallPermission = useMemo(() => {
    if (!user) return false;
    if (user.isSuperAdmin) return true;
    const permissions: string[] = Array.isArray(user.permissions)
      ? (user.permissions as string[])
      : [];
    if (permissions.includes("*")) return true;
    return permissions.includes("mall_products:manage");
  }, [user]);

  useEffect(() => {
    if (!hasMallPermission && isLoggedIn) {
      toast.error("当前账号缺少商城运营权限");
    }
  }, [hasMallPermission, isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return;
    loadProducts();
  }, [page, statusFilter, searchKeyword, isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn || communityLoading || communities.length > 0) return;
    setCommunityLoading(true);
    adminCommunities({ limit: 200, page: 1 } as any)
      .then((res) => {
        setCommunities(res.data?.communities || []);
      })
      .catch((error) => {
        console.error("加载小区列表失败:", error);
      })
      .finally(() => setCommunityLoading(false));
  }, [isLoggedIn, communityLoading, communities.length]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await adminMallProducts({
        page,
        limit: 20,
        status: statusFilter ? (statusFilter as any) : undefined,
        search: searchKeyword || undefined,
      });
      setProducts(response.data?.products || []);
      setTotalPages(response.data?.pagination?.totalPages || 1);
    } catch (error) {
      console.error("加载商城商品失败:", error);
      toast.error("加载商城商品失败");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setForm(EMPTY_FORM);
    setFormOpen(true);
  };

  const handleEdit = (product: any) => {
    setForm({
      id: product.id,
      title: product.title || "",
      description: product.description || "",
      price: product.price ? String(product.price) : "",
      images: (product.images || []).join("\n"),
      visibleCommunityIds: product.visibleCommunityIds || [],
      status: product.status || "draft",
    });
    setFormOpen(true);
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setFormOpen(false);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        title: form.title.trim(),
        description: form.description?.trim() || undefined,
        price: Number(form.price),
        images: form.images
          .split(/\n|,/)
          .map((item) => item.trim())
          .filter(Boolean),
        visibleCommunityIds: form.visibleCommunityIds,
        status: form.status,
      };

      if (!payload.title) {
        toast.error("请输入商品标题");
        return;
      }
      if (Number.isNaN(payload.price) || payload.price <= 0) {
        toast.error("请输入正确的商品价格");
        return;
      }

      if (form.id) {
        await adminMallProductUpdate({ id: form.id }, payload);
        toast.success("商品已更新");
      } else {
        await adminMallProduct(payload);
        toast.success("商品已创建");
      }

      resetForm();
      await loadProducts();
    } catch (error: any) {
      console.error("保存商品失败:", error);
      toast.error(error?.response?.data?.error || "保存失败");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (productId: string) => {
    if (!confirm("确定要下架该商品吗？")) return;
    try {
      await adminMallProductDelete({ id: productId });
      toast.success("商品已下架");
      await loadProducts();
    } catch (error: any) {
      console.error("下架商品失败:", error);
      toast.error(error?.response?.data?.error || "操作失败");
    }
  };

  if (!isLoggedIn) {
    return null;
  }

  if (!hasMallPermission) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-sm">
        <h1 className="text-xl font-semibold text-gray-800 mb-2">无权限访问</h1>
        <p className="text-gray-500 text-sm">
          请联系超级管理员为当前账号分配“商城运营”相关权限。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">商城商品管理</h1>
          <p className="text-sm text-gray-500">
            发布平台自营商品，并可控制在指定小区展示。
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90"
        >
          新建商品
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
              placeholder="输入商品标题或描述进行搜索"
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
        {loading ? (
          <div className="py-16 text-center text-gray-500">加载中...</div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center text-gray-400">暂无商城商品</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {products.map((product) => (
              <div
                key={product.id}
                className="p-5 flex flex-col md:flex-row md:items-center gap-4"
              >
                <div className="flex-1 flex gap-4">
                  <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                    {product.images?.length ? (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                        无图
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {product.title}
                      </h3>
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          STATUS_COLORS[product.status] || STATUS_COLORS.offline
                        }`}
                      >
                        {STATUS_OPTIONS.find(
                          (item) => item.value === product.status
                        )?.label || product.status}
                      </span>
                    </div>
                    {product.description && (
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    <p className="text-sm text-gray-400">
                      可见小区：
                      {product.visibleCommunityIds?.length
                        ? product.visibleCommunityIds.length
                        : "全部"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <div className="text-lg font-semibold text-primary">
                    ¥{Number(product.price).toFixed(2)}
                  </div>
                  <button
                    onClick={() => handleEdit(product)}
                    className="px-3 py-1 rounded-lg border border-primary text-primary hover:bg-primary/5"
                  >
                    编辑
                  </button>
                  {product.status !== "offline" && (
                    <button
                      onClick={() => handleRemove(product.id)}
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

        {totalPages > 1 && (
          <div className="px-5 py-4 flex items-center justify-between text-sm text-gray-500">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-gray-200 rounded-lg disabled:opacity-60"
            >
              上一页
            </button>
            <span>
              第 {page} / {totalPages} 页
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 border border-gray-200 rounded-lg disabled:opacity-60"
            >
              下一页
            </button>
          </div>
        )}
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={resetForm} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {form.id ? "编辑商品" : "新建商品"}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
                aria-label="关闭"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  商品标题
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
                  商品描述
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    售价（元）
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        price: event.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
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
                        status: event.target.value as MallProductForm["status"],
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="draft">草稿</option>
                    <option value="published">已发布</option>
                    <option value="offline">已下架</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  商品图片（每行一个 URL）
                </label>
                <textarea
                  value={form.images}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, images: event.target.value }))
                  }
                  className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  指定可见小区（留空为全部可见）
                </label>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 space-y-2">
                  {communityLoading ? (
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
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                  disabled={submitting}
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-60"
                  disabled={submitting}
                >
                  {submitting ? "保存中..." : "保存"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
