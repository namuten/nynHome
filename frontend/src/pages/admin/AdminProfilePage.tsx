/**
 * 프로필/브랜딩 설정 관리자 페이지 (임시 자리표시자)
 */
export default function AdminProfilePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-on-surface">프로필/브랜딩 설정</h1>
          <p className="text-sm text-on-surface-variant font-body">퍼블릭 자기소개 정보 및 소셜 링크, 기술 스택 등을 편집합니다.</p>
        </div>
      </div>
      <div className="bg-surface border border-outline-variant rounded-2xl p-8 text-center space-y-4">
        <div className="text-4xl">👤</div>
        <p className="text-sm text-on-surface-variant max-w-md mx-auto">
          KO/EN 다국어 프로필 입력, 아바타 및 커버 이미지 관리 기능이 Plan 7에서 연동될 예정입니다.
        </p>
      </div>
    </div>
  );
}
