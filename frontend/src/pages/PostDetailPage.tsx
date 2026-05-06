import { useParams, Link } from 'react-router-dom';

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <Link to="/" className="text-sm font-semibold text-primary hover:underline">&larr; 홈으로 돌아가기</Link>
      <div className="space-y-4 border-b border-surface-container pb-6">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">Post #{id}</span>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-on-surface">상세 게시글 불러오는 중...</h1>
        <div className="text-sm text-on-surface-variant font-body">작성일: - | 조회수: -</div>
      </div>
      <div className="py-10 text-center text-on-surface-variant font-body">
        게시글 상세 내용을 불러오고 있습니다.
      </div>
    </div>
  );
}
