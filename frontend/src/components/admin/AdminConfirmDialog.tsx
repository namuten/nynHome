import { AlertTriangle } from 'lucide-react';

interface AdminConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
}

export default function AdminConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = '확인',
  cancelLabel = '취소',
  isDestructive = false,
}: AdminConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-body animate-fade-in">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Dialog Box */}
      <div className="relative w-full max-w-sm p-6 rounded-3xl bg-white/95 backdrop-blur-md border border-surface-container shadow-2xl space-y-4 z-10 animate-scale-up">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
            isDestructive ? 'bg-red-50 text-red-500 border-red-100' : 'bg-primary/10 text-primary border-primary/20'
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-on-surface">{title}</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-surface hover:bg-surface-container border border-surface-container transition-all"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-xs font-bold text-white rounded-xl transition-all shadow-md ${
              isDestructive ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary-container hover:text-primary'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
