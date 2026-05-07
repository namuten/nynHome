import React from 'react';
import type { Tag } from '../../lib/tagsApi';

interface TagBadgeProps {
  tag: Tag;
  onClick?: () => void;
  onRemove?: () => void;
  size?: 'sm' | 'md';
}

export const TagBadge: React.FC<TagBadgeProps> = ({
  tag,
  onClick,
  onRemove,
  size = 'md',
}) => {
  const { name, color } = tag;
  const tagColor = color || '#a78bfa'; // 기본 바이올렛 헥사

  // 부드러운 배경색을 연출하기 위해 hex에 투명도 12% 병합
  const bgStyle = {
    backgroundColor: `${tagColor}1f`,
    borderColor: `${tagColor}4d`,
    color: tagColor,
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs';

  return (
    <span
      onClick={onClick}
      style={bgStyle}
      className={`inline-flex items-center gap-1.5 font-bold rounded-lg border transition-all ${sizeClasses} ${
        onClick ? 'cursor-pointer hover:brightness-110 active:scale-95' : ''
      }`}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tagColor }} />
      <span>{name}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 text-[11px] font-bold hover:text-white transition-colors"
          style={{ color: `${tagColor}b3` }}
          title="삭제"
        >
          ×
        </button>
      )}
    </span>
  );
};
export default TagBadge;
