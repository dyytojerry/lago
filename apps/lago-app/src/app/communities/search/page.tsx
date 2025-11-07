"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Loading } from "@/components/Loading";
import { EmptyState } from "@/components/EmptyState";
import { BottomNavigation } from "@/components/BottomNavigation";
import { LocationSelector } from "@/components/LocationSelector";
import { apiRequest } from "@lago/common";
import {
  MapPin,
  Users,
  Package,
  Filter,
  Search as SearchIcon,
  ShieldCheck,
} from "lucide-react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { communitieNearby, communitieSearch } from "@/lib/apis";

interface Community {
  id: string;
  name: string;
  address?: string;
  images: string[];
  province?: { id: string; name: string };
  city?: { id: string; name: string };
  district?: { id: string; name: string };
  verificationStatus: "pending" | "approved" | "rejected";
  _count?: {
    members: number;
    products: number;
  };
}

export default function CommunitySearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [provinceId, setProvinceId] = useState<string | undefined>();
  const [cityId, setCityId] = useState<string | undefined>();
  const [districtId, setDistrictId] = useState<string | undefined>();
  const [communityId, setCommunityId] = useState<string | undefined>();
  const [verificationStatus, setVerificationStatus] = useState<"approved" | "">(
    "approved"
  );
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [manualLocation, setManualLocation] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const {
    latitude: geoLatitude,
    longitude: geoLongitude,
    loading: geoLoading,
  } = useGeolocation();

  const locationPayload = useMemo(
    () => ({
      provinceId,
      cityId,
      districtId,
      communityId,
      verificationStatus,
      latitude,
      longitude,
    }),
    [
      provinceId,
      cityId,
      districtId,
      communityId,
      verificationStatus,
      latitude,
      longitude,
    ]
  );

  const loadCommunities = async (page = 1) => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        page: String(page),
        limit: "20",
      };

      if (searchQuery) params.search = searchQuery;
      if (provinceId) params.provinceId = provinceId;
      if (cityId) params.cityId = cityId;
      if (districtId) params.districtId = districtId;
      if (communityId) params.communityId = communityId;
      if (verificationStatus) params.verificationStatus = verificationStatus;
      let response = null;
      if (latitude !== undefined && longitude !== undefined) {
        params.latitude = String(latitude);
        params.longitude = String(longitude);
        params.radius = "5000";
        response = await communitieNearby(params, true);
        if (response.success && response.data?.communities) {
          setCommunities(response.data.communities);
          setPagination({
            ...pagination,
            total: response.data.total,
            totalPages: response.data.totalPages,
          });
        }
      } else {
        response = await communitieSearch(params, true);
        if (response.success && response.data?.communities) {
          setCommunities(response.data.communities);
          setPagination(response.data.pagination);
        }
      }
    } catch (error) {
      console.error("搜索小区失败:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommunities(1);
  }, [searchQuery, locationPayload]);

  useEffect(() => {
    if (
      !geoLoading &&
      geoLatitude !== undefined &&
      geoLongitude !== undefined &&
      !manualLocation
    ) {
      setLatitude(geoLatitude);
      setLongitude(geoLongitude);
    }
  }, [geoLoading, geoLatitude, geoLongitude, manualLocation]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadCommunities(1);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-3 space-y-3">
          <div className="flex items-center gap-3">
            <LocationSelector
              onLocationChange={(location) => {
                setProvinceId(location.provinceId || undefined);
                setCityId(location.cityId || undefined);
                setDistrictId(location.districtId || undefined);
                setCommunityId(location.communityId || undefined);
                const hasManual = Boolean(
                  location.provinceId ||
                    location.cityId ||
                    location.districtId ||
                    location.communityId
                );
                setManualLocation(hasManual);
                if (hasManual) {
                  setLatitude(undefined);
                  setLongitude(undefined);
                } else if (
                  !geoLoading &&
                  geoLatitude !== undefined &&
                  geoLongitude !== undefined
                ) {
                  setLatitude(geoLatitude);
                  setLongitude(geoLongitude);
                }
              }}
            />
            <form onSubmit={handleSearch} className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索小区名称或地址"
                className="w-full pl-10 pr-12 py-2 bg-gray-100 rounded-full border border-transparent focus:outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full text-text-secondary hover:bg-gray-200"
              >
                <Filter className="w-4 h-4" />
              </button>
            </form>
          </div>

          {showFilters && (
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <h4 className="text-sm font-medium text-text-primary mb-3">
                认证筛选
              </h4>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setVerificationStatus("")}
                  className={`px-3 py-2 rounded-full text-sm ${
                    verificationStatus === ""
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-text-primary"
                  }`}
                >
                  全部
                </button>
                <button
                  type="button"
                  onClick={() => setVerificationStatus("approved")}
                  className={`px-3 py-2 rounded-full text-sm ${
                    verificationStatus === "approved"
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-text-primary"
                  }`}
                >
                  <span className="inline-flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" /> 已认证
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-4">
        {(() => {
          if (loading) {
            return <Loading text="搜索中..." />;
          }

          if (communities.length === 0) {
            return (
              <EmptyState
                icon="package"
                title="暂无小区"
                description={
                  searchQuery
                    ? `没有找到“${searchQuery}”相关的小区`
                    : "没有找到符合条件的小区，尝试调整筛选条件试试"
                }
              />
            );
          }

          return (
            <>
              <div className="space-y-3 mb-4">
                {communities.map((community) => (
                  <button
                    key={community.id}
                    type="button"
                    onClick={() => router.push(`/communities/${community.id}`)}
                    className="w-full text-left bg-white rounded-3xl p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      {community.images?.[0] ? (
                        <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                          <Image
                            src={community.images[0]}
                            alt={community.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-2xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-semibold text-text-primary line-clamp-1">
                            {community.name}
                          </h3>
                          {community.verificationStatus === "approved" && (
                            <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                              已认证
                            </span>
                          )}
                        </div>
                        {community.address && (
                          <p className="text-sm text-text-secondary line-clamp-1">
                            {community.address}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-text-secondary flex-wrap">
                          {community.province && community.city && (
                            <span>
                              {community.province.name} {community.city.name}
                              {community.district &&
                                ` ${community.district.name}`}
                            </span>
                          )}
                          {community._count && (
                            <>
                              <span className="inline-flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {community._count.members}人
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Package className="w-3 h-3" />
                                {community._count.products}件闲置
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <button
                    disabled={pagination.page === 1}
                    onClick={() => loadCommunities(pagination.page - 1)}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-full disabled:opacity-50"
                  >
                    上一页
                  </button>
                  <span className="px-4 py-2 text-sm text-text-secondary">
                    {pagination.page} / {pagination.totalPages}
                  </span>
                  <button
                    disabled={pagination.page === pagination.totalPages}
                    onClick={() => loadCommunities(pagination.page + 1)}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-full disabled:opacity-50"
                  >
                    下一页
                  </button>
                </div>
              )}
            </>
          );
        })()}
      </main>

      <BottomNavigation />
    </div>
  );
}
