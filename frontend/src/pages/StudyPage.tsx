import { usePosts } from '../hooks/usePosts';
import PostGrid from '../components/content/PostGrid';

export default function StudyPage() {
  const { data, isLoading, isError } = usePosts({ category: 'study' });

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="border-b border-surface-container pb-5 space-y-2">
        <h1 className="text-3xl font-display font-extrabold text-on-surface">Study</h1>
        <p className="text-sm text-on-surface-variant font-body font-medium">공부하며 터득한 지식 정보와 가이드 자료가 축적되는 공간입니다.</p>
      </div>

      <PostGrid
        posts={data?.data}
        isLoading={isLoading}
        isError={isError}
        emptyMessage="학습 자료실에 등록된 노트가 아직 없습니다."
      />
    </div>
  );
}
