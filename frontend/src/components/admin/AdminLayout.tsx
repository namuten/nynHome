import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Menu, X, Globe, User } from 'lucide-react';
import AdminNav from './AdminNav';
import { useAuth } from '../../hooks/useAuth';

export default function AdminLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#fbf8ff] flex font-body antialiased">
      {/* Desktop Left Sidebar Sidebar */}
      <aside className="hidden lg:block w-64 fixed inset-y-0 left-0 z-20">
        <AdminNav />
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-30 transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 w-64 z-40 transform transition-transform duration-300 ease-out bg-white ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="relative h-full">
          <AdminNav />
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="absolute top-4.5 right-4 p-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high transition-all text-on-surface-variant"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 min-w-0 lg:pl-64 flex flex-col">
        {/* Top Header Panel */}
        <header className="sticky top-0 z-10 bg-white/70 backdrop-blur-md border-b border-surface-container px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          {/* Mobile toggle button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-xl border border-surface-container bg-surface/50 hover:bg-surface-container transition-all"
          >
            <Menu className="w-5 h-5 text-on-surface" />
          </button>

          {/* Quick Stats or Greeting */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-lg">🌿</span>
            <span className="text-xs font-semibold text-on-surface-variant">
              안녕하세요, <strong className="text-primary">{user?.nickname}</strong> 관리자님! 오늘도 멋진 사이트 운영을 기대합니다.
            </span>
          </div>

          {/* Action Utilities */}
          <div className="flex items-center gap-3 ml-auto">
            <Link
              to="/"
              className="flex items-center gap-2 px-3.5 py-2 bg-surface border border-surface-container rounded-xl text-xs font-bold text-on-surface-variant hover:text-primary hover:border-primary/30 transition-all duration-300"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">홈페이지 바로가기</span>
            </Link>

            {/* Profile Avatar Quick-card */}
            <div className="flex items-center gap-2 pl-3 border-l border-surface-container">
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <User className="w-4 h-4" />
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Nested Route Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
