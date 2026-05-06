export default function AdminPlaceholderPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-6 text-center">
      <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl mx-auto flex items-center justify-center text-2xl font-bold">
        🛠️
      </div>
      <h1 className="text-3xl font-display font-bold text-on-surface">관리자 대시보드</h1>
      <p className="text-sm text-on-surface-variant font-body max-w-md mx-auto leading-relaxed">
        이곳은 관리자 전용 대시보드 영역입니다. 컨텐츠 관리, 댓글 중재 및 통계 요약은 다음 마일스톤(Plan 5)에서 완벽히 구성될 예정입니다.
      </p>
    </div>
  );
}
