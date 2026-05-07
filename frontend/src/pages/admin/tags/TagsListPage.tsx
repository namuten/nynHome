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

  // 입력 폼 상태
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [color, setColor] = useState('#8b5cf6'); // 디폴트 보라

  // 편집 모달/폼 상태
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editColor, setEditColor] = useState('#8b5cf6');

  // 한글 입력을 소문자 영문-숫자 슬러그로 자동 변환해주는 도우미 기믹
  const handleNameChange = (val: string) => {
    setName(val);
    // 영문, 숫자, 한글 정규 변환 가벼운 유도
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9ㄱ-ㅎㅏ-ㅣ가-힣\s-]/g, '') // 특수문자 탈락
      .replace(/\s+/g, '-'); // 공백 대시 전환
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
      // 폼 클리어
      setName('');
      setSlug('');
      setColor('#8b5cf6');
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartEdit = (tag: Tag) => {
    setEditingTag(tag);
    setEditName(tag.name);
    setEditSlug(tag.slug);
    setEditColor(tag.color || '#8b5cf6');
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
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
      {/* 1. 헤더 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-100 flex items-center gap-2">
            <Hash className="w-7 h-7 text-violet-500" />
            어드민 태그 종합 관제실
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            블로그와 포트폴리오 쇼케이스의 색인 카테고리를 설정하고, 입체적인 테마 하이라이트 HSL 색상을 맞춤 제어합니다.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 rounded-xl text-xs font-bold transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          로그 동기화
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 2. 신규 태그 작성 컴포넌트 */}
        <div className="lg:col-span-1 space-y-5">
          <div className="p-5 rounded-2xl bg-zinc-900/30 border border-zinc-800/80 space-y-4">
            <div className="flex items-center gap-2 pb-2.5 border-b border-zinc-800/50">
              <Plus className="w-4 h-4 text-violet-500" />
              <h2 className="text-sm font-black text-zinc-200">새 태그 추가하기</h2>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs sm:text-sm">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400">태그 이름</label>
                <input
                  type="text"
                  placeholder="예: 리액트, 3D 가공"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 focus:border-violet-500 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 outline-none transition-all placeholder-zinc-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400">식별 슬러그 (Slug)</label>
                <input
                  type="text"
                  placeholder="예: react, 3d-graphics"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 focus:border-violet-500 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 outline-none transition-all placeholder-zinc-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400">태그 전용 HSL 색상</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-10 h-10 bg-zinc-950 border border-zinc-800 rounded-lg cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="flex-1 bg-zinc-950 border border-zinc-850 focus:border-violet-500 rounded-xl px-3 py-2 text-xs text-zinc-100 outline-none transition-all font-mono"
                  />
                </div>
              </div>

              {/* 프리뷰 구획 */}
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-900 flex flex-col gap-1.5">
                <span className="text-[10px] text-zinc-600 font-bold">실시간 UI 프리뷰</span>
                <div className="flex">
                  <TagBadge tag={{ id: 0, name: name || '태그명', slug, color, createdAt: '' }} />
                </div>
              </div>

              <button
                type="submit"
                disabled={createMutation.isPending || !name.trim() || !slug.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-violet-950/20"
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

        {/* 3. 태그 색인 데이터 그리드 리스트 */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-2xl bg-zinc-900/30 border border-zinc-800/80">
            <h2 className="text-sm font-black text-zinc-200 mb-4">현재 생성된 태그 피드 ({tags?.length || 0}개)</h2>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-2 text-zinc-500">
                <Loader2 className="w-7 h-7 animate-spin text-violet-500" />
                <span className="text-xs">데이터베이스 태그 정보 수집 중...</span>
              </div>
            ) : isError ? (
              <div className="text-center py-10 text-xs text-red-400">태그 피드를 로드하는 과정에서 시스템 오류 발생</div>
            ) : tags?.length === 0 ? (
              <div className="text-center py-16 text-xs text-zinc-500">
                아직 생성된 메타 태그가 없습니다. 좌측에서 첫 번째 태그를 수립해 보세요!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-zinc-300">
                  <thead className="bg-zinc-950 text-[10px] uppercase text-zinc-500 font-extrabold border-b border-zinc-850">
                    <tr>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">디자인 프리뷰</th>
                      <th className="px-4 py-3">식별 슬러그 (Slug)</th>
                      <th className="px-4 py-3">수록 콘텐츠 수</th>
                      <th className="px-4 py-3 text-right">관제 액션</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-850">
                    {tags?.map((tag) => (
                      <tr key={tag.id} className="hover:bg-zinc-900/20 transition-colors">
                        <td className="px-4 py-3.5 font-mono text-zinc-500">#{tag.id}</td>
                        <td className="px-4 py-3.5">
                          <TagBadge tag={tag} />
                        </td>
                        <td className="px-4 py-3.5 font-mono text-zinc-400">{tag.slug}</td>
                        <td className="px-4 py-3.5">
                          <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 font-extrabold">
                            {tag.contentCount || 0}개
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right space-x-2">
                          <button
                            onClick={() => handleStartEdit(tag)}
                            className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-violet-400 rounded-lg transition-all inline-flex items-center"
                            title="수정"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(tag.id)}
                            className="p-1.5 bg-zinc-900 hover:bg-red-950/40 border border-zinc-800 text-zinc-500 hover:text-red-400 rounded-lg transition-all inline-flex items-center"
                            title="영구 삭제"
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

      {/* 4. 수정 모달 콘솔 */}
      {editingTag && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md p-6 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <h3 className="text-sm sm:text-base font-black text-zinc-200">태그 제어 정보 변경</h3>
              <button
                onClick={() => setEditingTag(null)}
                className="p-1 text-zinc-500 hover:text-zinc-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs sm:text-sm">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400">태그 명칭</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-violet-500 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400">식별 슬러그</label>
                <input
                  type="text"
                  value={editSlug}
                  onChange={(e) => setEditSlug(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-violet-500 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400">HSL 컬러 매핑</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={editColor}
                    onChange={(e) => setEditColor(e.target.value)}
                    className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-lg cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={editColor}
                    onChange={(e) => setEditColor(e.target.value)}
                    className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-violet-500 rounded-xl px-3 py-2 text-xs text-zinc-100 outline-none transition-all font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-2 justify-end border-t border-zinc-850">
                <button
                  type="button"
                  onClick={() => setEditingTag(null)}
                  className="px-4 py-2 bg-zinc-900 text-zinc-400 border border-zinc-800 rounded-xl text-xs font-bold transition-all hover:bg-zinc-800 hover:text-zinc-200"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending || !editName.trim() || !editSlug.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                >
                  {updateMutation.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>변경 저장</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};
export default TagsListPage;
