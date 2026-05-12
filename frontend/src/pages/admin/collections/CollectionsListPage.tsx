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

  // New collection input states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublished, setIsPublished] = useState(false);

  // Edit collection modal states
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
    <div className="max-w-6xl mx-auto space-y-8 text-left animate-fade-in">
      {/* 1. Header Area */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-surface-container pb-6">
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface flex items-center gap-2.5 tracking-tight">
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100">
              <FolderHeart className="w-6 h-6 sm:w-7 h-7" />
            </div>
            컬렉션 마스터 기획실
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant font-medium leading-relaxed">
            주제별로 고품격 포스트와 쇼케이스 창작물을 하나의 유기적인 연재 시리즈(Collection)로 구성하고 기획 순서를 정밀 정렬합니다.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-surface-container text-on-surface-variant hover:text-emerald-600 hover:border-emerald-100 rounded-xl text-xs font-bold transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          서버 동기화 리프레시
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* 2. Create Collection Form */}
        <div className="lg:col-span-1">
          <div className="p-6 rounded-2xl bg-white border border-surface-container shadow-sm hover:shadow-md transition-all duration-300 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-surface-container">
              <Plus className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-extrabold text-on-surface">새로운 연재 컬렉션 기획</h2>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant/80">컬렉션 시리즈 타이틀</label>
                <input
                  type="text"
                  placeholder="예: 2026 크로코 아키텍처 연감"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#fbf8ff] border border-surface-container focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 rounded-xl px-4 py-3 text-xs font-semibold text-on-surface outline-none transition-all placeholder:text-on-surface-variant/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant/80">시리즈 요약 설명</label>
                <textarea
                  rows={4}
                  placeholder="컬렉션의 기획 주안점 및 주요 전달 메시지를 서술해 주세요..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#fbf8ff] border border-surface-container focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 rounded-xl px-4 py-3 text-xs font-semibold text-on-surface outline-none transition-all placeholder:text-on-surface-variant/30 resize-none leading-relaxed"
                />
              </div>

              {/* Publish Toggle Box */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-[#fbf8ff] border border-surface-container">
                <div className="space-y-0.5 pr-2">
                  <span className="text-xs font-bold text-on-surface block">시리즈 즉각 노출</span>
                  <span className="text-[10px] text-on-surface-variant/60 block leading-tight">체크 시 방문객용 시리즈 리스트에 즉시 발행됩니다.</span>
                </div>
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="w-5 h-5 rounded-lg border-surface-container text-emerald-600 focus:ring-emerald-500 bg-white cursor-pointer accent-emerald-600 shrink-0"
                />
              </div>

              <button
                type="submit"
                disabled={createMutation.isPending || !title.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:pointer-events-none text-white rounded-xl text-xs font-bold transition-all duration-300 shadow-md shadow-emerald-100 active:scale-98 cursor-pointer"
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

        {/* 3. Collections Grid & Table List */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-surface-container rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-surface-container flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-on-surface">현재 구성된 컬렉션 리스트</h2>
              <span className="px-2.5 py-1 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full">
                총 {collections?.length || 0}개
              </span>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-on-surface-variant/50">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                <span className="text-xs font-semibold">데이터베이스 컬렉션 정보 수집 중...</span>
              </div>
            ) : isError ? (
              <div className="text-center py-16 text-xs text-red-500 font-semibold bg-red-50/50">
                컬렉션 피드를 로드하는 과정에서 시스템 오류 발생
              </div>
            ) : collections?.length === 0 ? (
              <div className="text-center py-20 text-xs text-on-surface-variant/60 font-medium">
                아직 생성된 컬렉션이 없습니다. 좌측 폼에서 첫 번째 컬렉션 시리즈를 창조해 보세요!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse table-fixed min-w-[650px]">
                  <thead>
                    <tr className="bg-[#fbf8ff] border-b border-surface-container text-[11px] font-extrabold text-on-surface-variant/70 tracking-wider uppercase">
                      <th className="px-6 py-4 w-1/12">ID</th>
                      <th className="px-6 py-4 w-2/12">공개 여부</th>
                      <th className="px-6 py-4 w-4/12">시리즈 타이틀 및 요약 설명</th>
                      <th className="px-6 py-4 w-2/12">수록물 수</th>
                      <th className="px-6 py-4 w-3/12 text-right">시리즈 배치 / 제어</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container/60">
                    {collections?.map((col) => (
                      <tr key={col.id} className="hover:bg-emerald-50/10 transition-all duration-200">
                        <td className="px-6 py-4.5 font-mono text-xs text-on-surface-variant/50 font-bold">
                          #{col.id}
                        </td>
                        <td className="px-6 py-4.5">
                          {col.isPublished ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold text-[10px]">
                              <Eye className="w-3 h-3 shrink-0" /> 공개
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#fbf8ff] text-on-surface-variant/50 border border-surface-container font-bold text-[10px]">
                              <EyeOff className="w-3 h-3 shrink-0" /> 비공개
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4.5">
                          <div className="font-bold text-on-surface truncate text-sm" title={col.title}>
                            {col.title}
                          </div>
                          <div className="text-on-surface-variant/70 text-[11px] truncate mt-1 leading-normal" title={col.description || ''}>
                            {col.description || '지정된 시리즈 상세 설명이 제공되지 않았습니다.'}
                          </div>
                        </td>
                        <td className="px-6 py-4.5">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-[#fbf8ff] border border-surface-container text-xs font-bold text-emerald-600">
                            {col.itemCount || 0}개 수록
                          </span>
                        </td>
                        <td className="px-6 py-4.5 text-right space-x-1.5 shrink-0 whitespace-nowrap">
                          <button
                            onClick={() => navigate(`/admin/collections/${col.id}`)}
                            className="p-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 text-emerald-600 rounded-xl transition-all duration-300 inline-flex items-center gap-1 cursor-pointer font-bold"
                            title="수록 콘텐츠 기획 및 수록 순서 배정"
                          >
                            <LayoutGrid className="w-3.5 h-3.5" />
                            <span className="text-[10px] hidden xs:inline">수정 관리</span>
                          </button>
                          <button
                            onClick={() => handleStartEdit(col)}
                            className="p-2 bg-[#fbf8ff] hover:bg-primary/10 border border-surface-container hover:border-primary/20 text-on-surface-variant hover:text-primary rounded-xl transition-all duration-300 inline-flex items-center cursor-pointer"
                            title="메타 편집"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(col.id)}
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
      {editingCol && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md p-6 bg-white border border-surface-container rounded-2xl shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-surface-container pb-3.5">
              <h3 className="text-sm sm:text-base font-extrabold text-on-surface flex items-center gap-2">
                <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600 border border-emerald-100">
                  <Edit2 className="w-4 h-4" />
                </div>
                컬렉션 메타데이터 개정
              </h3>
              <button
                onClick={() => setEditingCol(null)}
                className="p-1.5 hover:bg-surface-container text-on-surface-variant/70 hover:text-on-surface rounded-xl transition-all duration-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant/80">컬렉션 시리즈 타이틀</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-[#fbf8ff] border border-surface-container focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 rounded-xl px-4 py-3 text-xs font-semibold text-on-surface outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant/80">시리즈 요약 설명</label>
                <textarea
                  rows={4}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-[#fbf8ff] border border-surface-container focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 rounded-xl px-4 py-3 text-xs font-semibold text-on-surface outline-none transition-all resize-none leading-relaxed"
                />
              </div>

              {/* Edit Publish Toggle Box */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-[#fbf8ff] border border-surface-container">
                <span className="text-xs font-bold text-on-surface">시리즈 노출 설정</span>
                <input
                  type="checkbox"
                  checked={editIsPublished}
                  onChange={(e) => setEditIsPublished(e.target.checked)}
                  className="w-5 h-5 rounded-lg border-surface-container text-emerald-600 focus:ring-emerald-500 bg-white cursor-pointer accent-emerald-600 shrink-0"
                />
              </div>

              <div className="pt-4 flex gap-2.5 justify-end border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setEditingCol(null)}
                  className="px-4 py-2.5 bg-white text-on-surface-variant hover:text-on-surface border border-surface-container rounded-xl text-xs font-bold transition-all duration-300 hover:bg-surface-container cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending || !editTitle.trim()}
                  className="flex items-center gap-1.5 px-4.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:pointer-events-none rounded-xl text-xs font-bold transition-all duration-300 shadow-md shadow-emerald-100 cursor-pointer"
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

export default CollectionsListPage;
