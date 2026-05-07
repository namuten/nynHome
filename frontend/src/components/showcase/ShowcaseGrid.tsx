import { useState, useMemo } from 'react';
import { EyeOff } from 'lucide-react';
import { ShowcaseCard } from './ShowcaseCard';
import type { ShowcaseItem } from '../../types/showcase';

interface ShowcaseGridProps {
  items: ShowcaseItem[];
  locale: 'ko' | 'en';
}

export default function ShowcaseGrid({ items, locale }: ShowcaseGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // 데이터셋에서 카테고리 고유값들을 자동 추출하여 필터 칩으로 승격
  const categories = useMemo(() => {
    const list = new Set<string>();
    items.forEach((item) => {
      if (item.category) list.add(item.category);
    });
    return ['All', ...Array.from(list)];
  }, [items]);

  // 카테고리 필터링 반영
  const filteredItems = useMemo(() => {
    if (selectedCategory === 'All') return items;
    return items.filter((item) => item.category === selectedCategory);
  }, [items, selectedCategory]);

  return (
    <div className="space-y-6 font-body">
      {/* 카테고리 필터링 칩셋 */}
      {categories.length > 2 && (
        <div className="flex flex-wrap gap-1.5 border-b border-outline-variant/20 pb-4 select-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                selectedCategory === cat
                  ? 'bg-primary border-primary text-on-primary shadow-sm scale-102'
                  : 'bg-white border-outline-variant/45 text-on-surface hover:bg-surface-container/20'
              }`}
            >
              {cat === 'All' ? (locale === 'ko' ? '🌍 전체 보기' : '🌍 All Works') : cat}
            </button>
          ))}
        </div>
      )}

      {/* 쇼케이스 카드 그리드 또는 비어있음 경고 */}
      {filteredItems.length === 0 ? (
        <div className="bg-surface-container/20 border border-outline-variant/20 rounded-3xl p-16 text-center space-y-4 max-w-md mx-auto">
          <EyeOff className="w-10 h-10 text-on-surface-variant/40 mx-auto" />
          <h4 className="text-sm font-extrabold text-on-surface">
            {locale === 'ko' ? '표시할 작품이 없습니다' : 'No projects found'}
          </h4>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {locale === 'ko'
              ? '현재 선택된 카테고리에 속한 게시용 작품 포트폴리오 노드가 존재하지 않습니다.'
              : 'There are no active portfolio nodes registered under this specific filter choice.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {filteredItems.map((item) => (
            <ShowcaseCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
export { ShowcaseGrid };
