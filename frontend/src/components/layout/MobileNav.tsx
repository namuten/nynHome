import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Briefcase, Bell, User } from 'lucide-react';
import { useLocale } from '../../hooks/useLocale';
import { useUnreadNotificationsCount } from '../../hooks/useNotifications';
import { useAuth } from '../../hooks/useAuth';

export default function MobileNav() {
  const location = useLocation();
  const { t } = useLocale();
  const { isAuthenticated } = useAuth();
  
  // 읽지 않은 알림 갯수 가져오기 (로그인 시에만 폴링 가동)
  const { data: unreadCount } = useUnreadNotificationsCount(isAuthenticated);
  const activeUnread = isAuthenticated ? (unreadCount || 0) : 0;

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { label: t('navHome') || '홈', path: '/', icon: Home },
    { label: '탐색', path: '/search', icon: Search },
    { label: '포트폴리오', path: '/portfolio', icon: Briefcase },
    { 
      label: '알림', 
      path: '/notifications', 
      icon: Bell, 
      badge: activeUnread > 0 ? activeUnread : undefined 
    },
    { label: t('navProfile') || '프로필', path: '/profile', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 border-t border-slate-900 shadow-[0_-8px_30px_rgba(0,0,0,0.3)] backdrop-blur-xl px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] font-body touch-none select-none">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-200 ${
                active
                  ? 'text-violet-400 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5.5 h-5.5 transition-transform duration-200 ${active ? 'stroke-[2.5px] scale-110 text-violet-400' : 'stroke-2'}`} />
                
                {/* 읽지 않은 알림 수량 배지 표시 */}
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white ring-1 ring-slate-950 animate-bounce-subtle">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight select-none">{item.label}</span>
              
              {/* Active 인디케이터 도트 */}
              {active && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.8)]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
