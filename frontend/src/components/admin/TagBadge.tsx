import React from 'react';
import type { Tag } from '../../lib/tagsApi';

interface TagBadgeProps {
  tag: Tag;
  onClick?: () => void;
  onRemove?: () => void;
  size?: 'sm' | 'md';
}

/**
 * Standardized Tag Badge for blog and portfolio categorizations.
 * Built with defensive color styling to handle custom user HEX palettes flawlessly.
 */
export const TagBadge: React.FC<TagBadgeProps> = ({
  tag,
  onClick,
  onRemove,
  size = 'md',
}) => {
  const { name, color } = tag;
  
  // Safe hex code verification
  const isValidHex = (hex: string) => {
    return /^#([A-Fa-f0-9]{3}){1,2}$/.test(hex);
  };
  
  let tagColor = color || '#6844c7'; // Falls back to theme primary
  if (tagColor && !tagColor.startsWith('#')) {
    tagColor = `#${tagColor}`;
  }
  if (!isValidHex(tagColor)) {
    tagColor = '#6844c7';
  }

  // Create delicate semi-transparent background using hex transparency
  const bgStyle = {
    backgroundColor: `${tagColor}14`, // ~8% opacity
    borderColor: `${tagColor}33`,     // ~20% opacity
    color: tagColor,
  };

  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-[11px] rounded-md gap-1' 
    : 'px-3 py-1 text-xs rounded-lg gap-1.5';

  return (
    <span
      onClick={onClick}
      style={bgStyle}
      className={`inline-flex items-center font-bold border transition-all duration-300 ${sizeClasses} ${
        onClick 
          ? 'cursor-pointer hover:brightness-105 hover:scale-[1.02] active:scale-95 shadow-sm hover:shadow-md' 
          : ''
      }`}
    >
      <span 
        className="w-1.5 h-1.5 rounded-full shrink-0 transition-transform duration-300" 
        style={{ backgroundColor: tagColor }} 
      />
      <span className="truncate max-w-[120px] tracking-tight">{name}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 text-[13px] font-bold hover:text-red-500 transition-colors duration-200 leading-none"
          style={{ color: `${tagColor}99` }}
          title="Remove tag"
        >
          &times;
        </button>
      )}
    </span>
  );
};

export default TagBadge;
