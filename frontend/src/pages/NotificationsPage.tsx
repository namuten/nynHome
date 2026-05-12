import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, Loader2, LogIn } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import {
  useNotifications,
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useDeleteNotification,
} from '../hooks/useNotifications';
import NotificationItem from '../components/notifications/NotificationItem';
import type { Notification } from '../lib/notificationsApi';

export default function NotificationsPage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [page, setPage] = useState(1);
  const limit = 15;

  // 알림 데이터 가져오기 (로그인 상태일 때만 활성화)
  const { data, isLoading, refetch } = useNotifications(page, limit, undefined);
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const markAsReadMutation = useMarkNotificationAsRead();
  const deleteMutation = useDeleteNotification();

  const notifications = data?.items || [];
  const totalCount = data?.total || 0;
  const hasMore = page * limit < totalCount;

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
      refetch();
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const handleRead = async (id: number) => {
    try {
      await markAsReadMutation.mutateAsync(id);
      refetch();
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      refetch();
    } catch (err) {
      console.error('Failed to delete notification', err);
    }
  };

  // 1. 비로그인 상태 화면
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-6 font-body">
        <div className="w-20 h-20 bg-violet-500/10 border border-violet-500/20 rounded-3xl flex items-center justify-center mx-auto shadow-[0_8px_30px_rgba(167,139,250,0.15)] animate-pulse">
          <Bell className="w-10 h-10 text-violet-400" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-display font-extrabold text-zinc-100">알림 확인</h1>
          <p className="text-zinc-400 text-sm leading-relaxed">
            알림 서비스는 회원 가입 및 로그인 후에 이용 가능합니다.<br />
            로그인하여 새로운 소식을 실시간으로 확인해보세요.
          </p>
        </div>
        <div className="pt-4">
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-violet-600 text-white font-bold rounded-2xl shadow-lg shadow-violet-600/20 hover:bg-violet-500 transition-all duration-300"
          >
            <LogIn className="w-5 h-5" />
            <span>로그인하러 가기</span>
          </Link>
        </div>
      </div>
    );
  }

  // 2. 로그인 상태 메인 화면
  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 space-y-6 font-body pb-24">
      {/* 헤더 섹션 */}
      <div className="flex items-center justify-between gap-4 border-b border-zinc-900 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-violet-500/10 border border-violet-500/20 rounded-2xl text-violet-400">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-display font-extrabold text-zinc-100">새로운 알림</h1>
            <p className="text-zinc-500 text-xs mt-0.5">실시간으로 전달된 시스템 및 서비스 알림 목록</p>
          </div>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={markAllAsReadMutation.isPending}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-violet-400 hover:text-violet-300 bg-violet-500/5 border border-violet-500/10 hover:border-violet-500/20 rounded-xl transition duration-200"
          >
            <CheckCheck className="w-4 h-4" />
            <span>모두 읽음</span>
          </button>
        )}
      </div>

      {/* 로딩 표시 */}
      {isLoading && page === 1 ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-3">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
          <span className="text-zinc-500 text-sm">알림 목록을 로드하는 중...</span>
        </div>
      ) : notifications.length === 0 ? (
        /* 빈 화면 */
        <div className="flex flex-col items-center justify-center py-28 text-center space-y-4 rounded-3xl border border-dashed border-zinc-900/60 bg-zinc-950/20 backdrop-blur-sm">
          <div className="p-4 bg-zinc-900/40 rounded-2xl text-zinc-600">
            <Bell className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-zinc-300">알림이 없습니다</h3>
            <p className="text-zinc-500 text-xs">최근에 수신된 새로운 소식이 없습니다.</p>
          </div>
        </div>
      ) : (
        /* 알림 리스트 */
        <div className="space-y-3">
          <div className="flex flex-col gap-2.5">
            {notifications.map((notif: Notification) => (
              <NotificationItem
                key={notif.id}
                notification={notif}
                onRead={handleRead}
                onDelete={handleDelete}
                isAdmin={isAdmin}
              />
            ))}
          </div>

          {/* 더 보기 페이징 */}
          {hasMore && (
            <div className="pt-4 text-center">
              <button
                onClick={() => setPage((prev) => prev + 1)}
                className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-xl transition duration-200"
              >
                <span>더 보기 ({page * limit}/{totalCount})</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
