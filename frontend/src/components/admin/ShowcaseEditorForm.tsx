import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Sparkles, Wand2, Hash, Bookmark, Tag, Paperclip } from 'lucide-react';
import type { ShowcaseItem } from '../../types/showcase';

interface ShowcaseEditorFormProps {
  initialValues?: Partial<ShowcaseItem>;
  onSubmit: (data: any) => Promise<void>;
  titleLabel: string;
}

export default function ShowcaseEditorForm({ initialValues, onSubmit, titleLabel }: ShowcaseEditorFormProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 개별 필드 상태 제어
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Full-Stack Web');
  const [locale, setLocale] = useState<'ko' | 'en'>('ko');
  const [tagsInput, setTagsInput] = useState('');
  const [coverMediaIdInput, setCoverMediaIdInput] = useState('');
  const [mediaIdsInput, setMediaIdsInput] = useState('');
  const [postIdInput, setPostIdInput] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    if (initialValues) {
      setTitle(initialValues.title || '');
      setSlug(initialValues.slug || '');
      setDescription(initialValues.description || '');
      setCategory(initialValues.category || 'Full-Stack Web');
      setLocale(initialValues.locale || 'ko');
      setTagsInput(initialValues.tags ? initialValues.tags.join(', ') : '');
      setCoverMediaIdInput(initialValues.coverMediaId ? String(initialValues.coverMediaId) : '');
      setMediaIdsInput(initialValues.mediaIds ? initialValues.mediaIds.join(', ') : '');
      setPostIdInput(initialValues.postId ? String(initialValues.postId) : '');
      setIsFeatured(!!initialValues.isFeatured);
      setIsPublished(!!initialValues.isPublished);
    }
  }, [initialValues]);

  // 타이틀 기반 오토 슬러그(Auto Slug) 매직 변환기
  const handleAutoGenerateSlug = () => {
    if (!title.trim()) {
      alert('슬러그를 생성하기 전에 먼저 제목을 입력해 주세요.');
      return;
    }
    const generated = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // 특수문자 제거
      .replace(/\s+/g, '-') // 공백을 하이픈으로 대체
      .replace(/-+/g, '-'); // 여러 하이픈을 단일 하이픈으로 대체
    setSlug(generated);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    // 쉼표 기반 입력 파싱 처리
    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const parsedMediaIds = mediaIdsInput
      .split(',')
      .map((id) => parseInt(id.trim(), 10))
      .filter((id) => !isNaN(id) && id > 0);

    const coverMediaId = coverMediaIdInput.trim() ? parseInt(coverMediaIdInput.trim(), 10) : null;
    const postId = postIdInput.trim() ? parseInt(postIdInput.trim(), 10) : null;

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      description: description.trim() || null,
      category: category.trim(),
      locale,
      tags: parsedTags.length > 0 ? parsedTags : null,
      coverMediaId: isNaN(coverMediaId as any) ? null : coverMediaId,
      mediaIds: parsedMediaIds.length > 0 ? parsedMediaIds : null,
      postId: isNaN(postId as any) ? null : postId,
      isFeatured,
      isPublished,
    };

    try {
      await onSubmit(payload);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.response?.data?.message || err?.message || '쇼케이스 저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-8 font-body animate-fade-in max-w-4xl">
      {/* 1. 상단 액션 바 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-outline-variant/30 pb-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/showcase')}
            className="p-2 rounded-xl border border-outline-variant/40 hover:bg-surface-container transition-all text-on-surface-variant bg-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-display font-black text-on-surface flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              <span>{titleLabel}</span>
            </h1>
            <p className="text-[10px] text-on-surface-variant font-medium mt-0.5">
              독창적이고 뛰어난 포트폴리오 쇼케이스 콘텐츠를 추가하거나 편집합니다.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/admin/showcase')}
            className="px-4 py-2.5 border border-outline-variant/40 bg-white rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-container transition-all"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary hover:bg-primary/95 text-on-primary text-xs font-bold rounded-xl hover:shadow-lg transition-all active:scale-98 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? '저장 중...' : '쇼케이스 저장'}</span>
          </button>
        </div>
      </div>

      {/* 2. 에러 알림 */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-xs font-semibold text-red-600">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* 3. 본체 레이아웃 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 좌측 메인 입력 영역 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 제목 */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface">작품 제목 *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 🚀 CrocHub: 배터리 통합 수명 대시보드"
              className="w-full px-4 py-3 bg-white border border-outline-variant/50 rounded-2xl text-xs font-semibold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
            />
          </div>

          {/* 슬러그 (Auto-generate 지원) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-on-surface flex items-center gap-1">
                <Hash className="w-3.5 h-3.5" />
                <span>접근 슬러그 (Slug URL) *</span>
              </label>
              <button
                type="button"
                onClick={handleAutoGenerateSlug}
                className="inline-flex items-center gap-1 px-2.5 py-1 border border-primary/20 hover:bg-primary/5 rounded-lg text-[10px] font-bold text-primary transition-all bg-white"
              >
                <Wand2 className="w-3 h-3" />
                <span>제목 기반 자동 생성</span>
              </button>
            </div>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="예: crochub-iot-dashboard (소문자, 숫자, 하이픈만 허용)"
              className="w-full px-4 py-3 bg-white border border-outline-variant/50 rounded-2xl text-xs font-semibold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
            />
            <p className="text-[10px] text-on-surface-variant font-semibold">
              미리보기 URL: <span className="font-mono text-primary">/portfolio/showcase/{slug || ':slug'}</span>
            </p>
          </div>

          {/* 설명 본문 */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface">작품 상세 설명 (Description)</label>
            <textarea
              rows={12}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="프로젝트가 해결하고자 한 과제, 기술 사양, 아키텍처, 획득한 성과에 대해 기술해 보세요. 줄바꿈이 깔끔하게 상영됩니다..."
              className="w-full px-4 py-4 bg-white border border-outline-variant/50 rounded-3xl text-xs font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition leading-relaxed"
            />
          </div>
        </div>

        {/* 우측 메타데이터 제어 설정 영역 */}
        <div className="space-y-6">
          <div className="p-6 bg-white border border-outline-variant/35 rounded-3xl space-y-6 shadow-sm">
            <h3 className="text-xs font-black text-on-surface border-b border-outline-variant/20 pb-3 select-none uppercase tracking-wider">
              ⚙️ 작품 노출 메타 속성
            </h3>

            {/* 언어 설정 */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface">번역 언어 (Locale)</label>
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value as 'ko' | 'en')}
                className="w-full px-4 py-3 bg-white border border-outline-variant/50 rounded-2xl text-xs font-semibold focus:outline-none focus:border-primary transition"
              >
                <option value="ko">한국어 (Korean)</option>
                <option value="en">영어 (English)</option>
              </select>
            </div>

            {/* 카테고리 */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface flex items-center gap-1">
                <Bookmark className="w-3.5 h-3.5 text-primary" />
                <span>카테고리명 *</span>
              </label>
              <input
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="예: Full-Stack Web, 3D Graphics, AI Automation"
                className="w-full px-4 py-3 bg-white border border-outline-variant/50 rounded-2xl text-xs font-semibold focus:outline-none focus:border-primary transition"
              />
            </div>

            {/* 태그 리스트 */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-primary" />
                <span>기술 태그 (Tags)</span>
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="예: React, TypeScript, Node.js, GLSL (쉼표로 구분)"
                className="w-full px-4 py-3 bg-white border border-outline-variant/50 rounded-2xl text-xs font-semibold focus:outline-none focus:border-primary transition"
              />
            </div>

            {/* 연계 블로그 포스트 ID */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface">연관 아키텍처 블로그 Post ID</label>
              <input
                type="text"
                value={postIdInput}
                onChange={(e) => setPostIdInput(e.target.value)}
                placeholder="정수형 블로그 포스트 ID 숫자 입력 (옵션)"
                className="w-full px-4 py-3 bg-white border border-outline-variant/50 rounded-2xl text-xs font-semibold focus:outline-none focus:border-primary transition font-mono"
              />
            </div>

            {/* 미디어 첨부 ID 연결 */}
            <div className="space-y-3.5 border-t border-outline-variant/20 pt-4">
              <h4 className="text-xs font-bold text-on-surface flex items-center gap-1">
                <Paperclip className="w-3.5 h-3.5 text-primary" />
                <span>첨부 미디어 ID 연결</span>
              </h4>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-on-surface-variant uppercase tracking-wider">
                  대표 커버 미디어 ID
                </label>
                <input
                  type="text"
                  value={coverMediaIdInput}
                  onChange={(e) => setCoverMediaIdInput(e.target.value)}
                  placeholder="단일 미디어 ID 숫자 입력"
                  className="w-full px-4 py-2.5 bg-white border border-outline-variant/50 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary transition font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-on-surface-variant uppercase tracking-wider">
                  갤러리 미디어 ID 목록
                </label>
                <input
                  type="text"
                  value={mediaIdsInput}
                  onChange={(e) => setMediaIdsInput(e.target.value)}
                  placeholder="예: 1, 2, 3 (쉼표로 구분 입력)"
                  className="w-full px-4 py-2.5 bg-white border border-outline-variant/50 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary transition font-mono"
                />
              </div>
            </div>

            {/* 특징 추천 여부 토글 */}
            <div className="flex items-center justify-between py-2 border-y border-outline-variant/20">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-on-surface">⭐ 베스트 추천 등록</span>
                <p className="text-[9px] text-on-surface-variant font-medium">활성화 시 첫 상단에 배치 표기됩니다.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-container rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-surface-container-high after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
              </label>
            </div>

            {/* 퍼블릭 노출 토글 */}
            <div className="flex items-center justify-between py-1">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-on-surface">퍼블릭 페이지 공개</span>
                <p className="text-[9px] text-on-surface-variant font-medium">활성화 시 포트폴리오에 상영됩니다.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-container rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-surface-container-high after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
              </label>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
export { ShowcaseEditorForm };
