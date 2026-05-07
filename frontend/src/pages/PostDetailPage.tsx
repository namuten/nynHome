import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { PostDetail } from '../types/api';
import { useComments } from '../hooks/useComments';
import CommentForm from '../components/comments/CommentForm';
import CommentList from '../components/comments/CommentList';
import PendingCommentsBanner from '../components/comments/PendingCommentsBanner';
import { ArrowLeft, Clock, Eye, AlertTriangle } from 'lucide-react';

import { getOptimizedImageUrl } from '../lib/media';

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const postId = Number(id);

  // 1. Fetch Post Detail
  const { data: post, isLoading: postLoading, isError: postError } = useQuery<PostDetail>({
    queryKey: ['post', postId],
    queryFn: async () => {
      const response = await api.get<PostDetail>(`/posts/${postId}`);
      return response.data;
    },
    enabled: !isNaN(postId),
  });

  // 2. Fetch/Manage Comments
  const { commentsQuery, createComment } = useComments(postId);

  if (isNaN(postId)) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto" />
        <h1 className="text-2xl font-display font-bold text-on-surface">올바르지 않은 접근입니다</h1>
        <Link to="/" className="text-primary font-semibold hover:underline">&larr; 홈으로 돌아가기</Link>
      </div>
    );
  }

  if (postLoading) {
    return (
      <div className="max-w-3xl mx-auto py-12 space-y-6 animate-pulse">
        <div className="h-6 bg-surface-container rounded-lg w-1/4" />
        <div className="h-10 bg-surface-container rounded-lg w-3/4" />
        <div className="h-4 bg-surface-container rounded-lg w-1/2" />
        <div className="space-y-3 pt-6">
          <div className="h-4 bg-surface-container rounded-lg" />
          <div className="h-4 bg-surface-container rounded-lg" />
          <div className="h-4 bg-surface-container rounded-lg w-5/6" />
        </div>
      </div>
    );
  }

  if (postError || !post) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
        <h1 className="text-2xl font-display font-bold text-on-surface">게시글을 찾을 수 없습니다</h1>
        <p className="text-sm text-on-surface-variant font-body">게시글이 존재하지 않거나 삭제되었을 수 있습니다.</p>
        <Link to="/" className="inline-block px-5 py-2 bg-primary text-white font-semibold rounded-xl hover:bg-primary-container hover:text-primary transition duration-200">홈으로 돌아가기</Link>
      </div>
    );
  }

  const formattedDate = new Date(post.createdAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-10 font-body">
      {/* Back button */}
      <Link to="/" className="inline-flex items-center space-x-2 text-sm font-semibold text-primary hover:underline">
        <ArrowLeft className="w-4 h-4" />
        <span>돌아가기</span>
      </Link>

      {/* Title & Metadata */}
      <div className="space-y-4 border-b border-surface-container pb-6">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary/10 text-primary uppercase tracking-wider">
            {post.category}
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-on-surface leading-tight">
          {post.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-xs text-on-surface-variant font-medium">
          <span className="flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{formattedDate}</span>
          </span>
          <span className="flex items-center space-x-1">
            <Eye className="w-3.5 h-3.5" />
            <span>조회수 {post.viewCount}</span>
          </span>
        </div>
      </div>

      {/* Main Body Content */}
      <div className="prose prose-stone max-w-none text-on-surface-variant leading-relaxed whitespace-pre-wrap py-4 text-sm sm:text-base">
        {post.body}
      </div>

      {/* Media Attachments Section if they exist */}
      {post.media && post.media.length > 0 && (
        <div className="space-y-4 border-t border-surface-container pt-8">
          <h3 className="text-lg font-display font-bold text-on-surface">첨부 미디어</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {post.media.map((item) => (
              <div key={item.id} className="rounded-2xl overflow-hidden border border-surface-container bg-surface-container/25">
                {item.type.startsWith('image/') ? (
                  <img
                    src={getOptimizedImageUrl(item, 'web_optimized')}
                    alt={item.filename}
                    loading="lazy"
                    className="w-full h-auto object-cover aspect-video"
                  />
                ) : (
                  <div className="p-4 text-xs font-semibold text-primary text-center">
                    파일 첨부: <a href={item.url} target="_blank" className="underline">{item.filename}</a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comment Section Block */}
      <div className="border-t border-surface-container pt-10 space-y-8">
        <h3 className="text-xl font-display font-bold text-on-surface">
          댓글 <span className="text-primary font-extrabold">{commentsQuery.data?.length ?? 0}</span>
        </h3>

        <PendingCommentsBanner postId={postId} onSyncComplete={() => commentsQuery.refetch()} />

        {/* Create Parent Comment Form */}
        <CommentForm
          isSubmitting={createComment.isPending}
          onSubmit={async (body) => {
            await createComment.mutateAsync({ body });
          }}
        />

        {/* Comment Tree List */}
        <CommentList
          comments={commentsQuery.data}
          isLoading={commentsQuery.isLoading}
          isError={commentsQuery.isError}
          isReplying={createComment.isPending}
          onAddReply={async (parentId, body) => {
            await createComment.mutateAsync({ body, parentId });
          }}
        />
      </div>
    </div>
  );
}
