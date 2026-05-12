import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useCollection,
  useAddCollectionItem,
  useRemoveCollectionItem,
  useReorderCollectionItems,
} from '../../../hooks/useCollections';
import {
  FolderHeart,
  ChevronLeft,
  Loader2,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Save,
  AlertCircle,
  FileText,
  Briefcase,
  Layers,
} from 'lucide-react';
import type { CollectionItem } from '../../../lib/collectionsApi';

export const CollectionEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const collectionId = parseInt(id || '0', 10);

  const { data: collection, isLoading, isError } = useCollection(collectionId);
  const addMutation = useAddCollectionItem();
  const removeMutation = useRemoveCollectionItem();
  const reorderMutation = useReorderCollectionItems();

  // New item addition form state
  const [contentType, setContentType] = useState<'post' | 'portfolio_item'>('post');
  const [contentIdInput, setContentIdInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Local state for reordering
  const [localItems, setLocalItems] = useState<CollectionItem[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  // Sync local list when data collection is loaded
  useEffect(() => {
    if (collection?.items) {
      setLocalItems([...collection.items]);
      setIsDirty(false);
    }
  }, [collection]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const targetId = parseInt(contentIdInput.trim(), 10);

    if (isNaN(targetId)) {
      setErrorMsg('정밀한 숫자 형식의 ID를 입력해 주세요.');
      return;
    }

    try {
      await addMutation.mutateAsync({
        collectionId,
        data: {
          contentType,
          contentId: targetId,
        },
      });
      setContentIdInput('');
    } catch (err: any) {
      if (err.response?.status === 409) {
        setErrorMsg('⚠️ 이미 이 컬렉션 리스트에 수록되어 있는 중복 아티클입니다.');
      } else {
        setErrorMsg('연동 과정에서 장애가 발생했습니다. 콘텐츠 ID 정합성을 대조해 보세요.');
      }
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    if (!window.confirm('이 아이템을 컬렉션 수록물 리스트에서 제외하시겠습니까?')) return;
    try {
      await removeMutation.mutateAsync({
        collectionId,
        itemId,
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Move up action
  const moveUp = (index: number) => {
    if (index === 0) return;
    const items = [...localItems];
    const temp = items[index];
    items[index] = items[index - 1];
    items[index - 1] = temp;

    setLocalItems(items);
    setIsDirty(true);
  };

  // Move down action
  const moveDown = (index: number) => {
    if (index === localItems.length - 1) return;
    const items = [...localItems];
    const temp = items[index];
    items[index] = items[index + 1];
    items[index + 1] = temp;

    setLocalItems(items);
    setIsDirty(true);
  };

  // Reorder save action
  const handleSaveReorder = async () => {
    const payload = localItems.map((item, index) => ({
      contentType: item.contentType,
      contentId: item.contentId,
      position: index,
    }));

    try {
      await reorderMutation.mutateAsync({
        collectionId,
        items: payload,
      });
      setIsDirty(false);
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-3 text-on-surface-variant/50 animate-fade-in">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <span className="text-xs font-semibold">해당 컬렉션 수록 목록 로드 중...</span>
      </div>
    );
  }

  if (isError || !collection) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4 animate-fade-in">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h3 className="text-base font-extrabold text-on-surface">컬렉션 취합 오류</h3>
        <p className="text-xs text-on-surface-variant/70 leading-relaxed">지정된 컬렉션 정보가 존재하지 않거나 물리적으로 만료되었습니다.</p>
        <button
          onClick={() => navigate('/admin/collections')}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-on-surface-variant hover:text-on-surface border border-surface-container rounded-xl text-xs font-bold transition-all duration-300 shadow-sm cursor-pointer"
        >
          목록으로 대피
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left animate-fade-in">
      {/* 1. Back Navigation Breadcrumb */}
      <button
        onClick={() => navigate('/admin/collections')}
        className="inline-flex items-center gap-1.5 text-xs font-extrabold text-on-surface-variant/70 hover:text-emerald-600 transition-colors duration-300 cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
        시리즈 목록으로 복귀
      </button>

      {/* 2. Top Header Panel */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-surface-container pb-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold text-[10px]">
              시리즈 기획관
            </span>
            <span className="text-xs font-mono font-bold text-on-surface-variant/40">No. #{collection.id}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-on-surface flex items-center gap-2 tracking-tight">
            <FolderHeart className="w-6 h-6 text-emerald-600 shrink-0" />
            {collection.title}
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant/80 leading-relaxed max-w-2xl font-medium">
            {collection.description || '상세 기획 설명 요약이 등록되지 않은 컬렉션입니다.'}
          </p>
        </div>

        {isDirty && (
          <button
            onClick={handleSaveReorder}
            disabled={reorderMutation.isPending}
            className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all duration-300 shadow-md shadow-emerald-100 active:scale-98 shrink-0 cursor-pointer"
          >
            {reorderMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>기획 순서 최종 저장</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* 3. Left Panel: Add New Content Mapping */}
        <div className="lg:col-span-1">
          <div className="p-5 rounded-2xl bg-white border border-surface-container shadow-sm hover:shadow-md transition-all duration-300 space-y-4">
            <h3 className="text-xs sm:text-sm font-extrabold text-on-surface border-b border-surface-container pb-2.5 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-600" />
              신규 콘텐츠 연동 추가
            </h3>

            <form onSubmit={handleAddItem} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant/80">콘텐츠 분류 타입</label>
                <div className="flex gap-1 bg-[#fbf8ff] p-1 rounded-xl border border-surface-container">
                  <button
                    type="button"
                    onClick={() => setContentType('post')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-300 cursor-pointer ${
                      contentType === 'post'
                        ? 'bg-white text-emerald-600 shadow-sm border border-emerald-50/50'
                        : 'text-on-surface-variant/60 hover:text-on-surface'
                    }`}
                  >
                    블로그 포스트
                  </button>
                  <button
                    type="button"
                    onClick={() => setContentType('portfolio_item')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-300 cursor-pointer ${
                      contentType === 'portfolio_item'
                        ? 'bg-white text-emerald-600 shadow-sm border border-emerald-50/50'
                        : 'text-on-surface-variant/60 hover:text-on-surface'
                    }`}
                  >
                    쇼케이스
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant/80">콘텐츠 고유 번호 (ID)</label>
                <input
                  type="text"
                  placeholder="숫자 형식 ID 입력 (예: 12, 45)"
                  value={contentIdInput}
                  onChange={(e) => {
                    setContentIdInput(e.target.value);
                    setErrorMsg(null);
                  }}
                  className="w-full bg-[#fbf8ff] border border-surface-container focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 rounded-xl px-4 py-3 text-xs font-mono font-semibold text-on-surface outline-none transition-all placeholder:text-on-surface-variant/30"
                />
              </div>

              {errorMsg && (
                <div className="p-3.5 bg-red-50/50 border border-red-100 rounded-xl text-[11px] text-red-500 font-bold leading-normal flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={addMutation.isPending || !contentIdInput.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:pointer-events-none text-white rounded-xl text-xs font-bold transition-all duration-300 shadow-md shadow-emerald-100 active:scale-98 cursor-pointer"
              >
                {addMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                <span>이 컬렉션에 추가 수록</span>
              </button>
            </form>
          </div>
        </div>

        {/* 4. Right Panel: Reorder Collection Items */}
        <div className="lg:col-span-2">
          <div className="p-5 rounded-2xl bg-white border border-surface-container shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-surface-container">
              <h3 className="text-xs sm:text-sm font-extrabold text-on-surface flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-600" />
                수록 목록 조율 
                <span className="ml-1 text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {localItems.length}개 수록됨
                </span>
              </h3>
              {isDirty && (
                <span className="text-[10px] text-amber-500 font-extrabold animate-pulse tracking-wide">
                  ⚠️ 배치 기획 변경됨 (저장 필요)
                </span>
              )}
            </div>

            {localItems.length === 0 ? (
              <div className="text-center py-24 text-xs text-on-surface-variant/50 font-medium">
                현재 수록물이 존재하지 않습니다. 좌측 추가 폼에서 포스트 혹은 쇼케이스 ID를 입력하여 첫 수록을 기입해 주세요!
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {localItems.map((item, index) => {
                  const isFirst = index === 0;
                  const isLast = index === localItems.length - 1;

                  return (
                    <div
                       key={item.id}
                       className="flex items-center justify-between gap-4 p-3.5 rounded-xl bg-[#fbf8ff] border border-surface-container hover:border-emerald-100 hover:bg-emerald-50/5 transition-all duration-200"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Position Number Display */}
                        <span className="w-6 h-6 rounded-lg bg-white border border-surface-container text-on-surface-variant/60 font-mono font-extrabold text-xs flex items-center justify-center shrink-0 shadow-sm">
                          {index + 1}
                        </span>

                        {/* Content Type Icon */}
                        <div className="shrink-0 p-2 rounded-xl bg-white border border-surface-container text-on-surface-variant shadow-sm">
                          {item.contentType === 'post' ? (
                            <FileText className="w-3.5 h-3.5 text-sky-500" />
                          ) : (
                            <Briefcase className="w-3.5 h-3.5 text-violet-500" />
                          )}
                        </div>

                        {/* Title Specifications */}
                        <div className="min-w-0">
                          <h4 className="font-bold text-on-surface truncate text-xs sm:text-sm max-w-[200px] xs:max-w-xs sm:max-w-sm md:max-w-md" title={item.details?.title || ''}>
                            {item.details?.title || '로딩에 실패한 게시글이거나 유효하지 않은 콘텐츠'}
                          </h4>
                          <span className="text-[10px] text-on-surface-variant/50 font-mono font-bold uppercase tracking-wide mt-0.5 block">
                            {item.contentType === 'post' ? '블로그' : '쇼케이스'} / ID: #{item.contentId}
                          </span>
                        </div>
                      </div>

                      {/* Control Utility Buttons */}
                      <div className="flex items-center gap-1 shrink-0 whitespace-nowrap">
                        {/* UP Button */}
                        <button
                          type="button"
                          disabled={isFirst}
                          onClick={() => moveUp(index)}
                          className="p-1.5 bg-white border border-surface-container disabled:opacity-30 disabled:pointer-events-none hover:border-emerald-100 hover:text-emerald-600 hover:bg-emerald-50 text-on-surface-variant rounded-lg transition-all duration-300 cursor-pointer"
                          title="위로 이동"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>

                        {/* DOWN Button */}
                        <button
                          type="button"
                          disabled={isLast}
                          onClick={() => moveDown(index)}
                          className="p-1.5 bg-white border border-surface-container disabled:opacity-30 disabled:pointer-events-none hover:border-emerald-100 hover:text-emerald-600 hover:bg-emerald-50 text-on-surface-variant rounded-lg transition-all duration-300 cursor-pointer"
                          title="아래로 이동"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>

                        {/* REMOVE Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1.5 bg-white border border-surface-container hover:border-red-100 hover:text-red-500 hover:bg-red-50 text-on-surface-variant/60 rounded-lg transition-all duration-300 ml-1.5 cursor-pointer"
                          title="목록에서 제거"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionEditPage;
