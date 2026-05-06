import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ShieldAlert } from 'lucide-react';

export default function AdminRouteGuard() {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page and preserve current path to return after login
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (!isAdmin) {
    // Show a high-quality glassmorphism 403 Forbidden view
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 font-body">
        <div className="max-w-md w-full p-8 rounded-3xl border border-surface-container bg-white/70 backdrop-blur-md text-center space-y-5 shadow-lg animate-fade-in">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto border border-red-100">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-display font-bold text-on-surface">접근 제한 영역</h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              요청하신 페이지는 관리자 전용 영역입니다. 일반 계정으로는 접근할 수 없습니다.
            </p>
          </div>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-container hover:text-primary transition duration-300 shadow-md"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // Admin verified, render nested admin pages
  return <Outlet />;
}
