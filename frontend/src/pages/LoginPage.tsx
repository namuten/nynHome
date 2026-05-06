import { Link } from 'react-router-dom';

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-display font-bold text-primary">로그인</h1>
        <p className="text-sm text-on-surface-variant font-body">CrocHub에 방문하신 것을 환영합니다.</p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-surface-container shadow-sm space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-on-surface-variant">이메일</label>
          <input type="email" placeholder="email@example.com" className="w-full px-4 py-2.5 rounded-xl border border-surface-container bg-surface font-body text-sm focus:outline-none focus:border-primary" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-on-surface-variant">비밀번호</label>
          <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 rounded-xl border border-surface-container bg-surface font-body text-sm focus:outline-none focus:border-primary" />
        </div>
        <button className="w-full py-3 bg-primary text-white font-body font-semibold rounded-xl hover:bg-primary-container hover:text-primary transition duration-300 shadow-md">
          로그인
        </button>
      </div>

      <div className="text-center text-xs font-body text-on-surface-variant">
        계정이 없으신가요? <Link to="/register" className="text-primary font-semibold hover:underline">회원가입하기</Link>
      </div>
    </div>
  );
}
