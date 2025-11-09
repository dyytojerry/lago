"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Header } from "@/components/Header";
import {
  useAdminOnboardingDetail,
  useAdminOnboardingApprove,
  useAdminOnboardingReject,
} from "@/lib/apis/adminonboarding";
import {
  OnboardingApplicationStatus,
  OnboardingApplicationType,
  OnboardingApplicationCreateRequestServiceCategory,
} from "@/lib/apis/types";
import { Loading } from "@/components/Loading";
import toast from "react-hot-toast";
import { ProtectedRoute } from "@lago/ui";

const TYPE_TEXT: Record<OnboardingApplicationType, string> = {
  personal_seller: "个人卖家",
  small_business_seller: "小微商家",
  personal_service_provider: "个人服务商",
  enterprise_service_provider: "企业服务商",
};

const SERVICE_CATEGORY_TEXT: Record<
  OnboardingApplicationCreateRequestServiceCategory,
  string
> = {
  recycling: "废品回收",
  appliance_repair: "家电维修",
  appliance_install: "家电安装",
  appliance_cleaning: "家电清洗",
  furniture_repair: "家具维修",
  carpentry: "木工",
  masonry: "泥工砌筑",
  tiling: "瓦工贴砖",
  painting: "油漆翻新",
  plumbing: "水管/管道服务",
  electrician: "电工服务",
  hvac_install: "暖通空调",
  locksmith: "开锁换锁",
  pest_control: "除虫除害",
  cleaning: "专业保洁",
  moving_service: "搬家搬运",
  landscaping: "园艺绿化",
  decoration_design: "装修设计",
  renovation_general: "整体装修",
  other: "其他",
};

const STATUS_META: Record<
  OnboardingApplicationStatus,
  { text: string; className: string }
> = {
  pending: { text: "草稿", className: "bg-gray-100 text-gray-600" },
  processing: { text: "待审核", className: "bg-yellow-100 text-yellow-700" },
  approved: { text: "已通过", className: "bg-emerald-100 text-emerald-600" },
  rejected: { text: "已拒绝", className: "bg-red-100 text-red-600" },
};

