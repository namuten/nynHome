import { useState } from 'react';
import { useCreateGuestbookEntry } from '../../hooks/useGuestbook';
import { MessageSquare, LogIn, AlertCircle } from 'lucide-react';
import { AxiosError } from 'axios';

interface GuestbookEntryFormProps {
  isAuthenticated: boolean;
  onLoginClick: () => void;
}

export default function GuestbookEntryForm({ isAuthenticated, onLoginClick }: GuestbookEntryFormProps) {
  const [body, setBody] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const createMutation = useCreateGuestbookEntry();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!body.trim()) return;

    createMutation.mutate(
      { body },
      {
        onSuccess: () => {
          setBody('');
        },
        onError: (err) => {
          if (err instanceof AxiosError) {
            const apiError = err.response?.data?.error;
            const message = err.response?.data?.message;
            if (apiError === 'SPAM_DETECTED') {
              setErrorMsg('스팸 의심 링크가 포함되어 작성이 제한되었습니다.');
            } else if (apiError === 'RATE_LIMIT') {
              setErrorMsg('글 작성 속도가 너무 빠릅니다. 5초 후에 다시 시도해 주세요.');
            } else if (apiError === 'DUPLICATE_ENTRY') {
              setErrorMsg('최근에 동일한 내용을 작성하셨습니다.');
            } else if (message) {
              setErrorMsg(message);
            } else {
              setErrorMsg('작성 중 오류가 발생했습니다. 다시 시도해 주세요.');
            }
          } else {
            setErrorMsg('알 수 없는 오류가 발생했습니다.');
          }
        },
      }
    );
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-surface-container shadow-sm relative overflow-hidden font-body">
      {!isAuthenticated && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-md z-10 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="p-3 bg-primary/10 text-primary rounded-full mb-3">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h4 className="text-base font-black text-on-surface mb-1">방명록 작성하기</h4>
          <p className="text-xs text-on-surface-variant mb-4">로그인하시면 따뜻한 응원의 한마디를 남기실 수 있습니다.</p>
          <button
            onClick={onLoginClick}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-2xl shadow-sm hover:scale-105 active:scale-95 transition-all"
          >
            <LogIn className="w-4 h-4" />
            <span>로그인하고 방명록 남기기</span>
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <MessageSquare className="w-5 h-5" />
          <h3 className="text-sm font-black uppercase tracking-wider">방명록 한마디</h3>
        </div>

        {errorMsg && (
          <div className="p-3 text-xs font-bold text-red-600 bg-red-50 rounded-xl border border-red-100 flex items-start gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="relative">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={createMutation.isPending}
            placeholder="따뜻한 격려나 응원의 글을 자유롭게 남겨주세요."
            rows={3}
            maxLength={1000}
            className="w-full px-4 py-3 rounded-2xl bg-surface-container/30 border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm text-on-surface resize-none"
          />
          <div className="absolute bottom-3 right-4 text-[10px] text-on-surface-variant font-mono">
            {body.length} / 1000
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!body.trim() || createMutation.isPending}
            className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-2xl shadow-sm hover:scale-[1.03] active:scale-95 disabled:scale-100 disabled:opacity-40 transition-all flex items-center justify-center min-w-[100px]"
          >
            {createMutation.isPending ? (
              <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              '메시지 등록'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
