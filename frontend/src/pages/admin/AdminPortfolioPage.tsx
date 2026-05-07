/**
 * 포트폴리오 섹션 관리 관리자 페이지 (임시 자리표시자)
 */
export default function AdminPortfolioPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-on-surface">포트폴리오 섹션 관리</h1>
          <p className="text-sm text-on-surface-variant font-body">이력서와 포트폴리오의 각 탭 및 섹션을 구성하고 순서를 정렬합니다.</p>
        </div>
      </div>
      <div className="bg-surface border border-outline-variant rounded-2xl p-8 text-center space-y-4">
        <div className="text-4xl">💼</div>
        <p className="text-sm text-on-surface-variant max-w-md mx-auto">
          학력, 대외 활동, 기술 요약, 목표 등 맞춤형 이력서 카드의 CRUD 기능이 Plan 7에서 연동될 예정입니다.
        </p>
      </div>
    </div>
  );
}
