import React from 'react';
import { useTags, useAttachTag, useDetachTag } from '../../hooks/useTags';
import { Loader2, Plus, Hash } from 'lucide-react';
import type { Tag } from '../../lib/tagsApi';

interface ContentTagSelectorProps {
  contentType: string; // 'post' | 'portfolio_item'
  contentId: number;
  activeTags: Tag[]; // 현재 해당 콘텐츠에 부착되어 있는 태그 리스트
  onSuccess?: () => void; // 연동 성공 시 리패치 트리거
}

export const ContentTagSelector: React.FC<ContentTagSelectorProps> = ({
  contentType,
  contentId,
  activeTags,
  onSuccess,
}) => {
  const { data: allTags, isLoading, isError } = useTags();
  const attachTagMutation = useAttachTag();
  const detachTagMutation = useDetachTag();

  const activeTagIds = activeTags.map((t) => t.id);

  const handleTagToggle = async (tag: Tag) => {
    const isActive = activeTagIds.includes(tag.id);

    if (isActive) {
      await detachTagMutation.mutateAsync({
        contentType,
        contentId,
        tagId: tag.id,
      });
    } else {
      await attachTagMutation.mutateAsync({
        contentType,
        contentId,
        tagId: tag.id,
      });
    }

    if (onSuccess) {
      onSuccess();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-4 text-xs text-zinc-500">
        <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
        <span>사용가능한 태그 리스트를 로드 중...</span>
      </div>
    );
  }

  if (isError) {
    return <div className="text-xs text-red-400 py-2">태그 목록을 불러오는 중 오류가 발생했습니다.</div>;
  }

  const availableTags = allTags || [];

  return (
    <div className="space-y-3.5 p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/80 text-left">
      <div className="flex items-center gap-2">
        <Hash className="w-4 h-4 text-zinc-400" />
        <span className="text-xs sm:text-sm font-bold text-zinc-300">콘텐츠 메타 태그 셋팅</span>
      </div>

      <div className="flex flex-wrap gap-2 min-h-8 items-center">
        {availableTags.length === 0 ? (
          <span className="text-xs text-zinc-500">생성된 태그가 없습니다. 어드민 태그 대시보드에서 등록해 주세요.</span>
        ) : (
          availableTags.map((tag) => {
            const isActive = activeTagIds.includes(tag.id);
            const isPending =
              (attachTagMutation.isPending && attachTagMutation.variables?.tagId === tag.id) ||
              (detachTagMutation.isPending && detachTagMutation.variables?.tagId === tag.id);

            return (
              <div key={tag.id} className="relative">
                <button
                  type="button"
                  onClick={() => !isPending && handleTagToggle(tag)}
                  disabled={isPending}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border shrink-0 ${
                    isActive
                      ? 'bg-violet-500/10 border-violet-500/30 text-violet-400'
                      : 'bg-zinc-900/40 border-zinc-850 text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200'
                  }`}
                >
                  {isPending ? (
                    <Loader2 className="w-3 h-3 animate-spin text-zinc-500" />
                  ) : (
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: tag.color || '#a78bfa' }}
                    />
                  )}
                  <span>{tag.name}</span>
                  {!isActive && <Plus className="w-3 h-3 text-zinc-500" />}
                </button>
              </div>
            );
          })
        )}
      </div>

      <div className="text-[11px] text-zinc-500 leading-normal font-medium pt-1.5 border-t border-zinc-800/50">
        💡 클릭 시 즉각 콘텐츠와 해당 태그가 데이터베이스에 실시간 결합 또는 분리됩니다.
      </div>
    </div>
  );
};
export default ContentTagSelector;
