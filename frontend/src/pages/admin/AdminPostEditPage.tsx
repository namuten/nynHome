import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PostEditorForm from '../../components/admin/PostEditorForm';
import type { PostFormFields } from '../../components/admin/PostEditorForm';
import { adminApi } from '../../lib/adminApi';
import { Sparkles } from 'lucide-react';

export default function AdminPostEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const postId = parseInt(id || '0', 10);

  // Fetch target post detail
  const { data: post, isLoading, isError } = useQuery({
    queryKey: ['admin', 'post', postId],
    queryFn: () => adminApi.getAdminPost(postId),
    enabled: postId > 0,
  });

  const handleUpdatePost = async (data: PostFormFields) => {
    await adminApi.updateAdminPost(postId, data);
    queryClient.invalidateQueries({ queryKey: ['admin', 'post', postId] });
    queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] });
    navigate('/admin/content');
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-12 flex flex-col items-center justify-center space-y-4 animate-pulse">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          <Sparkles className="w-6 h-6 animate-spin" />
        </div>
        <p className="text-xs font-semibold text-on-surface-variant font-body">콘텐츠 로딩 중...</p>
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center space-y-4 font-body">
        <p className="text-sm font-bold text-red-500">지정한 게시물을 불러올 수 없거나 존재하지 않습니다.</p>
        <button
          onClick={() => navigate('/admin/content')}
          className="px-4 py-2 text-xs font-bold border border-surface-container rounded-xl hover:bg-surface-container transition-all"
        >
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-4">
      <PostEditorForm
        initialValues={{
          title: post.title,
          category: post.category,
          body: post.body,
          thumbnailUrl: post.thumbnailUrl || undefined,
          isPublished: post.isPublished,
        }}
        onSubmit={handleUpdatePost}
        titleLabel="게시물 수정"
      />
    </div>
  );
}
