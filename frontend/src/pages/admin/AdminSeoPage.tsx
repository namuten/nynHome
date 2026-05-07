/**
 * SEO 및 Open Graph 설정 관리자 페이지 (임시 자리표시자)
 */
export default function AdminSeoPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-on-surface">SEO / Open Graph 설정</h1>
          <p className="text-sm text-on-surface-variant font-body">주요 퍼블릭 페이지의 검색 엔진 최적화 및 메타데이터를 통합 관리합니다.</p>
        </div>
      </div>
      <div className="bg-surface border border-outline-variant rounded-2xl p-8 text-center space-y-4">
        <div className="text-4xl">🔍</div>
        <p className="text-sm text-on-surface-variant max-w-md mx-auto">
          사이트 공유 미리보기 이미지(OG Image), 대표 타이틀, 설명 및 검색 태그 기본값을 셋팅하는 설정 화면이 Plan 7에서 연동될 예정입니다.
        </p>
      </div>
    </div>
  );
}
