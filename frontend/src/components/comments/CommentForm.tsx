import { useState } from 'react';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';

interface CommentFormProps {
  onSubmit: (body: string) => Promise<void>;
  placeholder?: string;
  isSubmitting: boolean;
}

export default function CommentForm({
  onSubmit,
  placeholder = '따뜻하고 건설적인 피드백과 댓글을 남겨주세요.',
  isSubmitting,
}: CommentFormProps) {
  const { isAuthenticated, user } = useAuth();
  const [body, setBody] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [offlineSuccess, setOfflineSuccess] = useState(false);

  // 모바일 앱 네이티브 물리적 햅틱 반응 트리거
  const triggerHaptics = async (type: 'success' | 'warning' | 'error') => {
    if (!Capacitor.isNativePlatform()) return;
    try {
      if (type === 'success') {
        await Haptics.impact({ style: ImpactStyle.Light });
      } else if (type === 'warning') {
        await Haptics.notification({ type: NotificationType.Warning });
      } else {
        await Haptics.notification({ type: NotificationType.Error });
      }
    } catch (err) {
      console.warn('Haptics failed to trigger:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    try {
      setErrorMsg(null);
      setOfflineSuccess(false);
      await onSubmit(body);
      setBody('');
      triggerHaptics('success'); // 성공 진동 발포
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'OFFLINE_SAVED') {
        setOfflineSuccess(true);
        setBody('');
        triggerHaptics('warning'); // 오프라인 세이브 진동 발포
      } else {
        const message = err instanceof Error ? err.message : '댓글 등록에 실패했습니다. 다시 시도해주세요.';
        setErrorMsg(message);
        triggerHaptics('error'); // 서버 실패 무거운 진동 발포
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-6 rounded-2xl border border-surface-container bg-surface-container/50 text-center space-y-3 font-body">
        <MessageSquare className="w-8 h-8 text-on-surface-variant mx-auto opacity-50" />
        <p className="text-sm text-on-surface-variant font-medium">
          댓글을 작성하려면 로그인이 필요합니다.
        </p>
        <Link
          to="/login"
          className="inline-block px-5 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-container hover:text-primary transition duration-300"
        >
          로그인하러 가기
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 font-body">
      <div className="text-sm font-bold text-on-surface">
        {user?.nickname} <span className="text-xs font-medium text-on-surface-variant">의 댓글 작성</span>
      </div>
      {errorMsg && (
        <div className="p-3 text-xs rounded-xl bg-red-50 text-red-600 border border-red-100">
          {errorMsg}
        </div>
      )}
      {offlineSuccess && (
        <div className="p-3 text-xs rounded-xl bg-violet-500/10 text-violet-300 border border-violet-500/20 animate-pulse font-medium">
          💚 네트워크 장애가 감지되어 작성하신 댓글이 <strong>오프라인 대기열(IndexedDB)</strong>에 임시 안전 저장되었습니다. 온라인 연결이 복구되면 자동으로 전송 및 적용됩니다!
        </div>
      )}
      <div className="relative">
        <textarea
          rows={3}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={placeholder}
          maxLength={2000}
          className="w-full p-4 rounded-2xl border border-surface-container focus:outline-none focus:border-primary text-sm font-body resize-none"
        />
        <div className="absolute bottom-3 right-4 text-xs text-on-surface-variant select-none">
          {body.length} / 2000
        </div>
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || !body.trim()}
          className="px-5 py-2.5 bg-primary text-white font-semibold text-xs rounded-xl hover:bg-primary-container hover:text-primary transition duration-300 shadow-sm disabled:opacity-45"
        >
          {isSubmitting ? '등록 중...' : '댓글 등록'}
        </button>
      </div>
    </form>
  );
}
