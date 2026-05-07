import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useUnreadNotificationsCount } from '../../hooks/useNotifications';
import { NotificationDropdown } from './NotificationDropdown';

interface NotificationBellProps {
  isAdmin?: boolean;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ isAdmin = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: unreadCount, refetch } = useUnreadNotificationsCount();
  const bellRef = useRef<HTMLDivElement>(null);

  const displayCount = unreadCount || 0;

  // 바깥 클릭 시 드롭다운 닫기 이벤트 핸들러
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      refetch(); // 오픈할 때 최신 카운트 동기화
    }
  };

  return (
    <div className="relative" ref={bellRef}>
      {/* 종 버튼 트리거 */}
      <button
        onClick={handleToggle}
        className={`relative p-2.5 rounded-xl border transition-all duration-300 focus:outline-none ${
          isOpen
            ? 'bg-violet-500/10 border-violet-500/30 text-violet-400'
            : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 hover:border-zinc-700/80'
        }`}
      >
        <Bell className={`w-5 h-5 ${displayCount > 0 && !isOpen ? 'animate-wiggle' : ''}`} />

        {/* 뱃지 아이콘 */}
        {displayCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-[9px] font-extrabold text-white ring-2 ring-zinc-950 animate-pulse">
            {displayCount}
          </span>
        )}
      </button>

      {/* 펼쳐지는 알림 드롭다운 */}
      {isOpen && (
        <NotificationDropdown
          onClose={() => setIsOpen(false)}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
};
export default NotificationBell;
