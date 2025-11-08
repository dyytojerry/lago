'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Upload, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { communitieVerify, CommunitieVerifyDTO, CommunitieVerifyPathParams } from '@/lib/apis';

export default function CommunityVerifyPage() {
  const router = useRouter();
  const params = useParams();
  const communityId = params.id as string;

  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    contactPhone: '',
    licenseUrl: '',
    proofUrl: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleFileUpload = async (file: File, field: 'licenseUrl' | 'proofUrl') => {
    // TODO: 实现文件上传到OSS
    // 这里先用占位符
    const mockUrl = URL.createObjectURL(file);
    setFormData((prev) => ({ ...prev, [field]: mockUrl }));
    toast.success('文件上传成功');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.companyName || !formData.contactName || !formData.contactPhone || !formData.licenseUrl) {
      toast.error('请填写完整的认证信息');
      return;
    }

    setSubmitting(true);
    try {
      const response = await communitieVerify(
        { id: communityId } as CommunitieVerifyPathParams,
        formData as CommunitieVerifyDTO
      );
      if (response.success) {
        toast.success('认证申请已提交，请等待审核');
        router.back();
      } else {
        toast.error(response.message || '提交失败');
      }
    } catch (error: any) {
      toast.error(error.message || '提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="申请小区认证" showBack />

      <main className="max-w-7xl mx-auto px-4 py-4">
        <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="text-base font-semibold text-text-primary">认证说明</h2>
          </div>
          <p className="text-sm text-text-secondary">
            小区需要经过物业公司认证后才能让用户加入。请提供物业公司的营业执照和相关证明资料。
            审核通过后，小区将显示"已认证"标识，用户可以加入该小区。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 物业公司名称 */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              物业公司名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              placeholder="请输入物业公司名称"
              className="w-full px-4 py-2 bg-container rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          {/* 联系人姓名 */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              联系人姓名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.contactName}
              onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
              placeholder="请输入联系人姓名"
              className="w-full px-4 py-2 bg-container rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          {/* 联系人电话 */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              联系人电话 <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.contactPhone}
              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              placeholder="请输入联系人电话"
              className="w-full px-4 py-2 bg-container rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          {/* 营业执照 */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              营业执照 <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {formData.licenseUrl ? (
                <div className="relative w-full h-32 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={formData.licenseUrl}
                    alt="营业执照"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, licenseUrl: '' })}
                    className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-text-secondary">点击上传营业执照</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(file, 'licenseUrl');
                      }
                    }}
                  />
                </label>
              )}
            </div>
          </div>

          {/* 其他证明资料 */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              其他证明资料（可选）
            </label>
            <div className="space-y-2">
              {formData.proofUrl ? (
                <div className="relative w-full h-32 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={formData.proofUrl}
                    alt="证明资料"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, proofUrl: '' })}
                    className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-text-secondary">点击上传其他证明资料</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(file, 'proofUrl');
                      }
                    }}
                  />
                </label>
              )}
            </div>
          </div>

          {/* 提交按钮 */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full px-4 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? '提交中...' : '提交认证申请'}
          </button>
        </form>
      </main>
    </div>
  );
}