export default function OnboardingDetailPage() {
  return (
    <ProtectedRoute>
      <OnboardingDetailContent />
    </ProtectedRoute>
  );
}
function OnboardingDetailContent() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [rejectReason, setRejectReason] = useState("");

  const { data, isLoading } = useAdminOnboardingDetail({ id: params.id });
  const application = data?.data?.application;

  const approveMutation = useAdminOnboardingApprove(
    { id: params.id },
    {
      onSuccess: () => {
        toast.success("已通过该入驻申请");
        router.refresh();
      },
      onError: (error: any) => {
        toast.error(error?.message || "操作失败");
      },
    }
  );

  const rejectMutation = useAdminOnboardingReject(
    { id: params.id },
    {
      onSuccess: () => {
        toast.success("已拒绝该入驻申请");
        router.refresh();
      },
      onError: (error: any) => {
        toast.error(error?.message || "操作失败");
      },
    }
  );

  const handleApprove = () => {
    approveMutation.mutate(null);
  };

  const handleReject = () => {
    if (!rejectReason) {
      toast.error("请输入拒绝原因");
      return;
    }
    rejectMutation.mutate({ reason: rejectReason });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="入驻详情" />
        <Loading text="加载中..." />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="入驻详情" />
        <main className="max-w-4xl mx-auto px-6 py-10">
          <p className="text-sm text-gray-500">未找到入驻申请。</p>
        </main>
      </div>
    );
  }

  const statusMeta =
    STATUS_META[application.status as OnboardingApplicationStatus];

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <Header title="入驻详情" />
      <main className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        <section className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {TYPE_TEXT[application.type as OnboardingApplicationType]}
              </h2>
              <p className="text-xs text-gray-500">
                申请编号：{application.id}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs ${statusMeta.className}`}
            >
              {statusMeta.text}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <InfoRow label="申请人">
              {application.fullName ||
                application.businessName ||
                application.user?.nickname ||
                "—"}
            </InfoRow>
            <InfoRow label="手机号">
              {application.contactPhone || application.user?.phone || "—"}
            </InfoRow>
            <InfoRow label="邮箱">
              {application.contactEmail || application.user?.email || "—"}
            </InfoRow>
            <InfoRow label="提交时间">
              {new Date(application.submittedAt).toLocaleString()}
            </InfoRow>
            {application.reviewedAt && (
              <InfoRow label="审核时间">
                {new Date(application.reviewedAt).toLocaleString()}
              </InfoRow>
            )}
            {application.serviceCategory && (
              <InfoRow label="服务类别">
                {
                  SERVICE_CATEGORY_TEXT[
                    application.metadata
                      ?.serviceCategory as OnboardingApplicationCreateRequestServiceCategory
                  ]
                }
              </InfoRow>
            )}
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">主体信息</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            {application.fullName && (
              <InfoRow label="姓名">{application.fullName}</InfoRow>
            )}
            {application.idNumber && (
              <InfoRow label="身份证号">{application.idNumber}</InfoRow>
            )}
            {application.businessName && (
              <InfoRow label="企业名称">{application.businessName}</InfoRow>
            )}
            {application.businessLicenseNumber && (
              <InfoRow label="营业执照号">
                {application.businessLicenseNumber}
              </InfoRow>
            )}
            {application.address && (
              <InfoRow label="所在地区">{application.address}</InfoRow>
            )}
            {application.experienceYears !== null &&
              application.experienceYears !== undefined && (
                <InfoRow label="从业年限">
                  {application.experienceYears} 年
                </InfoRow>
              )}
          </div>

          {application.description && (
            <div className="text-sm text-gray-700 bg-gray-50 rounded-xl px-4 py-3">
              <span className="font-medium text-gray-900">补充说明：</span>
              <p className="mt-1 leading-6 text-gray-600">
                {application.description}
              </p>
            </div>
          )}
        </section>

        {application.documents && (
          <section className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">提交材料</h3>
            <DocumentList documents={application.documents} />
          </section>
        )}

        {application.rejectReason && (
          <section className="bg-red-50 border border-red-100 rounded-2xl p-4 text-sm text-red-600">
            <div className="font-medium mb-1">拒绝原因</div>
            <p>{application.rejectReason}</p>
          </section>
        )}

        {application.status === "processing" && (
          <section className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">审核操作</h3>
            <div className="flex flex-col md:flex-row gap-3">
              <button
                onClick={handleApprove}
                disabled={approveMutation.isPending}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700 transition disabled:opacity-60"
              >
                {approveMutation.isPending ? "处理中..." : "通过申请"}
              </button>
              <div className="flex-1 flex items-center gap-2">
                <input
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="输入拒绝原因"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
                <button
                  onClick={handleReject}
                  disabled={rejectMutation.isPending}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 transition disabled:opacity-60"
                >
                  {rejectMutation.isPending ? "处理中..." : "拒绝申请"}
                </button>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-sm text-gray-800">{children}</div>
    </div>
  );
}

function DocumentList({ documents }: { documents: Record<string, any> }) {
  const entries = Object.entries(documents || {});
  if (entries.length === 0) return null;
  return (
    <div className="space-y-3 text-sm text-gray-700">
      {entries.map(([key, value]) => (
        <div key={key}>
          <div className="text-xs text-gray-500 mb-1">{key}</div>
          {Array.isArray(value) ? (
            <ul className="list-disc list-inside space-y-1">
              {value.map((item) => (
                <li key={item}>
                  <a
                    href={item}
                    className="text-blue-600 hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          ) : typeof value === "string" ? (
            <a
              href={value}
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              {value}
            </a>
          ) : (
            <pre className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 overflow-x-auto">
              {JSON.stringify(value, null, 2)}
            </pre>
          )}
        </div>
      ))}
    </div>
  );
}
