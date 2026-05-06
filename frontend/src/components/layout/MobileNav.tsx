import { Link, useLocation } from 'react-router-dom';
import { Home, Image, BookOpen, GraduationCap, User } from 'lucide-react';

export default function MobileNav() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { label: '홈', path: '/', icon: Home },
    { label: '갤러리', path: '/gallery', icon: Image },
    { label: '블로그', path: '/blog', icon: BookOpen },
    { label: '학습', path: '/study', icon: GraduationCap },
    { label: '프로필', path: '/profile', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-surface-container shadow-[0_-4px_20px_rgba(0,0,0,0.03)] px-2 pb-safe">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200 ${
                active
                  ? 'text-primary scale-105 font-bold'
                  : 'text-on-surface-variant'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              <span className="text-[10px] font-body mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
