"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, NavigationLink } from "@lago/ui";
import { adminProducts } from "@/lib/apis";
import { adminProductsApprove } from "@/lib/apis";

interface Product {
  id: string;
  title: string;
  description: string | null;
  category: string;
  type: string;
  price: number;
  status: string;
  images: string[];
  createdAt: string;
  owner: {
    id: string;
    nickname: string | null;
    phone: string | null;
    role: string;
  };
  community: {
    id: string;
    name: string;
  } | null;
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    search: "",
  });
  const { isLoggedIn, user } = useAuth();
  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    loadProducts();
  }, [router, page, filters]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(filters.status && { status: filters.status }),
        ...(filters.category && { category: filters.category }),
        ...(filters.search && { search: filters.search }),
      });

      const response = await adminProducts({
        page: page.toString(),
        limit: "20",
        ...(filters.status && { status: filters.status }),
        ...(filters.category && { category: filters.category }),
        ...(filters.search && { search: filters.search }),
      } as any);
      setProducts(response.data.products);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error("加载商品列表失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string, action: "approve" | "reject") => {
    if (
      !confirm(`确定要${action === "approve" ? "通过" : "拒绝"}这个商品吗？`)
    ) {
      return;
    }

    try {
      await adminProductsApprove(
        { id },
        { action, reason: action === "reject" ? "不符合平台规范" : undefined }
      );
      alert(`商品已${action === "approve" ? "通过" : "拒绝"}`);
      loadProducts();
    } catch (error: any) {
      alert(error.response?.data?.error || "操作失败");
    }
  };

  if (!isLoggedIn) {
    return null;
  }

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    active: "bg-green-100 text-green-800",
    sold: "bg-blue-100 text-blue-800",
    rented: "bg-purple-100 text-purple-800",
    offline: "bg-gray-100 text-gray-800",
  };

  const statusNames: Record<string, string> = {
    pending: "待审核",
    active: "已上架",
    sold: "已售出",
    rented: "已租出",
    offline: "已下架",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">商品管理</h1>
        <NavigationLink
          href="/admin/products/approve"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          批量审核
        </NavigationLink>
      </div>

      {/* 筛选器 */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              状态
            </label>
            <select
              value={filters.status}
              onChange={(e) => {
                setFilters({ ...filters, status: e.target.value });
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">全部</option>
              <option value="pending">待审核</option>
              <option value="active">已上架</option>
              <option value="sold">已售出</option>
              <option value="rented">已租出</option>
              <option value="offline">已下架</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              分类
            </label>
            <select
              value={filters.category}
              onChange={(e) => {
                setFilters({ ...filters, category: e.target.value });
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">全部</option>
              <option value="toys">玩具</option>
              <option value="gaming">游戏机</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              搜索
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => {
                setFilters({ ...filters, search: e.target.value });
                setPage(1);
              }}
              placeholder="商品标题或描述"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setFilters({ status: "", category: "", search: "" });
                setPage(1);
              }}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              重置
            </button>
          </div>
        </div>
      </div>

      {/* 商品列表 */}
      {loading ? (
        <div className="text-center py-12">加载中...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-gray-500">暂无商品</div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    商品信息
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    卖家
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    价格
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    创建时间
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.images && product.images.length > 0 && (
                          <img
                            src={product.images[0]}
                            alt={product.title}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div>
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="font-medium text-gray-900 hover:text-blue-600"
                          >
                            {product.title}
                          </Link>
                          <p className="text-sm text-gray-500 line-clamp-1">
                            {product.description || "无描述"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div>
                        <div className="font-medium">
                          {product.owner.nickname || "未设置"}
                        </div>
                        <div className="text-gray-500">
                          {product.owner.phone || "--"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="font-medium">
                        ¥{Number(product.price).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          statusColors[product.status] || statusColors.offline
                        }`}
                      >
                        {statusNames[product.status] || product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(product.createdAt).toLocaleDateString("zh-CN")}
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          详情
                        </Link>
                        {user?.permissions.includes("super_admin") ||
                          (user?.permissions.includes("audit_staff") &&
                            product.status === "pending" && (
                              <>
                                <button
                                  onClick={() =>
                                    handleApprove(product.id, "approve")
                                  }
                                  className="text-green-600 hover:text-green-800"
                                >
                                  通过
                                </button>
                                <button
                                  onClick={() =>
                                    handleApprove(product.id, "reject")
                                  }
                                  className="text-red-600 hover:text-red-800"
                                >
                                  拒绝
                                </button>
                              </>
                            ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50"
              >
                上一页
              </button>
              <span className="text-sm text-gray-700">
                第 {page} 页，共 {totalPages} 页
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50"
              >
                下一页
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
