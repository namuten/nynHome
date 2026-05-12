import React, { useState } from 'react';
import { useTags, useCreateTag, useUpdateTag, useDeleteTag } from '../../../hooks/useTags';
import { TagBadge } from '../../../components/admin/TagBadge';
import { Hash, Plus, Loader2, Save, Trash2, Edit2, X, RefreshCw } from 'lucide-react';
import type { Tag } from '../../../lib/tagsApi';

export const TagsListPage: React.FC = () => {
  const { data: tags, isLoading, isError, refetch } = useTags();
  const createMutation = useCreateTag();
  const updateMutation = useUpdateTag();
  const deleteMutation = useDeleteTag();

  // New tag input states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [color, setColor] = useState('#6844c7'); // Default brand primary

  // Edit tag modal states
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editColor, setEditColor] = useState('#6844c7');

  // Helper to convert Korean characters/spaces to lowercase alphanumeric slugs
  const handleNameChange = (val: string) => {
    setName(val);
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9ㄱ-ㅎㅏ-ㅣ가-힣\s-]/g, '') // strip special characters
      .replace(/\s+/g, '-'); // replace spaces with hyphens
    setSlug(generatedSlug);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;

    try {
      await createMutation.mutateAsync({
        name: name.trim(),
        slug: slug.trim(),
        color,
      });
      // Clear forms
      setName('');
      setSlug('');
      setColor('#6844c7');
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartEdit = (tag: Tag) => {
    setEditingTag(tag);
    setEditName(tag.name);
    setEditSlug(tag.slug);
    setEditColor(tag.color || '#6844c7');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTag || !editName.trim() || !editSlug.trim()) return;

    try {
      await updateMutation.mutateAsync({
        id: editingTag.id,
        data: {
          name: editName.trim(),
          slug: editSlug.trim(),
          color: editColor,
        },
      });
      setEditingTag(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('이 태그를 정말로 삭제하시겠습니까?\n삭제 시 해당 태그와 블로그/쇼케이스 간의 모든 연결 매핑이 CASCADE 영구 삭제됩니다.')) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 text-left animate-fade-in">
      {/* 1. Header Area */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-surface-container pb-6">
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface flex items-center gap-2.5 tracking-tight">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <Hash className="w-6 h-6 sm:w-7 h-7" />
            </div>
            태그 마스터 보드
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant font-medium leading-relaxed">
            블로그와 포트폴리오 쇼케이스의 유기적인 메타 인덱스 태그를 설정하고, 맞춤형 컬러 스키마를 정밀 컨트롤합니다.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-surface-container text-on-surface-variant hover:text-primary hover:border-primary/20 rounded-xl text-xs font-bold transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          피드 실시간 동기화
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* 2. New Tag Creator Form */}
        <div className="lg:col-span-1">
          <div className="p-6 rounded-2xl bg-white border border-surface-container shadow-sm hover:shadow-md transition-all duration-300 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-surface-container">
              <Plus className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-extrabold text-on-surface">새로운 태그 수립</h2>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant/80">태그 이름</label>
                <input
                  type="text"
                  placeholder="예: React, 3D 가공, 신소재"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full bg-[#fbf8ff] border border-surface-container focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-3 text-xs font-semibold text-on-surface outline-none transition-all placeholder:text-on-surface-variant/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant/80">식별자 슬러그 (Slug)</label>
                <input
                  type="text"
                  placeholder="예: react, 3d-processing, material"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full bg-[#fbf8ff] border border-surface-container focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-3 text-xs font-mono font-semibold text-on-surface outline-none transition-all placeholder:text-on-surface-variant/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant/80">태그 컬러 스펙트럼</label>
                <div className="flex gap-2 items-center">
                  <div className="relative w-10 h-10 shrink-0 rounded-xl border border-surface-container overflow-hidden group">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer"
                    />
                  </div>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="flex-1 bg-[#fbf8ff] border border-surface-container focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-2.5 text-xs font-mono font-semibold text-on-surface outline-none transition-all"
                  />
                </div>
              </div>

              {/* Dynamic Design Preview */}
              <div className="p-4 bg-[#fbf8ff] rounded-xl border border-surface-container flex flex-col gap-2">
                <span className="text-[10px] text-on-surface-variant/60 font-extrabold tracking-wider uppercase">실시간 UI 프리뷰</span>
                <div className="flex items-center min-h-[32px]">
                  <TagBadge tag={{ id: 0, name: name || '태그 샘플', slug, color, createdAt: '' }} />
                </div>
              </div>

              <button
                type="submit"
                disabled={createMutation.isPending || !name.trim() || !slug.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary hover:bg-primary/95 text-white disabled:opacity-40 disabled:pointer-events-none rounded-xl text-xs font-bold transition-all duration-300 shadow-md shadow-primary/10 active:scale-98 cursor-pointer"
              >
                {createMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                <span>새 태그 등록</span>
              </button>
            </form>
          </div>
        </div>

        {/* 3. Tags Grid & Table List */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-surface-container rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-surface-container flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-on-surface">현재 생성된 태그 리스트</h2>
              <span className="px-2.5 py-1 text-xs font-bold text-primary bg-primary/10 rounded-full">
                총 {tags?.length || 0}개
              </span>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-on-surface-variant/50">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="text-xs font-semibold">데이터베이스 태그 정보 수집 중...</span>
              </div>
            ) : isError ? (
              <div className="text-center py-16 text-xs text-red-500 font-semibold bg-red-50/50">
                태그 피드를 로드하는 과정에서 시스템 오류 발생
              </div>
            ) : tags?.length === 0 ? (
              <div className="text-center py-20 text-xs text-on-surface-variant/60 font-medium">
                아직 생성된 메타 태그가 없습니다. 좌측 폼에서 첫 번째 태그를 수립해 보세요!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse table-fixed min-w-[550px]">
                  <thead>
                    <tr className="bg-[#fbf8ff] border-b border-surface-container text-[11px] font-extrabold text-on-surface-variant/70 tracking-wider uppercase">
                      <th className="px-6 py-4 w-1/12">ID</th>
                      <th className="px-6 py-4 w-4/12">디자인 프리뷰</th>
                      <th className="px-6 py-4 w-4/12">식별 슬러그 (Slug)</th>
                      <th className="px-6 py-4 w-2/12">콘텐츠 수</th>
                      <th className="px-6 py-4 w-2/12 text-right">관리 제어</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container/60">
                    {tags?.map((tag) => (
                      <tr key={tag.id} className="hover:bg-primary/5/30 transition-all duration-200">
                        <td className="px-6 py-4.5 font-mono text-xs text-on-surface-variant/50 font-bold">
                          #{tag.id}
                        </td>
                        <td className="px-6 py-4.5">
                          <TagBadge tag={tag} />
                        </td>
                        <td className="px-6 py-4.5 font-mono text-xs text-on-surface-variant font-semibold truncate">
                          {tag.slug}
                        </td>
                        <td className="px-6 py-4.5">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-[#fbf8ff] border border-surface-container text-xs font-bold text-primary">
                            {tag.contentCount || 0}개
                          </span>
                        </td>
                        <td className="px-6 py-4.5 text-right space-x-1.5">
                          <button
                            onClick={() => handleStartEdit(tag)}
                            className="p-2 bg-[#fbf8ff] hover:bg-primary/10 border border-surface-container hover:border-primary/20 text-on-surface-variant hover:text-primary rounded-xl transition-all duration-300 inline-flex items-center cursor-pointer"
                            title="수정"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(tag.id)}
                            className="p-2 bg-[#fbf8ff] hover:bg-red-50 border border-surface-container hover:border-red-100 text-on-surface-variant hover:text-red-500 rounded-xl transition-all duration-300 inline-flex items-center cursor-pointer"
                            title="삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Edit Modal Window */}
      {editingTag && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md p-6 bg-white border border-surface-container rounded-2xl shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-surface-container pb-3.5">
              <h3 className="text-sm sm:text-base font-extrabold text-on-surface flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                  <Edit2 className="w-4 h-4" />
                </div>
                태그 제어 속성 변경
              </h3>
              <button
                onClick={() => setEditingTag(null)}
                className="p-1.5 hover:bg-surface-container text-on-surface-variant/70 hover:text-on-surface rounded-xl transition-all duration-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant/80">태그 명칭</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#fbf8ff] border border-surface-container focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-3 text-xs font-semibold text-on-surface outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant/80">식별자 슬러그</label>
                <input
                  type="text"
                  value={editSlug}
                  onChange={(e) => setEditSlug(e.target.value)}
                  className="w-full bg-[#fbf8ff] border border-surface-container focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-3 text-xs font-mono font-semibold text-on-surface outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant/80">태그 컬러 스펙트럼</label>
                <div className="flex gap-2">
                  <div className="relative w-10 h-10 shrink-0 rounded-xl border border-surface-container overflow-hidden group">
                    <input
                      type="color"
                      value={editColor}
                      onChange={(e) => setEditColor(e.target.value)}
                      className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer"
                    />
                  </div>
                  <input
                    type="text"
                    value={editColor}
                    onChange={(e) => setEditColor(e.target.value)}
                    className="flex-1 bg-[#fbf8ff] border border-surface-container focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-2.5 text-xs font-mono font-semibold text-on-surface outline-none transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-2.5 justify-end border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setEditingTag(null)}
                  className="px-4 py-2.5 bg-white text-on-surface-variant hover:text-on-surface border border-surface-container rounded-xl text-xs font-bold transition-all duration-300 hover:bg-surface-container cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending || !editName.trim() || !editSlug.trim()}
                  className="flex items-center gap-1.5 px-4.5 py-2.5 bg-primary hover:bg-primary/95 text-white disabled:opacity-40 disabled:pointer-events-none rounded-xl text-xs font-bold transition-all duration-300 shadow-md shadow-primary/10 cursor-pointer"
                >
                  {updateMutation.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>변경 사항 저장</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TagsListPage;
