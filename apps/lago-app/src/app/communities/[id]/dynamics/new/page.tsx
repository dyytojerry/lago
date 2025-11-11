"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { MultiMediaUploader, UploadedMedia } from "@lago/ui";
import { defaultUploadHandler } from "@/lib/upload";
import { useCommunitieCreateDynamic } from "@/lib/apis/communities";
import toast from "react-hot-toast";

const TYPE_OPTIONS = [
  { value: "announcement", label: "动态" },
  { value: "event", label: "活动" },
  { value: "market", label: "摆摊" },
  { value: "festival", label: "节庆" },
  { value: "other", label: "其他" },
] as const;

export default function CreateCommunityDynamicPage() {
  const router = useRouter();
  const params = useParams();
  const communityId = params.id as string;
  const uploadHandler = useMemo(() => defaultUploadHandler, []);

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    type: "announcement" as (typeof TYPE_OPTIONS)[number]["value"],
    startTime: "",
    endTime: "",
  });
  const [images, setImages] = useState<UploadedMedia[]>([]);

  const createMutation = useCommunitieCreateDynamic(
    { id: communityId },
    {
      onSuccess: () => {
        toast.success("动态发布成功");
        router.replace(`/communities/${communityId}`);
      },
      onError: (error: any) => {
        toast.error(error?.message || "发布动态失败");
      },
    }
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.title.trim()) {
      toast.error("请输入动态标题");
      return;
    }

    try {
      await createMutation.mutateAsync({
        title: form.title.trim(),
        description: form.description?.trim() || undefined,
        location: form.location?.trim() || undefined,
        type: form.type,
        startTime: form.startTime ? new Date(form.startTime).toISOString() : undefined,
        endTime: form.endTime ? new Date(form.endTime).toISOString() : undefined,
        images: images.map((item) => item.url).filter(Boolean),
      });
    } catch (error) {
      // handled in onError
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="发布小区动态" showBack />

      <main className="max-w-3xl mx-auto px-4 py-4">
        <form onSubmit={handleSubmit} className="space-y-5">
          <section className="bg-white rounded-3xl shadow-sm p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                动态标题 <span className="text-red-500">*</span>
              </label>
              <input
                value={form.title}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, title: event.target.value }))
                }
                placeholder="请输入动态标题"
                maxLength={80}
                className="w-full px-4 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-text-tertiary mt-1">
                {form.title.length}/80
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                动态内容
              </label>
              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, description: event.target.value }))
                }
                placeholder="分享社区公告、活动通知或即时动态..."
                rows={4}
                maxLength={1000}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
              <p className="text-xs text-text-tertiary mt-1">
                {form.description.length}/1000
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                类型
              </label>
              <div className="flex flex-wrap gap-2">
                {TYPE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, type: option.value }))}
                    className={`px-4 py-2 rounded-full text-sm transition-colors ${
                      form.type === option.value
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-text-primary"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  开始时间
                </label>
                <input
                  type="datetime-local"
                  value={form.startTime}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, startTime: event.target.value }))
                  }
                  className="w-full px-4 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  结束时间
                </label>
                <input
                  type="datetime-local"
                  value={form.endTime}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, endTime: event.target.value }))
                  }
                  className="w-full px-4 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                地点
              </label>
              <input
                value={form.location}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, location: event.target.value }))
                }
                placeholder="如：社区广场、物业服务中心等"
                maxLength={200}
                className="w-full px-4 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-text-tertiary mt-1">
                {form.location.length}/200
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                动态图片
              </label>
              <MultiMediaUploader
                accept="image"
                uploadHandler={uploadHandler}
                value={images}
                onChange={setImages}
                maxFiles={9}
                onError={(error) => toast.error(error.message)}
              />
              <p className="text-xs text-text-tertiary mt-2">
                支持最多 9 张图片，可拖拽排序
              </p>
            </div>
          </section>

          <div className="pt-2">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full px-4 py-3 rounded-2xl bg-primary text-white font-medium shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {createMutation.isPending ? "发布中..." : "发布动态"}
            </button>
            <p className="text-xs text-text-tertiary text-center mt-2">
              发布后将立即展示在小区动态列表中
            </p>
          </div>
        </form>
      </main>

      <BottomNavigation />
    </div>
  );
}
