import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Save, ArrowLeft, Image as ImageIcon, Sparkles } from 'lucide-react';

const postFormSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요.').max(120, '제목은 120자 이내여야 합니다.'),
  category: z.enum(['creative', 'blog', 'study']),
  body: z.string().min(1, '본문 내용을 입력해주세요.'),
  thumbnailUrl: z.string().url('유효한 이미지 URL을 입력해주세요.').optional().or(z.literal('')),
  isPublished: z.boolean(),
});

export type PostFormFields = z.infer<typeof postFormSchema>;

interface PostEditorFormProps {
  initialValues?: Partial<PostFormFields>;
  onSubmit: (data: PostFormFields) => Promise<void>;
  titleLabel: string;
}

export default function PostEditorForm({ initialValues, onSubmit, titleLabel }: PostEditorFormProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PostFormFields>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: initialValues?.title || '',
      category: initialValues?.category || 'blog',
      body: initialValues?.body || '',
      thumbnailUrl: initialValues?.thumbnailUrl || '',
      isPublished: initialValues?.isPublished ?? false,
    },
  });

  const thumbnailVal = watch('thumbnailUrl');

  const onFormSubmit: SubmitHandler<PostFormFields> = async (data) => {
    try {
      setLoading(true);
      setErrorMsg(null);
      // Clean up empty thumbnail URLs
      const cleanedData = {
        ...data,
        thumbnailUrl: data.thumbnailUrl ? data.thumbnailUrl : undefined,
      };
      await onSubmit(cleanedData);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || '저장하는 과정에서 오류가 발생했습니다. 입력값을 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8 font-body animate-fade-in max-w-4xl">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-surface-container pb-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/content')}
            className="p-2 rounded-xl border border-surface-container hover:bg-surface-container transition-all text-on-surface-variant"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-display font-black text-on-surface flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              <span>{titleLabel}</span>
            </h1>
            <p className="text-[10px] text-on-surface-variant font-medium mt-0.5">
              독창적인 아티스틱 콘텐츠와 학습 일지를 정교하게 가공합니다.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/admin/content')}
            className="px-4 py-2.5 border border-surface-container bg-white rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-container transition-all"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-primary hover:bg-primary-container hover:text-primary text-white text-xs font-bold rounded-xl transition duration-300 shadow-md shadow-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? '저장 중...' : '콘텐츠 저장'}</span>
          </button>
        </div>
      </div>

      {/* Error message */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-xs font-semibold text-red-600">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Editor Main Canvas layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Editor Body inputs (Col span 2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Post Title */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-on-surface">제목</label>
            <input
              type="text"
              {...register('title')}
              placeholder="예술적인 영감을 담은 제목을 적어보세요..."
              className={`w-full px-4 py-3 bg-white border rounded-2xl text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                errors.title ? 'border-red-400 focus:ring-red-100' : 'border-surface-container focus:border-primary'
              }`}
            />
            {errors.title && <p className="text-[10px] font-medium text-red-500">{errors.title.message}</p>}
          </div>

          {/* Post Body Textarea */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-on-surface">본문 내용</label>
            <textarea
              {...register('body')}
              rows={16}
              placeholder="내용을 정교하게 입력해보세요. 마크다운 스타일과 줄바꿈이 완벽하게 보존됩니다..."
              className={`w-full px-4 py-4 bg-white border rounded-3xl text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-primary/20 leading-relaxed ${
                errors.body ? 'border-red-400 focus:ring-red-100' : 'border-surface-container focus:border-primary'
              }`}
            />
            {errors.body && <p className="text-[10px] font-medium text-red-500">{errors.body.message}</p>}
          </div>
        </div>

        {/* Right Column: Meta settings (Col span 1) */}
        <div className="space-y-6">
          {/* Settings glass container */}
          <div className="p-6 bg-white border border-surface-container rounded-3xl space-y-6 shadow-sm">
            <h3 className="text-xs font-black text-on-surface border-b border-surface-container pb-3 select-none">
              메타 속성 지정
            </h3>

            {/* Category Select */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface">카테고리</label>
              <select
                {...register('category')}
                className="w-full px-4 py-3 bg-white border border-surface-container rounded-2xl text-xs font-semibold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              >
                <option value="creative">창작 (Creative)</option>
                <option value="blog">블로그 (Blog)</option>
                <option value="study">학습 (Study)</option>
              </select>
            </div>

            {/* Publishing toggler */}
            <div className="flex items-center justify-between py-2 border-y border-surface-container-low/50">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-on-surface">공개 게시 여부</span>
                <p className="text-[9px] text-on-surface-variant font-medium">활성화 시 피드에 바로 노출됩니다.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input type="checkbox" {...register('isPublished')} className="sr-only peer" />
                <div className="w-11 h-6 bg-surface-container rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-surface-container-high after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
              </label>
            </div>

            {/* Thumbnail Image URL with Real-time Preview */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface">대표 썸네일 이미지 URL</label>
              <input
                type="text"
                {...register('thumbnailUrl')}
                placeholder="https://images.unsplash.com/..."
                className={`w-full px-4 py-3 bg-white border rounded-2xl text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  errors.thumbnailUrl ? 'border-red-400 focus:ring-red-100' : 'border-surface-container focus:border-primary'
                }`}
              />
              {errors.thumbnailUrl && (
                <p className="text-[10px] font-medium text-red-500">{errors.thumbnailUrl.message}</p>
              )}

              {/* Real-time image thumbnail preview panel */}
              <div className="mt-4 border border-dashed border-surface-container rounded-2xl aspect-video overflow-hidden bg-surface-container/20 flex flex-col items-center justify-center relative">
                {thumbnailVal && !errors.thumbnailUrl ? (
                  <img
                    src={thumbnailVal}
                    alt="Thumbnail Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="text-center p-4 text-on-surface-variant/50 select-none">
                    <ImageIcon className="w-6 h-6 mx-auto mb-1.5 opacity-40" />
                    <span className="text-[10px] font-bold">썸네일 이미지 미설정</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
