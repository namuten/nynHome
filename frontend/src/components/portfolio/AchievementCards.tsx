import type { AchievementItem } from '../../types/profile';

interface AchievementCardsProps {
  achievements: AchievementItem[];
}

/**
 * 수상 및 대외 활동 이력 타임라인 카드 컴포넌트
 */
export default function AchievementCards({ achievements }: AchievementCardsProps) {
  if (!achievements || achievements.length === 0) {
    return (
      <div className="text-center py-10 text-on-surface-variant/60 text-sm">
        등록된 경력이나 주요 활동 이력이 아직 없습니다.
      </div>
    );
  }

  return (
    <div className="relative border-l-2 border-outline-variant/50 ml-4 md:ml-6 space-y-10 py-4">
      {achievements.map((item, index) => (
        <div key={`${item.title}-${index}`} className="relative pl-8 group">
          {/* 타임라인 노드 - 강조되는 파란색/보라색 글로잉 효과 */}
          <div className="absolute -left-2.5 top-1.5 w-5 h-5 bg-white dark:bg-surface border-4 border-primary rounded-full group-hover:scale-125 group-hover:bg-primary transition-all duration-300 shadow-sm" />
          
          <div className="space-y-2">
            {/* 날짜 배지 */}
            {item.date && (
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full tracking-wide">
                {item.date}
              </span>
            )}
            
            {/* 카드 배경 - Glassmorphism, 보더 하이라이트 */}
            <div className="bg-white/40 dark:bg-surface/30 backdrop-blur-sm border border-outline-variant/30 rounded-2xl p-6 hover:shadow-md hover:bg-white/75 dark:hover:bg-surface/50 hover:border-primary/30 transition-all duration-300 max-w-2xl">
              <h4 className="text-sm font-bold text-on-surface tracking-wide group-hover:text-primary transition-colors">
                {item.title}
              </h4>
              {item.description && (
                <p className="text-xs text-on-surface-variant leading-relaxed mt-2 whitespace-pre-line font-body">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
export { AchievementCards };
