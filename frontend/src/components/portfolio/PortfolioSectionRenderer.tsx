import { ResumeTimeline } from './ResumeTimeline';
import type { PortfolioSection } from '../../types/portfolio';

interface PortfolioSectionRendererProps {
  section: PortfolioSection;
}

export default function PortfolioSectionRenderer({ section }: PortfolioSectionRendererProps) {
  const { sectionKey, title, body, items } = section;

  // 1. 아이템 목록이 존재하고 채워진 경우 타임라인 리스트로 시각화
  const hasItems = items && items.length > 0;

  return (
    <div className="space-y-4 font-body animate-fade-in">
      {/* 섹션 머리글 */}
      <div className="border-b border-outline-variant/30 pb-3">
        <h2 className="text-lg sm:text-xl font-display font-black text-on-surface tracking-tight">
          {title}
        </h2>
      </div>

      {/* 섹션 본문 소개글 */}
      {body && (
        <div className="text-sm text-on-surface-variant font-medium leading-relaxed whitespace-pre-line bg-surface-container/10 p-5 rounded-2xl border border-outline-variant/20 shadow-sm">
          {body}
        </div>
      )}

      {/* 하위 아이템 타임라인 노드 */}
      {hasItems && (
        <div className="pt-2">
          <ResumeTimeline sectionKey={sectionKey} items={items} />
        </div>
      )}
    </div>
  );
}
export { PortfolioSectionRenderer };
