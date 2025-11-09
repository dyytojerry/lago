import {
    ShoppingBag,
    Sparkles,
    Store,
    Calendar,
  } from "lucide-react";
import { useRouter } from "next/navigation";

export const SERVICE_NAV = [
    {
      id: "publish",
      title: "发布闲置",
      description: "快速上架同城好物",
      icon: ShoppingBag,
      action: (router: ReturnType<typeof useRouter>) => router.push("/publish"),
    },
    {
      id: "flea",
      title: "跳蚤市场",
      description: "逛本地地摊集市",
      icon: Sparkles,
      action: (router: ReturnType<typeof useRouter>) =>
        router.push("/flea-market"),
    },
    {
      id: "activities",
      title: "社区活动",
      description: "发现附近好玩事",
      icon: Calendar,
      action: (router: ReturnType<typeof useRouter>) =>
        router.push("/communities/search"),
    },
    {
      id: "services",
      title: "物业服务",
      description: "便民服务到家",
      icon: Store,
      action: (router: ReturnType<typeof useRouter>) =>
        router.push("/property/dashboard"),
    },
  ];
  
  export const CATEGORY_FILTERS = [
    { id: "all", label: "全部", value: "" },
    { id: "toys", label: "玩具", value: "toys" },
    { id: "gaming", label: "电玩", value: "gaming" },
    { id: "overall", label: "综合", value: "overall" },
  ] as const;
  
  export const SORT_FILTERS = [
    {
      id: "createdAt",
      label: "最新发布",
      sortBy: "createdAt",
      sortOrder: "desc",
    },
    {
      id: "viewCount",
      label: "浏览优先",
      sortBy: "viewCount",
      sortOrder: "desc",
    },
    { id: "priceLow", label: "价格从低到高", sortBy: "price", sortOrder: "asc" },
    {
      id: "priceHigh",
      label: "价格从高到低",
      sortBy: "price",
      sortOrder: "desc",
    },
    { id: "popular", label: "人气优先", sortBy: "viewCount", sortOrder: "desc" },
    { id: "liked", label: "点赞优先", sortBy: "likeCount", sortOrder: "desc" },
  ] as const;