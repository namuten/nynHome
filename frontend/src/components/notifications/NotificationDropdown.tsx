import React from 'react';
import {
  useNotifications,
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useDeleteNotification,
} from '../../hooks/useNotifications';
import { NotificationItem } from './NotificationItem';
import { CheckCheck, BellOff, Loader2 } from 'lucide-react';

interface NotificationDropdownProps {
  onClose: () => void;
  isAdmin?: boolean;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  onClose,
  isAdmin = false,
}) => {
  const { data, isLoading, isError } = useNotifications(1, 5); // 최근 5개 조회
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const markAsRead = useMarkNotificationAsRead();
  const deleteNotif = useDeleteNotification();

  const notifications = data?.items || [];
  const hasNotifications = notifications.length > 0;
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead.mutateAsync();
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const handleMarkRead = async (id: number) => {
    try {
      await markAsRead.mutateAsync(id);
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteNotif.mutateAsync(id);
    } catch (err) {
      console.error('Failed to delete notification', err);
    }
  };

  return (
    <div className="absolute right-0 mt-3 w-80 sm:w-[360px] bg-zinc-950/95 border border-zinc-800/80 rounded-2xl shadow-2xl backdrop-blur-xl z-[100] flex flex-col overflow-hidden animate-fade-in-up">
      {/* 드롭다운 헤더 */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-zinc-800/50 bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-zinc-100">알림 피드</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-violet-500 text-white rounded-full animate-bounce">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={markAllAsRead.isPending}
            className="flex items-center gap-1 text-[11px] font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            {markAllAsRead.isPending ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
            )}
            모두 읽음
          </button>
        )}
      </div>

      {/* 리스트 영역 */}
      <div className="max-h-[360px] overflow-y-auto p-3 flex flex-col gap-2 scrollbar-thin scrollbar-thumb-white/5">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-zinc-500">
            <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
            <span className="text-xs">알림을 동기화하고 있습니다...</span>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-12 text-zinc-500 text-xs">
            ⚠️ 알림을 불러오지 못했습니다.
          </div>
        ) : !hasNotifications ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 gap-3 text-zinc-500">
            <div className="p-3 bg-zinc-900 rounded-full border border-zinc-800/80">
              <BellOff className="w-6 h-6 text-zinc-400" />
            </div>
            <div className="text-center">
              <h5 className="text-xs font-semibold text-zinc-300">새로운 알림이 없습니다.</h5>
              <p className="text-[10px] text-zinc-500 mt-1">도착한 소식들이 모두 여기에 표시됩니다.</p>
            </div>
          </div>
        ) : (
          notifications.map((notif) => (
            <NotificationItem
              key={notif.id}
              notification={notif}
              onRead={handleMarkRead}
              onDelete={handleDelete}
              isAdmin={isAdmin}
            />
          ))
        )}
      </div>

      {/* 드롭다운 푸터 */}
      <div className="border-t border-zinc-800/50 bg-white/[0.01] p-2.5 text-center">
        <button
          onClick={onClose}
          className="text-[11px] font-bold text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          드롭다운 닫기
        </button>
      </div>
    </div>
  );
};
export default NotificationDropdown;
