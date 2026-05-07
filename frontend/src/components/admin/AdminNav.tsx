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
  Send,
  LogOut,
  User,
  Briefcase,
  Palette,
  Globe,
  BarChart3,
  History,
  Server,
  ShieldAlert,
  Flag,
  Hash,
  FolderHeart,
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
    { to: '/admin/tags', label: '태그 카테고리', icon: Hash },
    { to: '/admin/collections', label: '컬렉션 시리즈', icon: FolderHeart },
  ];

  const brandingMenuItems = [
    { to: '/admin/profile', label: '프로필 설정', icon: User },
    { to: '/admin/portfolio', label: '포트폴리오 관리', icon: Briefcase },
    { to: '/admin/showcase', label: '작품 쇼케이스', icon: Palette },
    { to: '/admin/seo', label: 'SEO 설정', icon: Globe },
  ];

  const communityMenuItems = [
    { to: '/admin/moderation', label: '모더레이션 큐', icon: ShieldAlert },
    { to: '/admin/reports', label: '신고 내역 관리', icon: Flag },
  ];

  const advancedMenuItems = [
    { to: '/admin/layout', label: '홈 레이아웃 편집', icon: Sliders },
    { to: '/admin/schedule', label: '캘린더 일정 관리', icon: Calendar },
    { to: '/admin/settings', label: '어드민 환경 설정', icon: Settings },
    { to: '/admin/push', label: '푸시 알림 발송', icon: Send },
    { to: '/admin/analytics', label: '서비스 통계', icon: BarChart3 },
    { to: '/admin/audit-logs', label: '감사 로그', icon: History },
    { to: '/admin/operations', label: '시스템 운영', icon: Server },
  ];

  return (
    <div className="flex flex-col h-full bg-white/80 backdrop-blur-md border-r border-surface-container font-body">
      {/* Brand Header */}
      <div className="p-6 border-b border-surface-container flex items-center gap-3">
        <img 
          src="/branding/crochub-logo.svg" 
          alt="CrocHub Admin Logo" 
          className="w-10 h-10 rounded-2xl object-contain bg-primary/10 border border-primary/20 p-1 shadow-inner animate-pulse-slow" 
        />
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

        {/* Community Management */}
        <div className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest px-3 pt-6 mb-2 select-none">
          커뮤니티 관리
        </div>
        {communityMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
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

        {/* Personal Branding management */}
        <div className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest px-3 pt-6 mb-2 select-none">
          개인 브랜딩
        </div>
        {brandingMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
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

        {/* Advanced management features */}
        <div className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest px-3 pt-6 mb-2 select-none">
          고급 운영 기능
        </div>
        {advancedMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
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
