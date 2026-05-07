import { Calendar, Briefcase, Award, GraduationCap, ChevronRight, Link as LinkIcon } from 'lucide-react';
import type { PortfolioSectionItem } from '../../types/portfolio';

interface ResumeTimelineProps {
  sectionKey: string;
  items: PortfolioSectionItem[];
}

export default function ResumeTimeline({ sectionKey, items }: ResumeTimelineProps) {
  // 섹션별 대표 아이콘 지정
  const getSectionIcon = () => {
    const key = sectionKey.toLowerCase();
    if (key.includes('edu')) return <GraduationCap className="w-5 h-5 text-primary" />;
    if (key.includes('exp') || key.includes('career') || key.includes('work')) {
      return <Briefcase className="w-5 h-5 text-accent" />;
    }
    if (key.includes('award') || key.includes('achieve') || key.includes('prize')) {
      return <Award className="w-5 h-5 text-amber-500" />;
    }
    return <ChevronRight className="w-4 h-4 text-primary" />;
  };

  return (
    <div className="relative border-l border-outline-variant/50 pl-6 sm:pl-8 ml-4 space-y-8 font-body">
      {items.map((item, index) => (
        <div key={index} className="relative group animate-fade-in">
          {/* 타임라인 점 및 아이콘 */}
          <div className="absolute -left-[45px] sm:-left-[53px] top-1.5 flex items-center justify-center w-9 h-9 bg-white dark:bg-surface border-2 border-outline-variant rounded-full shadow-sm group-hover:border-primary transition-colors z-10">
            {getSectionIcon()}
          </div>

          <div className="bg-white/75 dark:bg-surface-container/20 border border-outline-variant/30 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group-hover:border-primary/30 relative">
            {/* 타이틀 및 날짜 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">
                  {item.title}
                </h4>
                {item.subtitle && (
                  <p className="text-xs font-bold text-on-surface-variant/80">
                    {item.subtitle}
                  </p>
                )}
              </div>

              {item.date && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-surface-container text-on-surface-variant text-[11px] font-bold rounded-lg self-start sm:self-center">
                  <Calendar className="w-3 h-3" />
                  <span>{item.date}</span>
                </span>
              )}
            </div>

            {/* 본문 설명 */}
            {item.description && (
              <p className="text-xs text-on-surface-variant leading-relaxed mb-3 whitespace-pre-line font-medium">
                {item.description}
              </p>
            )}

            {/* 태그 리스트 */}
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-primary/5 text-primary text-[10px] font-bold rounded-md"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* 외부 링크 */}
            {item.link && (
              <a
                href={item.link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline mt-1"
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>프로젝트 링크 보기</span>
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
export { ResumeTimeline };
