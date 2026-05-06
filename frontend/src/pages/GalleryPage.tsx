import { usePosts } from '../hooks/usePosts';
import PostGrid from '../components/content/PostGrid';

export default function GalleryPage() {
  const { data, isLoading, isError } = usePosts({ category: 'creative' });

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="border-b border-surface-container pb-5 space-y-2">
        <h1 className="text-3xl font-display font-extrabold text-on-surface">Gallery</h1>
        <p className="text-sm text-on-surface-variant font-body font-medium">아티스틱한 창작물과 일러스트레이션 아카이브 공간입니다.</p>
      </div>

      <PostGrid
        posts={data?.data}
        isLoading={isLoading}
        isError={isError}
        emptyMessage="갤러리에 등록된 예술 작품이 아직 없습니다."
      />
    </div>
  );
}
