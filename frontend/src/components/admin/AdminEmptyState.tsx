import type { LucideIcon } from 'lucide-react';

interface AdminEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function AdminEmptyState({
  icon: Icon,
  title,
  description,
  action,
}: AdminEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white/50 backdrop-blur-sm border border-dashed border-surface-container rounded-3xl space-y-4 font-body shadow-sm">
      <div className="w-14 h-14 bg-surface-container rounded-2xl flex items-center justify-center text-on-surface-variant border border-surface-container-high/20">
        <Icon className="w-6 h-6 opacity-60" />
      </div>
      <div className="space-y-1 max-w-sm">
        <h4 className="text-sm font-bold text-on-surface">{title}</h4>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          {description}
        </p>
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-container hover:text-primary transition-all duration-300 shadow-sm"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
