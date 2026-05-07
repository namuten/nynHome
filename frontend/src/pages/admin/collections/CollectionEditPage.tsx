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

  // 새로운 수록물 추가 양식 상태
  const [contentType, setContentType] = useState<'post' | 'portfolio_item'>('post');
  const [contentIdInput, setContentIdInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 로컬 정렬용 상태 (Up/Down 맞교환 대상)
  const [localItems, setLocalItems] = useState<CollectionItem[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  // 데이터 수집 성공 시 로컬 리스트 초기화 동기화
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

  // 화살표 Up 액션 (위 아이템과 위치 교환)
  const moveUp = (index: number) => {
    if (index === 0) return;
    const items = [...localItems];
    // 두 아이템 swap
    const temp = items[index];
    items[index] = items[index - 1];
    items[index - 1] = temp;

    setLocalItems(items);
    setIsDirty(true);
  };

  // 화살표 Down 액션 (아래 아이템과 위치 교환)
  const moveDown = (index: number) => {
    if (index === localItems.length - 1) return;
    const items = [...localItems];
    // 두 아이템 swap
    const temp = items[index];
    items[index] = items[index + 1];
    items[index + 1] = temp;

    setLocalItems(items);
    setIsDirty(true);
  };

  // 정렬 순서 최종 저장 뮤테이션
  const handleSaveReorder = async () => {
    // 새로운 position을 0부터 차례대로 기입해 페이로드 조립
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
      <div className="flex flex-col items-center justify-center py-40 gap-3 text-zinc-500">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        <span>해당 컬렉션 수록 목록 로드 중...</span>
      </div>
    );
  }

  if (isError || !collection) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h3 className="text-base font-black text-zinc-200">컬렉션 취합 오류</h3>
        <p className="text-xs text-zinc-500">지정된 컬렉션 정보가 물리적으로 파괴되었거나 만료되었습니다.</p>
        <button
          onClick={() => navigate('/admin/collections')}
          className="px-4 py-2 bg-zinc-900 border border-zinc-850 rounded-xl text-xs font-bold text-zinc-400 hover:text-zinc-100 transition-all"
        >
          목록으로 대피
        </button>
      </div>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
      {/* 뒤로가기 브레드크럼 */}
      <button
        onClick={() => navigate('/admin/collections')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-200 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        시리즈 목록으로 복귀
      </button>

      {/* 헤더 */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black text-[10px]">
              시리즈 기획관
            </span>
            <span className="text-xs font-mono text-zinc-600">No. #{collection.id}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-100 flex items-center gap-2">
            <FolderHeart className="w-6 h-6 text-emerald-500" />
            {collection.title}
          </h1>
          <p className="text-xs text-zinc-500 leading-relaxed max-w-2xl">
            {collection.description || '상세 기획 설명 요약이 등록되지 않은 컬렉션입니다.'}
          </p>
        </div>

        {isDirty && (
          <button
            onClick={handleSaveReorder}
            disabled={reorderMutation.isPending}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-950/25"
          >
            {reorderMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>기획 순서 최종 전송</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 좌단: 새로운 수록물 연동 영역 */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-5 rounded-2xl bg-zinc-900/30 border border-zinc-800/80 space-y-4">
            <h3 className="text-xs sm:text-sm font-black text-zinc-200 border-b border-zinc-850 pb-2 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-500" />
              신규 아티클 연동 추가
            </h3>

            <form onSubmit={handleAddItem} className="space-y-4 text-xs sm:text-sm">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400">콘텐츠 분류타입</label>
                <div className="flex gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-900">
                  <button
                    type="button"
                    onClick={() => setContentType('post')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      contentType === 'post'
                        ? 'bg-zinc-900 text-zinc-100 border border-zinc-800'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    블로그 글
                  </button>
                  <button
                    type="button"
                    onClick={() => setContentType('portfolio_item')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      contentType === 'portfolio_item'
                        ? 'bg-zinc-900 text-zinc-100 border border-zinc-800'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    쇼케이스
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400">목표 원본 콘텐츠 고유 ID</label>
                <input
                  type="text"
                  placeholder="숫자 형식 ID 입력 (예: 12, 45)"
                  value={contentIdInput}
                  onChange={(e) => {
                    setContentIdInput(e.target.value);
                    setErrorMsg(null);
                  }}
                  className="w-full bg-zinc-950 border border-zinc-850 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 outline-none transition-all placeholder-zinc-700 font-mono"
                />
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl text-[11px] text-red-400 font-bold leading-normal flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={addMutation.isPending || !contentIdInput.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all shadow-md"
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

        {/* 우단: 현재 배치 리스트 및 업다운 화살표 변경기 */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-2xl bg-zinc-900/30 border border-zinc-800/80">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-850">
              <h3 className="text-xs sm:text-sm font-black text-zinc-200 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-500" />
                수록 목록 조율 ({localItems.length}개)
              </h3>
              {isDirty && (
                <span className="text-[10px] text-amber-400 font-black animate-pulse">
                  ⚠️ 정렬 배치 수정됨 (전송 필요)
                </span>
              )}
            </div>

            {localItems.length === 0 ? (
              <div className="text-center py-20 text-xs text-zinc-500">
                현재 수록물이 없습니다. 좌측 기획관에서 원본 글 번호를 입력해 첫 아티클을 기입해 주십시오!
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {localItems.map((item, index) => {
                  const isFirst = index === 0;
                  const isLast = index === localItems.length - 1;

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-4 p-3 rounded-xl bg-zinc-950 border border-zinc-900 hover:border-zinc-800 transition-all text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* 포지션 번호 표시 */}
                        <span className="w-6 h-6 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono font-black flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>

                        {/* 타입별 아이콘 */}
                        <div className="shrink-0 p-2 rounded-lg bg-zinc-900 border border-zinc-850 text-zinc-400">
                          {item.contentType === 'post' ? (
                            <FileText className="w-3.5 h-3.5 text-sky-400" />
                          ) : (
                            <Briefcase className="w-3.5 h-3.5 text-violet-400" />
                          )}
                        </div>

                        {/* 타이틀 상세 명세 */}
                        <div className="min-w-0">
                          <h4 className="font-bold text-zinc-200 truncate max-w-xs sm:max-w-sm">
                            {item.details?.title || '로딩에 실패한 묵은 게시글이거나 유효하지 않은 연동글'}
                          </h4>
                          <span className="text-[9px] text-zinc-500 font-mono">
                            {item.contentType.toUpperCase()} / ID: #{item.contentId}
                          </span>
                        </div>
                      </div>

                      {/* 제어 컨트롤바 */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* UP 화살표 버튼 */}
                        <button
                          type="button"
                          disabled={isFirst}
                          onClick={() => moveUp(index)}
                          className="p-1 bg-zinc-900 border border-zinc-800 disabled:opacity-30 hover:border-zinc-700 text-zinc-400 hover:text-zinc-100 rounded-md transition-all"
                          title="위로 이동"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>

                        {/* DOWN 화살표 버튼 */}
                        <button
                          type="button"
                          disabled={isLast}
                          onClick={() => moveDown(index)}
                          className="p-1 bg-zinc-900 border border-zinc-800 disabled:opacity-30 hover:border-zinc-700 text-zinc-400 hover:text-zinc-100 rounded-md transition-all"
                          title="아래로 이동"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>

                        {/* TRASH 축출 삭제 버튼 */}
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1.5 bg-zinc-900 hover:bg-red-950/40 border border-zinc-800 text-zinc-500 hover:text-red-400 rounded-md transition-all ml-1"
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
    </main>
  );
};
export default CollectionEditPage;
