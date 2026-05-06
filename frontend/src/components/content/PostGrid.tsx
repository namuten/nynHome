import PostCard from './PostCard';
import type { PostSummary } from '../../types/api';

interface PostGridProps {
  posts: PostSummary[] | undefined;
  isLoading: boolean;
  isError: boolean;
  emptyMessage?: string;
}

export default function PostGrid({
  posts,
  isLoading,
  isError,
  emptyMessage = '게시글이 존재하지 않습니다.',
}: PostGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map((n) => (
          <div key={n} className="rounded-3xl border border-surface-container overflow-hidden space-y-4 animate-pulse bg-white">
            <div className="aspect-[16/10] bg-surface-container" />
            <div className="p-6 space-y-3">
              <div className="h-6 bg-surface-container rounded-lg w-3/4" />
              <div className="h-4 bg-surface-container rounded-lg w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-16 text-center">
        <div className="p-6 max-w-md mx-auto rounded-3xl bg-red-50 border border-red-100 text-red-600 space-y-2">
          <h4 className="font-display font-bold">오류가 발생했습니다</h4>
          <p className="text-sm font-body">게시글 목록을 로드하는 동안 에러가 발생했습니다. 잠시 후 다시 시도해주세요.</p>
        </div>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="py-20 text-center text-on-surface-variant font-body">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
