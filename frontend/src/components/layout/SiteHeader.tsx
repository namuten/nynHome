import { Link, useLocation } from 'react-router-dom';
import { Home, Image, BookOpen, GraduationCap, User, ShieldAlert, LogIn } from 'lucide-react';

export default function SiteHeader() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Gallery', path: '/gallery', icon: Image },
    { label: 'Blog', path: '/blog', icon: BookOpen },
    { label: 'Study', path: '/study', icon: GraduationCap },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-surface border-b border-surface-container transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-xl font-display font-extrabold tracking-wider text-primary">
            Croc<span className="text-secondary">Hub</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-body font-semibold transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-primary'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Auth / Right menu placeholder */}
        <div className="flex items-center space-x-2">
          <Link
            to="/admin"
            className={`p-2 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-primary transition duration-200 ${
              isActive('/admin') ? 'text-primary' : ''
            }`}
            title="Admin"
          >
            <ShieldAlert className="w-5 h-5" />
          </Link>
          <Link
            to="/login"
            className="flex items-center space-x-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl text-sm font-body font-bold transition duration-300"
          >
            <LogIn className="w-4 h-4" />
            <span className="hidden sm:inline">로그인</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
