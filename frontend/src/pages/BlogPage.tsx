import { usePosts } from '../hooks/usePosts';
import PostGrid from '../components/content/PostGrid';

export default function BlogPage() {
  const { data, isLoading, isError } = usePosts({ category: 'blog' });

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="border-b border-surface-container pb-5 space-y-2">
        <h1 className="text-3xl font-display font-extrabold text-on-surface">Blog</h1>
        <p className="text-sm text-on-surface-variant font-body font-medium">일상 속 기록들과 소소한 기록을 자유롭게 공유하는 블로그 공간입니다.</p>
      </div>

      <PostGrid
        posts={data?.data}
        isLoading={isLoading}
        isError={isError}
        emptyMessage="블로그에 작성된 글이 아직 없습니다."
      />
    </div>
  );
}
