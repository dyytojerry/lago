'use client';

import { useMemo, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { useOnboardingCreate } from '@/lib/apis/onboarding';
import {
  OnboardingType,
  ServiceCategory,
} from '@/lib/apis/types';
import toast from 'react-hot-toast';

const TYPE_FIELDS: Record<
  OnboardingType,
  {
    title: string;
    description: string;
    requiredDocs: string[];
    serviceCategory?: boolean;
    requiresBusiness?: boolean;
    requiresIdentity?: boolean;
  }
> = {
  personal_seller: {
    title: '个人卖家入驻申请',
    description:
      '提交身份证明后即可开通个人卖家权限，便于发布和管理闲置商品。',
    requiredDocs: ['身份证人像面照片', '身份证国徽面照片'],
    requiresIdentity: true,
  },
  small_business_seller: {
    title: '小微商家入驻申请',
    description:
      '适用于个体工商户、夫妻店等小微卖家，需提供营业执照和经营信息。',
    requiredDocs: ['营业执照照片或扫描件', '经营场所照片（可选）'],
    requiresBusiness: true,
  },
  personal_service_provider: {
    title: '个人服务商入驻申请',
    description:
      '适用于维修、安装、保洁等个人服务者，需实名和选择服务类别。',
    requiredDocs: ['身份证正反面', '技能或服务证明（可选）'],
    requiresIdentity: true,
    serviceCategory: true,
  },
  enterprise_service_provider: {
    title: '企业服务商入驻申请',
    description:
      '适用于维修、装修、回收等企业服务商，需提供工商信息与服务资质。',
    requiredDocs: ['营业执照', '相关资质证书（可选）'],
    requiresBusiness: true,
    serviceCategory: true,
  },
};

const SERVICE_CATEGORY_TEXT: Record<ServiceCategory, string> = {
  recycling: '废品回收',
  appliance_repair: '家电维修',
  appliance_install: '家电安装',
  appliance_cleaning: '家电清洗',
  furniture_repair: '家具维修',
  carpentry: '木工',
  masonry: '泥工砌筑',
  tiling: '瓦工贴砖',
  painting: '油漆翻新',
  plumbing: '水管/管道服务',
  electrician: '电工服务',
  hvac_install: '暖通空调',
  locksmith: '开锁换锁',
  pest_control: '除虫除害',
  cleaning: '专业保洁',
  moving_service: '搬家搬运',
  landscaping: '园艺绿化',
  decoration_design: '装修设计',
  renovation_general: '整体装修',
  other: '其他服务',
};

export default function OnboardingFormPage() {
  const router = useRouter();
  const params = useParams<{ type: string }>();
  const parsedType = params.type as OnboardingType;
  const config = TYPE_FIELDS[parsedType];
  const mutation = useOnboardingCreate({
    onSuccess: () => {
      toast.success('入驻申请已提交，等待审核');
      router.replace('/profile/onboarding');
    },
    onError: (error: any) => {
      toast.error(error?.message || '提交失败，请稍后重试');
    },
  });

  const [form, setForm] = useState({
    fullName: '',
    idNumber: '',
    businessName: '',
    businessLicenseNumber: '',
    contactPhone: '',
    contactEmail: '',
    address: '',
    description: '',
    experienceYears: '',
    serviceCategory: '' as ServiceCategory | '',
    idCardFront: '',
    idCardBack: '',
    licenseUrl: '',
    attachments: '',
  });

  const requiresIdentity = config?.requiresIdentity;
  const requiresBusiness = config?.requiresBusiness;
  const requiresServiceCategory = config?.serviceCategory;

  const canSubmit = useMemo(() => {
    if (!config) return false;
    if (requiresIdentity && (!form.fullName || !form.idNumber || !form.idCardFront || !form.idCardBack)) {
      return false;
    }
    if (
      requiresBusiness &&
      (!form.businessName || !form.businessLicenseNumber || !form.licenseUrl)
    ) {
      return false;
    }
    if (requiresServiceCategory && !form.serviceCategory) {
      return false;
    }
    return true;
  }, [
    config,
    requiresIdentity,
    requiresBusiness,
    requiresServiceCategory,
    form.fullName,
    form.idNumber,
    form.idCardFront,
    form.idCardBack,
    form.businessName,
    form.businessLicenseNumber,
    form.licenseUrl,
    form.serviceCategory,
  ]);

  if (!config) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="入驻申请" />
        <main className="max-w-4xl mx-auto px-4 py-10">
          <p className="text-sm text-text-secondary">未找到对应的入驻类型。</p>
        </main>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      toast.error('请完善必填信息');
      return;
    }

    const documents: Record<string, any> = {};
    if (form.idCardFront) documents.idCardFront = form.idCardFront;
    if (form.idCardBack) documents.idCardBack = form.idCardBack;
    if (form.licenseUrl) documents.businessLicense = form.licenseUrl;
    if (form.attachments) documents.attachments = form.attachments.split(',').map((item) => item.trim());

    const payload = {
      type: parsedType,
      serviceCategory: form.serviceCategory || undefined,
      fullName: form.fullName || undefined,
      idNumber: form.idNumber || undefined,
      businessName: form.businessName || undefined,
      businessLicenseNumber: form.businessLicenseNumber || undefined,
      contactPhone: form.contactPhone || undefined,
      contactEmail: form.contactEmail || undefined,
      address: form.address || undefined,
      description: form.description || undefined,
      experienceYears: form.experienceYears ? Number(form.experienceYears) : undefined,
      documents,
    };

    await mutation.mutateAsync(payload);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title={config.title} />

      <main className="max-w-4xl mx-auto px-4 py-6">
        <section className="bg-white rounded-2xl shadow-sm p-4 mb-5">
          <h2 className="text-lg font-semibold text-text-primary mb-2">入驻须知</h2>
          <p className="text-sm text-text-secondary leading-6">{config.description}</p>

          <div className="mt-4">
            <h3 className="text-sm font-medium text-text-primary mb-2">所需材料</h3>
            <ul className="text-xs text-text-secondary space-y-1 list-disc list-inside">
              {config.requiredDocs.map((doc) => (
                <li key={doc}>{doc}</li>
              ))}
            </ul>
          </div>
        </section>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm p-5 space-y-4"
        >
          {requiresIdentity && (
            <>
              <FormField
                label="姓名"
                required
                value={form.fullName}
                onChange={(val) => setForm((prev) => ({ ...prev, fullName: val }))}
              />
              <FormField
                label="身份证号"
                required
                value={form.idNumber}
                onChange={(val) => setForm((prev) => ({ ...prev, idNumber: val }))}
              />
              <FormField
                label="身份证正面照片地址"
                required
                placeholder="请输入已上传的图片URL"
                value={form.idCardFront}
                onChange={(val) => setForm((prev) => ({ ...prev, idCardFront: val }))}
              />
              <FormField
                label="身份证反面照片地址"
                required
                placeholder="请输入已上传的图片URL"
                value={form.idCardBack}
                onChange={(val) => setForm((prev) => ({ ...prev, idCardBack: val }))}
              />
            </>
          )}

          {requiresBusiness && (
            <>
              <FormField
                label="企业/商户名称"
                required
                value={form.businessName}
                onChange={(val) => setForm((prev) => ({ ...prev, businessName: val }))}
              />
              <FormField
                label="营业执照注册号"
                required
                value={form.businessLicenseNumber}
                onChange={(val) =>
                  setForm((prev) => ({ ...prev, businessLicenseNumber: val }))
                }
              />
              <FormField
                label="营业执照照片地址"
                required
                placeholder="请输入已上传的图片URL"
                value={form.licenseUrl}
                onChange={(val) => setForm((prev) => ({ ...prev, licenseUrl: val }))}
              />
            </>
          )}

          {requiresServiceCategory && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">
                服务类型<span className="text-red-500">*</span>
              </label>
              <select
                value={form.serviceCategory}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    serviceCategory: e.target.value as ServiceCategory,
                  }))
                }
                className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-container focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              >
                <option value="">请选择服务类型</option>
                {Object.entries(SERVICE_CATEGORY_TEXT).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <FormField
            label="联系电话"
            value={form.contactPhone}
            onChange={(val) => setForm((prev) => ({ ...prev, contactPhone: val }))}
            placeholder="请输入常用手机号码"
          />
          <FormField
            label="联系邮箱"
            value={form.contactEmail}
            onChange={(val) => setForm((prev) => ({ ...prev, contactEmail: val }))}
            placeholder="用于接收审核通知，可选"
          />
          <FormField
            label="服务区域/经营地址"
            value={form.address}
            onChange={(val) => setForm((prev) => ({ ...prev, address: val }))}
          />
          <FormField
            label="从业年限"
            value={form.experienceYears}
            onChange={(val) => setForm((prev) => ({ ...prev, experienceYears: val }))}
            placeholder="请填写数字"
          />
          <FormField
            label="补充说明"
            value={form.description}
            onChange={(val) => setForm((prev) => ({ ...prev, description: val }))}
            textarea
          />
          <FormField
            label="补充附件地址（多个用逗号分隔）"
            value={form.attachments}
            onChange={(val) => setForm((prev) => ({ ...prev, attachments: val }))}
            placeholder="可填写图片/文件的访问地址"
          />

          <button
            type="submit"
            disabled={!canSubmit || mutation.isPending}
            className="w-full px-4 py-3 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {mutation.isPending ? (
              <>
                <span className="inline-flex h-4 w-4 items-center justify-center">
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </span>
                <span>提交中...</span>
              </>
            ) : (
              '提交入驻申请'
            )}
          </button>
        </form>
      </main>
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  required,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  textarea?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-text-primary">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-container focus:outline-none focus:ring-2 focus:ring-primary text-sm min-h-[100px]"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-container focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        />
      )}
    </div>
  );
}

