import type { LucideIcon } from 'lucide-react';

interface AdminStatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  gradient?: string;
  iconBg?: string;
  iconColor?: string;
}

export default function AdminStatCard({
  title,
  value,
  description,
  icon: Icon,
  gradient = 'from-purple-500/5 to-pink-500/5',
  iconBg = 'bg-primary/10',
  iconColor = 'text-primary',
}: AdminStatCardProps) {
  return (
    <div className={`relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br ${gradient} border border-surface-container bg-white shadow-sm flex items-center justify-between font-body transition-all duration-300 hover:shadow-md hover:scale-[1.01]`}>
      <div className="space-y-1">
        <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider select-none">
          {title}
        </span>
        <h3 className="text-3xl font-display font-black text-on-surface">
          {value}
        </h3>
        {description && (
          <p className="text-[10px] text-on-surface-variant font-medium">
            {description}
          </p>
        )}
      </div>

      <div className={`w-12 h-12 rounded-2xl ${iconBg} ${iconColor} flex items-center justify-center border border-current/10 shadow-sm`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
}
