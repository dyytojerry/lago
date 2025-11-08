'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Loading } from '@/components/Loading';
import { BottomNavigation } from '@/components/BottomNavigation';
import { useProducts } from '@/lib/apis/products';
import { Package, Upload, X, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PublishPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'toys' as 'toys' | 'gaming',
    type: 'rent' as 'rent' | 'sell' | 'both',
    price: '',
    deposit: '',
    images: [] as string[],
    location: '',
    communityId: '',
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createMutation = useProducts({
    onSuccess: () => {
      toast.success('发布成功，等待审核');
      router.push('/profile/products');
    },
    onError: (error: any) => {
      toast.error(error.message || '发布失败');
      setIsSubmitting(false);
    },
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + imageFiles.length > 9) {
      toast.error('最多只能上传9张图片');
      return;
    }

    const newFiles = [...imageFiles, ...files];
    setImageFiles(newFiles);

    // 生成预览
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const handleRemoveImage = (index: number) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('请输入商品标题');
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('请输入有效的价格');
      return;
    }

    if (imageFiles.length === 0) {
      toast.error('请至少上传一张商品图片');
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: 上传图片到OSS，获取URL
      // 这里先用占位符
      const imageUrls = imagePreviews; // 实际应该上传后获取URL

      await createMutation.mutateAsync({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        type: formData.type,
        price: parseFloat(formData.price),
        deposit: formData.deposit ? parseFloat(formData.deposit) : undefined,
        images: imageUrls,
        location: formData.location || undefined,
        communityId: formData.communityId || undefined,
      });
    } catch (error) {
      // Error handled in onError
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="发布商品" showBack />

      <main className="max-w-7xl mx-auto px-4 py-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 商品图片 */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              商品图片 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {imagePreviews.length < 9 && (
                <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                  <Upload className="w-6 h-6 text-gray-400 mb-1" />
                  <span className="text-xs text-text-secondary">上传</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                </label>
              )}
            </div>
            <p className="text-xs text-text-secondary mt-2">最多上传9张图片</p>
          </div>

          {/* 商品标题 */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              商品标题 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="请输入商品标题"
              className="w-full px-4 py-2 bg-container rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
              maxLength={50}
            />
          </div>

          {/* 商品描述 */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              商品描述
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="请输入商品描述..."
              rows={4}
              className="w-full px-4 py-2 bg-container rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              maxLength={500}
            />
            <p className="text-xs text-text-secondary mt-1">
              {formData.description.length}/500
            </p>
          </div>

          {/* 分类 */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              商品分类 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, category: 'toys' })}
                className={`flex-1 px-4 py-2 rounded-lg text-sm transition-colors ${
                  formData.category === 'toys'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-text-primary'
                }`}
              >
                玩具
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, category: 'gaming' })}
                className={`flex-1 px-4 py-2 rounded-lg text-sm transition-colors ${
                  formData.category === 'gaming'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-text-primary'
                }`}
              >
                游戏机
              </button>
            </div>
          </div>

          {/* 交易类型 */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              交易类型 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'rent' })}
                className={`flex-1 px-4 py-2 rounded-lg text-sm transition-colors ${
                  formData.type === 'rent'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-text-primary'
                }`}
              >
                租赁
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'sell' })}
                className={`flex-1 px-4 py-2 rounded-lg text-sm transition-colors ${
                  formData.type === 'sell'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-text-primary'
                }`}
              >
                出售
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'both' })}
                className={`flex-1 px-4 py-2 rounded-lg text-sm transition-colors ${
                  formData.type === 'both'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-text-primary'
                }`}
              >
                租售
              </button>
            </div>
          </div>

          {/* 价格 */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              价格 <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-text-secondary">¥</span>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="flex-1 px-4 py-2 bg-container rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {formData.type === 'rent' && (
                <span className="text-sm text-text-secondary">/天</span>
              )}
            </div>
          </div>

          {/* 押金（仅租赁） */}
          {formData.type === 'rent' || formData.type === 'both' ? (
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                押金（可选）
              </label>
              <div className="flex items-center gap-2">
                <span className="text-text-secondary">¥</span>
                <input
                  type="number"
                  value={formData.deposit}
                  onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="flex-1 px-4 py-2 bg-container rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          ) : null}

          {/* 位置 */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              位置
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="请输入位置信息（可选）"
              className="w-full px-4 py-2 bg-container rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* 提交按钮 */}
          <div className="pt-4 pb-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '发布中...' : '发布商品'}
            </button>
            <p className="text-xs text-text-secondary text-center mt-2">
              发布后需要等待平台审核
            </p>
          </div>
        </form>
      </main>

      <BottomNavigation />
    </div>
  );
}

