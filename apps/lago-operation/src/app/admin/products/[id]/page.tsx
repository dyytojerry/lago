"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth, NavigationLink } from "@lago/ui";
import { adminProductDetail, adminProductsApprove } from "@/lib/apis";

interface ProductDetail {
  id: string;
  title: string;
  description: string | null;
  category: string;
  type: string;
  price: number;
  deposit: number | null;
  status: string;
  images: string[];
  location: string | null;
  isVerified: boolean;
  viewCount: number;
  likeCount: number;
  createdAt: string;
  owner: {
    id: string;
    nickname: string | null;
    phone: string | null;
    email: string | null;
    role: string;
    creditScore: number;
    isVerified: boolean;
  };
  community: {
    id: string;
    name: string;
    location: string;
    address: string | null;
  } | null;
  orders: Array<{
    id: string;
    status: string;
    amount: number;
    createdAt: string;
    buyer: {
      id: string;
      nickname: string | null;
    };
  }>;
}

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [reason, setReason] = useState("");
  const { isLoggedIn } = useAuth();
  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    loadProduct();
  }, [router, productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await adminProductDetail({ id: productId });
      setProduct(response.data.product);
    } catch (error) {
      console.error("加载商品详情失败:", error);
      alert("加载商品详情失败");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!action) return;

    if (action === "reject" && !reason.trim()) {
      alert("请填写拒绝原因");
      return;
    }

    try {
      await adminProductsApprove(
        { id: productId },
        { action, reason: reason || undefined }
      );
      alert(`商品已${action === "approve" ? "通过" : "拒绝"}`);
      router.push("/admin/products");
    } catch (error: any) {
      alert(error.response?.data?.error || "操作失败");
    }
  };

  if (!isLoggedIn || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  if (!product) {
    return <div className="text-center py-12 text-gray-500">商品不存在</div>;
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
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-900"
        >
          ← 返回
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setAction("approve");
              handleApprove();
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            通过审核
          </button>
          <button
            onClick={() => setAction("reject")}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            拒绝审核
          </button>
        </div>
      </div>

      {action === "reject" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-2">拒绝原因</h3>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="请填写拒绝原因..."
            className="w-full px-3 py-2 border border-yellow-300 rounded-md mb-2"
            rows={3}
          />
          <div className="flex gap-2">
            <button
              onClick={handleApprove}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              确认拒绝
            </button>
            <button
              onClick={() => {
                setAction(null);
                setReason("");
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              取消
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：商品信息 */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">{product.title}</h1>
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full ${
                  statusColors[product.status] || statusColors.offline
                }`}
              >
                {statusNames[product.status] || product.status}
              </span>
            </div>

            {product.images && product.images.length > 0 && (
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-4">
                  {product.images.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`${product.title} - ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">商品描述</h3>
              <p className="text-gray-700 whitespace-pre-wrap">
                {product.description || "无描述"}
              </p>
            </div>

            <div className="border-t pt-4 mt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">分类:</span>
                  <span className="ml-2 font-medium">
                    {product.category === "toys" ? "玩具" : "游戏机"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">交易类型:</span>
                  <span className="ml-2 font-medium">
                    {product.type === "rent"
                      ? "租赁"
                      : product.type === "sell"
                      ? "出售"
                      : "租赁+出售"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">价格:</span>
                  <span className="ml-2 font-medium text-lg text-red-600">
                    ¥{Number(product.price).toFixed(2)}
                  </span>
                </div>
                {product.deposit && (
                  <div>
                    <span className="text-gray-600">押金:</span>
                    <span className="ml-2 font-medium">
                      ¥{Number(product.deposit).toFixed(2)}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-gray-600">浏览次数:</span>
                  <span className="ml-2">{product.viewCount}</span>
                </div>
                <div>
                  <span className="text-gray-600">收藏次数:</span>
                  <span className="ml-2">{product.likeCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 订单记录 */}
          {product.orders && product.orders.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">订单记录</h3>
              <div className="space-y-3">
                {product.orders.map((order) => (
                  <div key={order.id} className="border-b pb-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">
                          订单 {order.id.slice(0, 8)}...
                        </div>
                        <div className="text-sm text-gray-500">
                          买家: {order.buyer.nickname || "未设置"} | 金额: ¥
                          {Number(order.amount).toFixed(2)}
                        </div>
                      </div>
                      <span className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString("zh-CN")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 右侧：卖家信息 */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">卖家信息</h3>
            <div className="space-y-3">
              <div>
                <span className="text-gray-600 text-sm">昵称:</span>
                <div className="font-medium">
                  {product.owner.nickname || "未设置"}
                </div>
              </div>
              <div>
                <span className="text-gray-600 text-sm">手机号:</span>
                <div className="font-medium">{product.owner.phone || "--"}</div>
              </div>
              <div>
                <span className="text-gray-600 text-sm">邮箱:</span>
                <div className="font-medium">{product.owner.email || "--"}</div>
              </div>
              <div>
                <span className="text-gray-600 text-sm">角色:</span>
                <div className="font-medium">{product.owner.role}</div>
              </div>
              <div>
                <span className="text-gray-600 text-sm">信用积分:</span>
                <div className="font-medium">{product.owner.creditScore}</div>
              </div>
              {product.owner.isVerified && (
                <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                  ✓ 已认证
                </span>
              )}
            </div>
          </div>

          {product.community && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">小区信息</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-gray-600 text-sm">小区名称:</span>
                  <div className="font-medium">{product.community.name}</div>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">位置:</span>
                  <div className="font-medium">
                    {product.community.location}
                  </div>
                </div>
                {product.community.address && (
                  <div>
                    <span className="text-gray-600 text-sm">地址:</span>
                    <div className="font-medium">
                      {product.community.address}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">商品信息</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">商品ID:</span>
                <div className="font-mono text-xs">{product.id}</div>
              </div>
              <div>
                <span className="text-gray-600">创建时间:</span>
                <div>{new Date(product.createdAt).toLocaleString("zh-CN")}</div>
              </div>
              {product.location && (
                <div>
                  <span className="text-gray-600">位置:</span>
                  <div>{product.location}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
