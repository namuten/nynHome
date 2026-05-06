export default function StudyPage() {
  return (
    <div className="space-y-6 py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="border-b border-surface-container pb-5 space-y-2">
        <h1 className="text-3xl font-display font-bold text-on-surface">Study</h1>
        <p className="text-sm text-on-surface-variant font-body">학습 자료실과 진학 노하우 가이드입니다.</p>
      </div>
      <div className="py-20 text-center space-y-4">
        <p className="text-on-surface-variant font-body">아직 등록된 학습 노트가 없습니다.</p>
      </div>
    </div>
  );
}
