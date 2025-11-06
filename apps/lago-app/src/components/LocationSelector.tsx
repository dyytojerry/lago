'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, ChevronDown } from 'lucide-react';
import { apiRequest } from '@lago/common';

interface Region {
  id: string;
  name: string;
}

interface LocationSelectorProps {
  onLocationChange?: (provinceId: string, cityId: string, districtId: string) => void;
}

export function LocationSelector({ onLocationChange }: LocationSelectorProps) {
  const router = useRouter();
  const [showPicker, setShowPicker] = useState(false);
  const [provinces, setProvinces] = useState<Region[]>([]);
  const [cities, setCities] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<Region[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<Region | null>(null);
  const [selectedCity, setSelectedCity] = useState<Region | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<Region | null>(null);
  const [locationText, setLocationText] = useState('定位中...');

  // 从localStorage加载已保存的位置
  useEffect(() => {
    const saved = localStorage.getItem('selectedLocation');
    if (saved) {
      try {
        const { province, city, district } = JSON.parse(saved);
        setSelectedProvince(province);
        setSelectedCity(city);
        setSelectedDistrict(district);
        updateLocationText(province, city, district);
      } catch (error) {
        console.error('加载位置失败:', error);
      }
    }
  }, []);

  // 加载省份列表
  useEffect(() => {
    async function loadProvinces() {
      try {
        const response = await apiRequest<{ provinces: Region[] }>('/api/regions/provinces', {
          method: 'GET',
        });
        if (response.success && response.data) {
          setProvinces(response.data.provinces || []);
        }
      } catch (error) {
        console.error('加载省份失败:', error);
      }
    }
    loadProvinces();
  }, []);

  // 当选择省份时，加载城市列表
  useEffect(() => {
    if (selectedProvince) {
      async function loadCities() {
        try {
          const response = await apiRequest<{ cities: Region[] }>('/api/regions/cities', {
            method: 'GET',
            params: { provinceId: selectedProvince.id },
          });
          if (response.success && response.data) {
            setCities(response.data.cities || []);
          }
        } catch (error) {
          console.error('加载城市失败:', error);
        }
      }
      loadCities();
    } else {
      setCities([]);
    }
  }, [selectedProvince]);

  // 当选择城市时，加载区县列表
  useEffect(() => {
    if (selectedCity) {
      async function loadDistricts() {
        try {
          const response = await apiRequest<{ districts: Region[] }>('/api/regions/districts', {
            method: 'GET',
            params: { cityId: selectedCity.id },
          });
          if (response.success && response.data) {
            setDistricts(response.data.districts || []);
          }
        } catch (error) {
          console.error('加载区县失败:', error);
        }
      }
      loadDistricts();
    } else {
      setDistricts([]);
    }
  }, [selectedCity]);

  const updateLocationText = (province: Region | null, city: Region | null, district: Region | null) => {
    if (province && city) {
      const text = district ? `${city.name} ${district.name}` : city.name;
      setLocationText(text);
    } else {
      setLocationText('请选择位置');
    }
  };

  const handleConfirm = () => {
    if (selectedProvince && selectedCity) {
      updateLocationText(selectedProvince, selectedCity, selectedDistrict);
      // 保存到localStorage
      localStorage.setItem(
        'selectedLocation',
        JSON.stringify({
          province: selectedProvince,
          city: selectedCity,
          district: selectedDistrict,
        })
      );
      // 通知父组件
      if (onLocationChange) {
        onLocationChange(
          selectedProvince.id,
          selectedCity.id,
          selectedDistrict?.id || ''
        );
      }
      setShowPicker(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowPicker(true)}
        className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors"
      >
        <MapPin className="w-4 h-4" />
        <span>{locationText}</span>
        <ChevronDown className="w-3 h-3" />
      </button>

      {showPicker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary">选择位置</h3>
              <button
                onClick={() => setShowPicker(false)}
                className="text-text-secondary hover:text-text-primary"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* 省份选择 */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">省份</label>
                <select
                  value={selectedProvince?.id || ''}
                  onChange={(e) => {
                    const province = provinces.find((p) => p.id === e.target.value);
                    setSelectedProvince(province || null);
                    setSelectedCity(null);
                    setSelectedDistrict(null);
                  }}
                  className="w-full px-3 py-2 bg-container rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">请选择省份</option>
                  {provinces.map((province) => (
                    <option key={province.id} value={province.id}>
                      {province.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 城市选择 */}
              {selectedProvince && (
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">城市</label>
                  <select
                    value={selectedCity?.id || ''}
                    onChange={(e) => {
                      const city = cities.find((c) => c.id === e.target.value);
                      setSelectedCity(city || null);
                      setSelectedDistrict(null);
                    }}
                    className="w-full px-3 py-2 bg-container rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">请选择城市</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* 区县选择 */}
              {selectedCity && (
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">区县（可选）</label>
                  <select
                    value={selectedDistrict?.id || ''}
                    onChange={(e) => {
                      const district = districts.find((d) => d.id === e.target.value);
                      setSelectedDistrict(district || null);
                    }}
                    className="w-full px-3 py-2 bg-container rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">不选择区县</option>
                    {districts.map((district) => (
                      <option key={district.id} value={district.id}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 flex gap-2">
              <button
                onClick={() => setShowPicker(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-text-primary rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleConfirm}
                disabled={!selectedProvince || !selectedCity}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

