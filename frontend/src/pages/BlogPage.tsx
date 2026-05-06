export default function BlogPage() {
  return (
    <div className="space-y-6 py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="border-b border-surface-container pb-5 space-y-2">
        <h1 className="text-3xl font-display font-bold text-on-surface">Blog</h1>
        <p className="text-sm text-on-surface-variant font-body">자유로운 일상 기록과 생각 모음집입니다.</p>
      </div>
      <div className="py-20 text-center space-y-4">
        <p className="text-on-surface-variant font-body">아직 등록된 블로그 글이 없습니다.</p>
      </div>
    </div>
  );
}
