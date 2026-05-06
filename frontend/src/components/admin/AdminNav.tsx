import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Image,
  MessageSquare,
  Users,
  Calendar,
  Settings,
  Sliders,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function AdminNav() {
  const { logout, user } = useAuth();

  const menuItems = [
    { to: '/admin', label: '대시보드', icon: LayoutDashboard, exact: true },
    { to: '/admin/content', label: '게시물 관리', icon: FileText },
    { to: '/admin/media', label: '미디어 라이브러리', icon: Image },
    { to: '/admin/comments', label: '댓글 관리', icon: MessageSquare },
    { to: '/admin/users', label: '사용자 관리', icon: Users },
  ];

  const disabledItems = [
    { label: '홈 레이아웃 편집', icon: Sliders },
    { label: '캘린더 일정 관리', icon: Calendar },
    { label: '어드민 환경 설정', icon: Settings },
  ];

  return (
    <div className="flex flex-col h-full bg-white/80 backdrop-blur-md border-r border-surface-container font-body">
      {/* Brand Header */}
      <div className="p-6 border-b border-surface-container flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-inner">
          <span className="text-xl">🐊</span>
        </div>
        <div>
          <h2 className="text-sm font-display font-black text-primary tracking-wider uppercase">CrocHub Admin</h2>
          <p className="text-[10px] text-on-surface-variant font-medium">크록허브 어드민 콘솔</p>
        </div>
      </div>

      {/* User Session card */}
      <div className="p-4 mx-4 my-5 rounded-2xl bg-surface-container/30 border border-surface-container/50 space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-accent text-white font-bold text-xs flex items-center justify-center shadow-md">
            {user?.nickname?.[0] || 'A'}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-on-surface truncate">{user?.nickname || '관리자'}</h4>
            <p className="text-[10px] text-on-surface-variant truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest px-3 mb-2 select-none">
          운영 관리
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all duration-300 ${
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`
              }
            >
              <Icon className="w-4.5 h-4.5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        {/* Disabled features for future scope */}
        <div className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest px-3 pt-6 mb-2 select-none">
          추가 예정 (Plan 6)
        </div>
        {disabledItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-medium text-on-surface-variant/40 cursor-not-allowed select-none"
              title="다음 Plan에서 지원할 예정입니다."
            >
              <Icon className="w-4.5 h-4.5 opacity-40" />
              <span>{item.label}</span>
              <span className="ml-auto text-[9px] px-1.5 py-0.5 bg-surface-container rounded-md text-on-surface-variant/50 font-bold">
                대기
              </span>
            </div>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-surface-container">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all duration-300"
        >
          <LogOut className="w-4 h-4" />
          <span>로그아웃</span>
        </button>
      </div>
    </div>
  );
}
