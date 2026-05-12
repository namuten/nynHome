import { Link, useLocation } from 'react-router-dom';
import { Home, Image, BookOpen, GraduationCap, User as UserIcon, ShieldAlert, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useLocale } from '../../hooks/useLocale';
import LocaleToggle from '../LocaleToggle';
import NotificationBell from '../notifications/NotificationBell';
import SearchBar from '../search/SearchBar';

export default function SiteHeader() {
  const location = useLocation();
  const { isAuthenticated, user, isAdmin, logout } = useAuth();
  const { t } = useLocale();
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { label: t('navHome'), path: '/', icon: Home },
    { label: t('navGallery'), path: '/gallery', icon: Image },
    { label: t('navBlog'), path: '/blog', icon: BookOpen },
    { label: t('navStudy'), path: '/study', icon: GraduationCap },
    { label: t('navProfile'), path: '/profile', icon: UserIcon },
  ];

  return (
    <header className="fixed md:sticky top-0 left-0 right-0 z-40 w-full glass-surface border-b border-surface-container transition-all duration-300 max-md:touch-none max-md:select-none pt-[env(safe-area-inset-top)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 lg:gap-8">
        {/* Brand */}
        <Link to="/" className="flex items-center space-x-2 shrink-0 whitespace-nowrap">
          <img 
            src="/branding/crochub-logo.svg" 
            alt="CrocHub Logo" 
            className="w-8 h-8 rounded-lg object-contain bg-primary/10 p-0.5" 
          />
          <span className="text-xl font-display font-extrabold tracking-wider text-primary">
            Croc<span className="text-secondary">Hub</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex space-x-0.5 lg:space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-1.5 lg:space-x-2 px-2.5 lg:px-4 py-2 rounded-xl text-xs lg:text-sm font-body font-bold whitespace-nowrap transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-primary text-white shadow-sm shadow-primary/25'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-primary'
                }`}
              >
                <Icon className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Auth / Right menu */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          <div className="hidden sm:block">
            <SearchBar />
          </div>
          <LocaleToggle />

          {isAuthenticated && (
            <NotificationBell isAdmin={isAdmin} />
          )}

          {isAdmin && (
            <Link
              to="/admin"
              className={`p-2 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-primary transition duration-200 shrink-0 ${
                isActive('/admin') ? 'text-primary' : ''
              }`}
              title="Admin Panel"
            >
              <ShieldAlert className="w-5 h-5" />
            </Link>
          )}

          {isAuthenticated ? (
            <div className="flex items-center space-x-2.5 sm:space-x-3 shrink-0">
              <span className="hidden sm:inline-block text-sm font-body font-bold text-on-surface whitespace-nowrap shrink-0">
                {user?.nickname}님
              </span>
              <button
                onClick={logout}
                className="flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-2 bg-surface-container text-on-surface-variant hover:bg-red-50 hover:text-red-600 rounded-xl text-sm font-body font-bold transition duration-200 whitespace-nowrap shrink-0"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">로그아웃</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-1">
              <Link
                to="/login"
                className="flex items-center space-x-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl text-sm font-body font-bold transition duration-300"
              >
                <LogIn className="w-4 h-4" />
                <span>로그인</span>
              </Link>
              <Link
                to="/register"
                className="hidden sm:flex items-center space-x-2 px-4 py-2 text-on-surface-variant hover:bg-surface-container rounded-xl text-sm font-body font-bold transition duration-200"
              >
                <span>회원가입</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
