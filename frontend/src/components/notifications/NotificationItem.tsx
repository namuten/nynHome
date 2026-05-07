import React from 'react';
import type { Notification } from '../../lib/notificationsApi';
import { MessageSquare, Bell, ShieldAlert, X, Eye } from 'lucide-react';

interface NotificationItemProps {
  notification: Notification;
  onRead?: (id: number) => void;
  onDelete?: (id: number) => void;
  isAdmin?: boolean;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onRead,
  onDelete,
  isAdmin = false,
}) => {
  const { id, type, title, body, linkUrl, isRead, createdAt } = notification;

  // 알림 유형별 아이콘 및 테마 색상 설정
  const getTheme = () => {
    switch (type) {
      case 'new_comment':
        return {
          icon: <MessageSquare className="w-5 h-5 text-blue-400" />,
          bg: 'bg-blue-500/10 border-blue-500/20',
          hoverBg: 'hover:bg-blue-500/15',
          indicator: 'bg-blue-500',
        };
      case 'new_guestbook':
        return {
          icon: <MessageSquare className="w-5 h-5 text-emerald-400" />,
          bg: 'bg-emerald-500/10 border-emerald-500/20',
          hoverBg: 'hover:bg-emerald-500/15',
          indicator: 'bg-emerald-500',
        };
      case 'report_resolved':
        return {
          icon: <ShieldAlert className="w-5 h-5 text-violet-400" />,
          bg: 'bg-violet-500/10 border-violet-500/20',
          hoverBg: 'hover:bg-violet-500/15',
          indicator: 'bg-violet-500',
        };
      case 'broadcast':
      default:
        return {
          icon: <Bell className="w-5 h-5 text-amber-400" />,
          bg: 'bg-amber-500/10 border-amber-500/20',
          hoverBg: 'hover:bg-amber-500/15',
          indicator: 'bg-amber-500',
        };
    }
  };

  const theme = getTheme();
  const formattedTime = new Date(createdAt).toLocaleString('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  const handleItemClick = (e: React.MouseEvent) => {
    // 만약 버튼(지우기, 읽기)을 직접 클릭한 경우엔 부모 영역 클릭 이벤트를 방지
    const target = e.target as HTMLElement;
    if (target.closest('.action-button')) return;

    if (!isRead && onRead) {
      onRead(id);
    }

    if (linkUrl) {
      window.location.href = linkUrl;
    }
  };

  return (
    <div
      onClick={handleItemClick}
      className={`relative flex items-start gap-3 p-3.5 rounded-xl border transition-all duration-300 cursor-pointer text-left backdrop-blur-sm ${
        isRead ? 'bg-white/5 border-white/10 hover:bg-white/10' : `${theme.bg} ${theme.hoverBg}`
      }`}
    >
      {/* 읽지 않은 알림 하이라이트 인디케이터 */}
      {!isRead && (
        <span className={`absolute top-4 right-4 w-2 h-2 rounded-full ${theme.indicator} animate-pulse`} />
      )}

      {/* 왼쪽 아이콘 */}
      <div className={`p-2 rounded-lg bg-white/5 border border-white/10 shrink-0`}>
        {theme.icon}
      </div>

      {/* 본문 콘텐츠 */}
      <div className="flex-1 min-w-0 pr-4">
        <h4 className={`text-sm font-semibold truncate ${isRead ? 'text-zinc-400' : 'text-zinc-100'}`}>
          {title}
        </h4>
        <p className={`text-xs mt-1 leading-relaxed line-clamp-2 ${isRead ? 'text-zinc-500' : 'text-zinc-300'}`}>
          {body}
        </p>
        <span className="text-[10px] text-zinc-500 mt-2 block font-medium">{formattedTime}</span>
      </div>

      {/* 우측 조작 조각 */}
      <div className="flex flex-col gap-1.5 shrink-0 action-button justify-center h-full">
        {!isRead && onRead && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRead(id);
            }}
            title="읽음 처리"
            className="p-1 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        )}
        {isAdmin && onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(id);
            }}
            title="삭제"
            className="p-1 rounded-md text-zinc-500 hover:text-red-400 hover:bg-white/5 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
export default NotificationItem;
