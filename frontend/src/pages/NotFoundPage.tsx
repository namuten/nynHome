import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-24 space-y-6 text-center">
      <div className="text-6xl font-extrabold font-display text-primary-container">404</div>
      <h1 className="text-3xl font-display font-bold text-on-surface">페이지를 찾을 수 없습니다</h1>
      <p className="text-sm text-on-surface-variant font-body">요청하신 주소의 정보가 올바르지 않거나 삭제되었을 수 있습니다.</p>
      <Link to="/" className="inline-block px-6 py-2.5 bg-primary text-white font-body font-semibold rounded-xl hover:bg-primary-container hover:text-primary transition duration-300 shadow-md">
        홈으로 가기
      </Link>
    </div>
  );
}
