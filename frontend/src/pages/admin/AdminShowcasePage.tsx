import { Link } from 'react-router-dom';

/**
 * 작품 쇼케이스 관리자 페이지 (임시 자리표시자)
 */
export default function AdminShowcasePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-on-surface">작품 쇼케이스 관리</h1>
          <p className="text-sm text-on-surface-variant font-body">창작물의 쇼케이스 전시를 큐레이션하고 목록을 관리합니다.</p>
        </div>
        <Link
          to="/admin/showcase/new"
          className="px-4 py-2 bg-primary text-on-primary rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors"
        >
          + 새 작품 등록
        </Link>
      </div>
      <div className="bg-surface border border-outline-variant rounded-2xl p-8 text-center space-y-4">
        <div className="text-4xl">🎭</div>
        <p className="text-sm text-on-surface-variant max-w-md mx-auto">
          포트폴리오에 전시할 핵심 창작물과 여러 미디어 파일, 카테고리를 설정하는 기능이 Plan 7에서 연동될 예정입니다.
        </p>
      </div>
    </div>
  );
}
