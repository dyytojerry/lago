'use client';

import { useMemo, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { communitieVerify, CommunitieVerifyDTO, CommunitieVerifyPathParams } from '@/lib/apis';
import { SingleMediaUploader, UploadedMedia } from '@lago/ui';
import { defaultUploadHandler } from '@/lib/upload';

export default function CommunityVerifyPage() {
  const router = useRouter();
  const params = useParams();
  const communityId = params.id as string;

  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    contactPhone: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [licenseMedia, setLicenseMedia] = useState<UploadedMedia | null>(null);
  const [proofMedia, setProofMedia] = useState<UploadedMedia | null>(null);
  const uploadHandler = useMemo(() => defaultUploadHandler, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.companyName || !formData.contactName || !formData.contactPhone || !licenseMedia) {
      toast.error('请填写完整的认证信息');
      return;
    }

    setSubmitting(true);
    try {
      const response = await communitieVerify(
        { id: communityId } as CommunitieVerifyPathParams,
        {
          ...formData,
          licenseUrl: licenseMedia.url,
          proofUrl: proofMedia?.url,
        } as CommunitieVerifyDTO
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

          <SingleMediaUploader
            label="营业执照 *"
            description="请上传物业公司的营业执照照片或扫描件"
            value={licenseMedia}
            onChange={setLicenseMedia}
            uploadHandler={uploadHandler}
            accept="image"
            mandatoryType="image"
            onError={(error) => toast.error(error.message)}
          />

          <SingleMediaUploader
            label="其他证明资料（可选）"
            description="可上传合作协议、授权书等补充材料"
            value={proofMedia}
            onChange={setProofMedia}
            uploadHandler={uploadHandler}
            accept="image"
            mandatoryType="image"
            allowRemove
            onError={(error) => toast.error(error.message)}
          />

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

