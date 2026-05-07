import React, { useEffect, useState } from 'react';
import { Wifi, CloudLightning, Loader2 } from 'lucide-react';
import { pendingComments } from '../../lib/offlineComments';

interface PendingCommentsBannerProps {
  postId?: number;
  onSyncComplete?: () => void;
}

export const PendingCommentsBanner: React.FC<PendingCommentsBannerProps> = ({ postId, onSyncComplete }) => {
  const [count, setCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const updateCount = async () => {
    const list = await pendingComments.getAll();
    if (postId) {
      // 특정 포스트 ID로 필터링한 건수 획득
      const filtered = list.filter((item) => item.postId === postId);
      setCount(filtered.length);
    } else {
      setCount(list.length);
    }
  };

  useEffect(() => {
    updateCount();

    // 1초 간격으로 대기열 스캔 (폴링 방식으로 갯수 업데이트 보장)
    const interval = setInterval(updateCount, 1500);

    return () => clearInterval(interval);
  }, [postId]);

  // 온라인 복귀 시 수동 혹은 자동 동기화 가동 트리거
  const handleManualSync = async () => {
    if (!navigator.onLine || isSyncing) return;
    setIsSyncing(true);

    try {
      const list = await pendingComments.getAll();
      const targetList = postId ? list.filter((item) => item.postId === postId) : list;

      const { api } = await import('../../lib/api');

      for (const item of targetList) {
        try {
          // 순차적으로 백엔드 서버에 전송 병합
          await api.post(`/posts/${item.postId}/comments`, { body: item.content });
          await pendingComments.remove(item.id);
        } catch (err) {
          console.error(`⚠️ Failed to sync pending comment ${item.id}:`, err);
        }
      }

      await updateCount();
      if (onSyncComplete) onSyncComplete();
    } catch (e) {
      console.error('⚠️ Offline Comments Sync failed:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    // 온라인 상태로 복귀하는 즉시 자동 싱크 기동
    const handleOnline = () => {
      setTimeout(handleManualSync, 1000);
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [postId]);

  if (count === 0) return null;

  return (
    <div className="p-4 rounded-2xl border border-violet-500/20 bg-violet-950/20 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-violet-400">
          {isSyncing ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <CloudLightning className="h-5 w-5 animate-pulse" />
          )}
        </div>
        <div className="text-left">
          <h4 className="text-sm font-semibold text-violet-200">
            오프라인 전송 대기 댓글 ({count}건)
          </h4>
          <p className="text-xs text-violet-400/80 mt-0.5">
            인터넷 끊김 중에 보존된 의견이 있습니다. 온라인으로 연결되면 자동으로 연동됩니다.
          </p>
        </div>
      </div>

      {navigator.onLine && (
        <button
          onClick={handleManualSync}
          disabled={isSyncing}
          className="flex items-center gap-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs px-4 py-2 shadow-lg shadow-violet-600/20 active:scale-95 transition-all disabled:opacity-50 cursor-pointer w-full sm:w-auto justify-center"
        >
          <Wifi className="h-3.5 w-3.5" />
          {isSyncing ? '동기화 중...' : '지금 바로 전송'}
        </button>
      )}
    </div>
  );
};

export default PendingCommentsBanner;
