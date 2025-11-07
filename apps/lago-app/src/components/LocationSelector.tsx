"use client";

import { useEffect, useMemo, useState } from "react";
import { MapPin, ChevronDown } from "lucide-react";
import { apiRequest } from "@lago/common";

interface Region {
  id: string;
  name: string;
}

interface CommunityOption extends Region {}

interface SelectedLocation {
  province?: Region;
  city?: Region;
  district?: Region;
  community?: CommunityOption;
}

interface LocationSelectorProps {
  onLocationChange?: (location: {
    provinceId?: string;
    provinceName?: string;
    cityId?: string;
    cityName?: string;
    districtId?: string;
    districtName?: string;
    communityId?: string;
    communityName?: string;
  }) => void;
}

export function LocationSelector({ onLocationChange }: LocationSelectorProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [provinces, setProvinces] = useState<Region[]>([]);
  const [cities, setCities] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<Region[]>([]);
  const [communities, setCommunities] = useState<CommunityOption[]>([]);
  const [selected, setSelected] = useState<SelectedLocation>({});
  const [loadingCommunities, setLoadingCommunities] = useState(false);

  useEffect(() => {
    const saved =
      typeof window !== "undefined"
        ? localStorage.getItem("selectedLocation")
        : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as SelectedLocation;
        setSelected(parsed);
      } catch (error) {
        console.warn("无法解析已保存的位置：", error);
      }
    }
  }, []);

  useEffect(() => {
    async function loadProvinces() {
      try {
        const response = await apiRequest<{ provinces: Region[] }>(
          "/api/regions/provinces",
          {
            method: "GET",
            noAuthorize: true,
          }
        );
        if (response.success && response.data) {
          setProvinces(response.data.provinces || []);
        }
      } catch (error) {
        console.error("加载省份失败:", error);
      }
    }
    loadProvinces();
  }, []);

  useEffect(() => {
    async function loadCities() {
      if (!selected.province) {
        setCities([]);
        return;
      }
      try {
        const response = await apiRequest<{ cities: Region[] }>(
          "/api/regions/cities",
          {
            method: "GET",
            params: { provinceId: selected.province.id },
            noAuthorize: true,
          }
        );
        if (response.success && response.data) {
          setCities(response.data.cities || []);
        }
      } catch (error) {
        console.error("加载城市失败:", error);
      }
    }
    loadCities();
  }, [selected.province]);

  useEffect(() => {
    async function loadDistricts() {
      if (!selected.city) {
        setDistricts([]);
        return;
      }
      try {
        const response = await apiRequest<{ districts: Region[] }>(
          "/api/regions/districts",
          {
            method: "GET",
            params: { cityId: selected.city.id },
            noAuthorize: true,
          }
        );
        if (response.success && response.data) {
          setDistricts(response.data.districts || []);
        }
      } catch (error) {
        console.error("加载区县失败:", error);
      }
    }
    loadDistricts();
  }, [selected.city]);

  useEffect(() => {
    async function loadCommunities() {
      if (!selected.city) {
        setCommunities([]);
        return;
      }
      try {
        setLoadingCommunities(true);
        const response = await apiRequest<{ communities: CommunityOption[] }>(
          "/api/communities/search",
          {
            method: "GET",
            params: {
              provinceId: selected.province?.id,
              cityId: selected.city?.id,
              districtId: selected.district?.id,
              verificationStatus: "approved",
              limit: "100",
            },
            noAuthorize: true,
          }
        );
        if (response.success && response.data) {
          const list = (response.data.communities || []).map((item) => ({
            id: item.id,
            name: item.name,
          }));
          setCommunities(list);
        }
      } catch (error) {
        console.error("加载小区失败:", error);
      } finally {
        setLoadingCommunities(false);
      }
    }
    loadCommunities();
  }, [selected.province?.id, selected.city?.id, selected.district?.id]);

  const locationText = useMemo(() => {
    if (selected.community) return selected.community.name;
    if (selected.district) return selected.district.name;
    if (selected.city) return selected.city.name;
    if (selected.province) return selected.province.name;
    return "选择区域";
  }, [selected]);

  const handleConfirm = () => {
    const payload = {
      provinceId: selected.province?.id,
      provinceName: selected.province?.name,
      cityId: selected.city?.id,
      cityName: selected.city?.name,
      districtId: selected.district?.id,
      districtName: selected.district?.name,
      communityId: selected.community?.id,
      communityName: selected.community?.name,
    };
    localStorage.setItem("selectedLocation", JSON.stringify(selected));
    onLocationChange?.(payload);
    setShowPicker(false);
  };

  const handleReset = () => {
    setSelected({});
    setCities([]);
    setDistricts([]);
    setCommunities([]);
    localStorage.removeItem("selectedLocation");
    onLocationChange?.({});
  };

  const handleSelectProvince = (province: Region) => {
    setSelected({
      province,
      city: undefined,
      district: undefined,
      community: undefined,
    });
  };

  const handleSelectCity = (city: Region) => {
    setSelected((prev) => ({
      ...prev,
      city,
      district: undefined,
      community: undefined,
    }));
  };

  const handleSelectDistrict = (district: Region) => {
    setSelected((prev) => ({ ...prev, district, community: undefined }));
  };

  const handleSelectCommunity = (community: CommunityOption) => {
    setSelected((prev) => ({ ...prev, community }));
  };

  return (
    <>
      <button
        onClick={() => setShowPicker(true)}
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors"
      >
        <MapPin className="w-4 h-4" />
        <span className="max-w-[120px] truncate">{locationText}</span>
        <ChevronDown className="w-3 h-3" />
      </button>

      {showPicker && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="flex-1 bg-black/40"
            onClick={() => setShowPicker(false)}
          />
          <div className="bg-white rounded-t-3xl shadow-xl max-h-[75vh] flex flex-col">
            <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
              <button
                onClick={handleReset}
                className="text-sm text-text-secondary"
              >
                重置
              </button>
              <h3 className="text-base font-semibold text-text-primary">
                选择所在区域
              </h3>
              <button
                onClick={handleConfirm}
                className="px-3 py-1 text-sm bg-primary text-white rounded-full disabled:opacity-50"
                disabled={!selected.province || !selected.city}
              >
                确定
              </button>
            </div>

            <div className="flex-1 flex divide-x divide-gray-100">
              <Column
                title="省份"
                data={provinces}
                activeId={selected.province?.id}
                onSelect={handleSelectProvince}
              />
              <Column
                title="城市"
                data={cities}
                activeId={selected.city?.id}
                onSelect={handleSelectCity}
                disabled={!selected.province}
              />
              <Column
                title="区县"
                data={districts}
                activeId={selected.district?.id}
                onSelect={handleSelectDistrict}
                disabled={!selected.city}
                allowEmpty
              />
              <Column
                title="小区"
                data={communities}
                activeId={selected.community?.id}
                onSelect={handleSelectCommunity}
                disabled={loadingCommunities || !selected.city}
                loading={loadingCommunities}
                allowEmpty
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

interface ColumnProps {
  title: string;
  data: Region[];
  activeId?: string;
  onSelect: (item: Region) => void;
  disabled?: boolean;
  loading?: boolean;
  allowEmpty?: boolean;
}

function Column({
  title,
  data,
  activeId,
  onSelect,
  disabled,
  loading,
  allowEmpty,
}: ColumnProps) {
  return (
    <div className="flex-1 flex flex-col">
      <div className="px-4 py-2 text-xs text-text-secondary border-b border-gray-100 bg-gray-50">
        {title}
      </div>
      <div className="flex-1 overflow-y-auto">
        {disabled ? (
          <div className="h-full flex items-center justify-center text-xs text-text-tertiary">
            {`请选择${title === "省份" ? "" : "上一级"}`}
          </div>
        ) : loading ? (
          <div className="h-full flex items-center justify-center text-xs text-text-secondary">
            加载中...
          </div>
        ) : data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-text-tertiary">
            {allowEmpty ? "暂无数据" : "请选择上一级"}
          </div>
        ) : (
          <ul className="py-1 text-sm">
            {data.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => onSelect(item)}
                  className={`w-full text-left px-4 py-2 hover:bg-primary/5 ${
                    activeId === item.id
                      ? "text-primary font-medium bg-primary/10"
                      : "text-text-primary"
                  }`}
                >
                  {item.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
