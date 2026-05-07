import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminCollections, useCreateCollection, useUpdateCollection, useDeleteCollection } from '../../../hooks/useCollections';
import { FolderHeart, Plus, Loader2, Save, Trash2, Edit2, X, RefreshCw, Eye, EyeOff, LayoutGrid } from 'lucide-react';
import type { Collection } from '../../../lib/collectionsApi';

export const CollectionsListPage: React.FC = () => {
  const { data: collections, isLoading, isError, refetch } = useAdminCollections();
  const createMutation = useCreateCollection();
  const updateMutation = useUpdateCollection();
  const deleteMutation = useDeleteCollection();
  const navigate = useNavigate();

  // 신규 생성 양식 상태
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublished, setIsPublished] = useState(false);

  // 수정 양식 상태
  const [editingCol, setEditingCol] = useState<Collection | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editIsPublished, setEditIsPublished] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await createMutation.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        isPublished,
      });
      setTitle('');
      setDescription('');
      setIsPublished(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartEdit = (col: Collection) => {
    setEditingCol(col);
    setEditTitle(col.title);
    setEditDescription(col.description || '');
    setEditIsPublished(col.isPublished);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCol || !editTitle.trim()) return;

    try {
      await updateMutation.mutateAsync({
        id: editingCol.id,
        data: {
          title: editTitle.trim(),
          description: editDescription.trim() || undefined,
          isPublished: editIsPublished,
        },
      });
      setEditingCol(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('이 컬렉션을 정말 영구히 삭제하시겠습니까?\n삭제 시 이 컬렉션 자체와 컬렉션 수록 매핑 정보만 소멸되며, 실제 원본 포스트나 쇼케이스 글들은 삭제되지 않고 안전하게 보존됩니다.')) {
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
      {/* 1. 상단 헤더 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-100 flex items-center gap-2.5">
            <FolderHeart className="w-7 h-7 text-emerald-500" />
            어드민 컬렉션 관제소
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            주제별로 양질의 아티클 및 쇼케이스 자산들을 하나의 멋진 시리즈 묶음(Collection)으로 구성하고 순서를 정렬합니다.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 rounded-xl text-xs font-bold transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          서버 동기화
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 2. 신규 컬렉션 생성 폼 */}
        <div className="lg:col-span-1 space-y-5">
          <div className="p-5 rounded-2xl bg-zinc-900/30 border border-zinc-800/80 space-y-4">
            <div className="flex items-center gap-2 pb-2.5 border-b border-zinc-800/50">
              <Plus className="w-4 h-4 text-emerald-500" />
              <h2 className="text-sm font-black text-zinc-200">새 컬렉션 기획하기</h2>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs sm:text-sm">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400">컬렉션 시리즈 타이틀</label>
                <input
                  type="text"
                  placeholder="예: 2026 크로코 아키텍처 연감"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 outline-none transition-all placeholder-zinc-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400">시리즈 요약 설명</label>
                <textarea
                  rows={3}
                  placeholder="컬렉션의 메인 기획 테마나 방향성을 기술해 주세요..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 outline-none transition-all placeholder-zinc-600 resize-none leading-relaxed"
                />
              </div>

              {/* 공개 상태 설정 */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-950 border border-zinc-900">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-zinc-300 block">메인 시리즈 공개 여부</span>
                  <span className="text-[10px] text-zinc-500 block">체크 시 공개 리스트에 즉각 노출됩니다.</span>
                </div>
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="w-5 h-5 rounded border-zinc-800 text-emerald-500 focus:ring-emerald-500 bg-zinc-900 cursor-pointer"
                />
              </div>

              <button
                type="submit"
                disabled={createMutation.isPending || !title.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-950/20"
              >
                {createMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                <span>새 시리즈 컬렉션 등록</span>
              </button>
            </form>
          </div>
        </div>

        {/* 3. 컬렉션 그리드 테이블 */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-2xl bg-zinc-900/30 border border-zinc-800/80">
            <h2 className="text-sm font-black text-zinc-200 mb-4">현재 생성된 컬렉션 피드 ({collections?.length || 0}개)</h2>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-2 text-zinc-500">
                <Loader2 className="w-7 h-7 animate-spin text-emerald-500" />
                <span className="text-xs">데이터베이스 컬렉션 정보 수집 중...</span>
              </div>
            ) : isError ? (
              <div className="text-center py-10 text-xs text-red-400">컬렉션 피드를 로드하는 과정에서 시스템 오류 발생</div>
            ) : collections?.length === 0 ? (
              <div className="text-center py-16 text-xs text-zinc-500">
                기획된 컬렉션 시리즈가 없습니다. 좌측에서 첫 번째 모음집 시리즈를 창조해 보세요!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-zinc-300">
                  <thead className="bg-zinc-950 text-[10px] uppercase text-zinc-500 font-extrabold border-b border-zinc-850">
                    <tr>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">공개 상태</th>
                      <th className="px-4 py-3">시리즈 타이틀 / 요약</th>
                      <th className="px-4 py-3">수록물 카운트</th>
                      <th className="px-4 py-3 text-right">시리즈 배치/에디트</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-850">
                    {collections?.map((col) => (
                      <tr key={col.id} className="hover:bg-zinc-900/20 transition-colors">
                        <td className="px-4 py-3.5 font-mono text-zinc-500">#{col.id}</td>
                        <td className="px-4 py-3.5">
                          {col.isPublished ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-extrabold text-[10px]">
                              <Eye className="w-3 h-3" /> 공개
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-500 border border-zinc-800 font-extrabold text-[10px]">
                              <EyeOff className="w-3 h-3" /> 비공개
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 max-w-xs">
                          <div className="font-bold text-zinc-200 truncate">{col.title}</div>
                          <div className="text-zinc-500 text-[11px] truncate mt-0.5">
                            {col.description || '지정된 상세 기획 설명이 없습니다.'}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 font-extrabold">
                            {col.itemCount || 0}개 수록
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right space-x-1.5">
                          <button
                            onClick={() => navigate(`/admin/collections/${col.id}`)}
                            className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 rounded-lg transition-all inline-flex items-center gap-1 font-bold"
                            title="수록 아이템 순서 기획 및 수록 관리"
                          >
                            <LayoutGrid className="w-3.5 h-3.5" />
                            <span className="text-[10px]">콘텐츠 기획</span>
                          </button>
                          <button
                            onClick={() => handleStartEdit(col)}
                            className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg transition-all inline-flex items-center"
                            title="메타 편집"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(col.id)}
                            className="p-1.5 bg-zinc-900 hover:bg-red-950/40 border border-zinc-800 text-zinc-500 hover:text-red-400 rounded-lg transition-all inline-flex items-center"
                            title="시리즈 영구 삭제"
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

      {/* 4. 수정 다이얼로그 모달 */}
      {editingCol && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md p-6 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <h3 className="text-sm sm:text-base font-black text-zinc-200">컬렉션 기획 메타데이터 개정</h3>
              <button
                onClick={() => setEditingCol(null)}
                className="p-1 text-zinc-500 hover:text-zinc-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs sm:text-sm">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400">컬렉션 시리즈 타이틀</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400">시리즈 요약 설명</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 outline-none transition-all resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
                <span className="text-xs font-bold text-zinc-300">시리즈 노출 설정</span>
                <input
                  type="checkbox"
                  checked={editIsPublished}
                  onChange={(e) => setEditIsPublished(e.target.checked)}
                  className="w-5 h-5 rounded border-zinc-800 text-emerald-500 focus:ring-emerald-500 bg-zinc-950 cursor-pointer"
                />
              </div>

              <div className="pt-4 flex gap-2 justify-end border-t border-zinc-850">
                <button
                  type="button"
                  onClick={() => setEditingCol(null)}
                  className="px-4 py-2 bg-zinc-900 text-zinc-400 border border-zinc-800 rounded-xl text-xs font-bold transition-all hover:bg-zinc-800 hover:text-zinc-200"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending || !editTitle.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all shadow-md"
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
export default CollectionsListPage;
