import { useState } from 'react';
import { X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useReportComment } from '../../hooks/useReportComment';
import { useReportGuestbookEntry } from '../../hooks/useGuestbook';
import CommunityGuidelinesLink from './CommunityGuidelinesLink';
import { AxiosError } from 'axios';

interface ReportDialogProps {
  targetType: 'comment' | 'guestbook';
  targetId: number;
  isOpen: boolean;
  onClose: () => void;
}

const REASONS: { value: 'spam' | 'harassment' | 'personal_info' | 'inappropriate' | 'other'; label: string; desc: string }[] = [
  { value: 'spam', label: '스팸/홍보성', desc: '상업적 광고나 무의미한 내용 도배' },
  { value: 'harassment', label: '욕설/비방', desc: '특정인에 대한 모욕이나 혐오 발언' },
  { value: 'personal_info', label: '개인정보 노출', desc: '본인 또는 타인의 민감한 정보 포함' },
  { value: 'inappropriate', label: '부적절한 내용', desc: '선정적이거나 폭력적인 내용' },
  { value: 'other', label: '기타 사유', desc: '기타 정책 위반 사항' },
];

export default function ReportDialog({ targetType, targetId, isOpen, onClose }: ReportDialogProps) {
  const [reason, setReason] = useState<'spam' | 'harassment' | 'personal_info' | 'inappropriate' | 'other'>('spam');
  const [description, setDescription] = useState('');
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const commentMutation = useReportComment(targetType === 'comment' ? targetId : 0);
  const guestbookMutation = useReportGuestbookEntry();

  if (!isOpen) return null;

  const isPending = targetType === 'comment' ? commentMutation.isPending : guestbookMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const onSuccess = () => {
      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    };

    const onError = (err: any) => {
      if (err instanceof AxiosError) {
        const apiError = err.response?.data?.error;
        if (apiError === 'ALREADY_REPORTED') {
          setErrorMsg('이미 신고가 접수된 콘텐츠입니다.');
        } else if (apiError === 'NOT_FOUND') {
          setErrorMsg('존재하지 않거나 이미 삭제된 콘텐츠입니다.');
        } else if (err.response?.data?.message) {
          setErrorMsg(err.response.data.message);
        } else {
          setErrorMsg('신고 접수 중 오류가 발생했습니다. 다시 시도해 주세요.');
        }
      } else {
        setErrorMsg('알 수 없는 오류가 발생했습니다.');
      }
    };

    if (targetType === 'comment') {
      commentMutation.mutate({ reason, description }, { onSuccess, onError });
    } else {
      guestbookMutation.mutate({ id: targetId, payload: { reason, description } }, { onSuccess, onError });
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setReason('spam');
    setDescription('');
    setErrorMsg('');
    onClose();
  };

  const title = targetType === 'comment' ? '댓글 신고하기' : '방명록 신고하기';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in font-body">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-surface-container">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-black text-on-surface tracking-tight">{title}</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 -mr-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="flex flex-col items-center justify-center py-8 text-center animate-fade-in">
              <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-on-surface mb-2">신고가 접수되었습니다</h3>
              <p className="text-sm text-on-surface-variant">
                안전한 커뮤니티를 위한 참여에 감사드립니다.<br />
                관리자 검토 후 조치될 예정입니다.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMsg && (
                <div className="p-3 text-sm font-bold text-red-600 bg-red-50 rounded-xl border border-red-100 flex items-start gap-2 animate-fade-in">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-3">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                  신고 사유 선택
                </label>
                <div className="space-y-2">
                  {REASONS.map((r) => (
                    <label
                      key={r.value}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        reason === r.value
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-surface-container hover:border-outline-variant hover:bg-surface-container/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="reason"
                        value={r.value}
                        checked={reason === r.value}
                        onChange={(e) => setReason(e.target.value as any)}
                        className="mt-1 shrink-0 text-primary focus:ring-primary border-outline-variant"
                      />
                      <div className="flex flex-col">
                        <span className={`text-sm font-bold ${reason === r.value ? 'text-primary' : 'text-on-surface'}`}>
                          {r.label}
                        </span>
                        <span className="text-xs text-on-surface-variant mt-0.5">{r.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                  상세 내용 (선택)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="신고 내용을 자세히 적어주시면 검토에 도움이 됩니다."
                  className="w-full px-4 py-3 rounded-xl bg-surface-container/30 border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none text-sm text-on-surface"
                  rows={3}
                  maxLength={1000}
                />
                <div className="text-right text-[10px] text-on-surface-variant font-mono">
                  {description.length} / 1000
                </div>
              </div>

              <div className="pt-2 border-t border-surface-container flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-[11px] text-on-surface-variant">
                  허위 신고 시 이용이 제한될 수 있습니다.<br />
                  자세한 내용은 <CommunityGuidelinesLink className="text-[11px]" />를 참고해 주세요.
                </div>
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full sm:w-auto px-6 py-2.5 bg-red-500 text-white text-sm font-bold rounded-xl hover:bg-red-600 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center"
                >
                  {isPending ? (
                    <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  ) : (
                    '신고 접수'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
