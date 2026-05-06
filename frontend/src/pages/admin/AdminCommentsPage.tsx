import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../lib/adminApi';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, MessageSquare, ArrowLeft, ArrowRight, CornerDownRight } from 'lucide-react';
import AdminTable from '../../components/admin/AdminTable';
import AdminStatusBadge from '../../components/admin/AdminStatusBadge';

export default function AdminCommentsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [replyingId, setReplyingId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyError, setReplyError] = useState<string | null>(null);

  const limit = 10;

  // Fetch comments list
  const { data: commentsData, isLoading } = useQuery({
    queryKey: ['admin', 'comments', { page, limit }],
    queryFn: () => adminApi.getAdminComments({ page, limit }),
  });

  // Toggle comments hide/unhide mutation
  const toggleHideMutation = useMutation({
    mutationFn: ({ id, isHidden }: { id: number; isHidden: boolean }) =>
      adminApi.toggleCommentHide(id, isHidden),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'comments'] });
    },
  });

  // Submit comment reply mutation
  const replyMutation = useMutation({
    mutationFn: ({ id, reply }: { id: number; reply: string }) => adminApi.replyToComment(id, reply),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'comments'] });
      setReplyingId(null);
      setReplyText('');
      setReplyError(null);
    },
    onError: (err: any) => {
      console.error(err);
      setReplyError(err.message || '답글을 저장하는 과정에서 오류가 발생했습니다.');
    },
  });

  const total = (commentsData as any)?.total ?? (commentsData as any)?.pagination?.total ?? 0;
  const totalPages = Math.ceil(total / limit) || 1;

  const handleToggleHide = (id: number, currentHidden: boolean) => {
    toggleHideMutation.mutate({ id, isHidden: !currentHidden });
  };

  const handleReplySubmit = (id: number) => {
    if (!replyText.trim()) return;
    replyMutation.mutate({ id, reply: replyText });
  };

  // Define columns for AdminTable
  const columns = [
    {
      key: 'id',
      header: 'ID',
      cellClassName: 'w-12 font-semibold text-on-surface-variant/80',
    },
    {
      key: 'post',
      header: '게시물',
      render: (row: any) => (
        <div className="max-w-xs truncate">
          <Link
            to={`/posts/${row.postId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-primary hover:underline"
            title={row.post?.title}
          >
            {row.post?.title || `게시물 #${row.postId}`}
          </Link>
        </div>
      ),
      cellClassName: 'w-44',
    },
    {
      key: 'user',
      header: '작성자',
      render: (row: any) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-surface-container text-on-surface-variant text-[10px] font-bold flex items-center justify-center select-none shrink-0">
            {row.user?.nickname?.[0] || 'U'}
          </div>
          <span className="text-xs font-bold text-on-surface truncate max-w-[100px]" title={row.user?.nickname}>
            {row.user?.nickname}
          </span>
        </div>
      ),
      cellClassName: 'w-32',
    },
    {
      key: 'body',
      header: '댓글 내용',
      render: (row: any) => (
        <div className="space-y-1.5 py-1">
          <p className={`text-xs font-medium leading-relaxed ${row.isHidden ? 'text-on-surface-variant/40 line-through italic' : 'text-on-surface'}`}>
            {row.body}
          </p>
          {row.reply && (
            <div className="flex gap-1.5 p-2 rounded-xl bg-surface-container/40 border border-surface-container text-[11px] font-medium text-on-surface-variant leading-relaxed">
              <CornerDownRight className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold text-primary mr-1">관리자 답글:</span>
                <span>{row.reply}</span>
              </div>
            </div>
          )}

          {/* Quick inline reply form drawer */}
          {replyingId === row.id && (
            <div className="space-y-2 pt-2 animate-fade-in">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="댓글에 답변할 내용을 입력해보세요..."
                rows={3}
                className="w-full p-3 bg-white border border-surface-container rounded-2xl text-xs font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition leading-relaxed"
              />
              {replyError && (
                <p className="text-[10px] font-semibold text-red-500">⚠️ {replyError}</p>
              )}
              <div className="flex justify-end gap-1.5">
                <button
                  onClick={() => {
                    setReplyingId(null);
                    setReplyText('');
                    setReplyError(null);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-surface-container text-[10px] font-bold text-on-surface-variant bg-white hover:bg-surface-container transition-all"
                >
                  취소
                </button>
                <button
                  onClick={() => handleReplySubmit(row.id)}
                  disabled={replyMutation.isPending || !replyText.trim()}
                  className="px-3 py-1.5 rounded-lg bg-primary text-white text-[10px] font-bold hover:bg-primary-container hover:text-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {replyMutation.isPending ? '답변 저장 중...' : '답변 등록'}
                </button>
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'isHidden',
      header: '상태',
      render: (row: any) => <AdminStatusBadge status={row.isHidden} type="hidden" />,
      cellClassName: 'w-24',
    },
    {
      key: 'createdAt',
      header: '작성일시',
      render: (row: any) => (
        <span className="text-on-surface-variant text-[11px] font-bold">
          {new Date(row.createdAt).toLocaleDateString('ko-KR')}
        </span>
      ),
      cellClassName: 'w-24',
    },
    {
      key: 'actions',
      header: '제어',
      render: (row: any) => (
        <div className="flex items-center gap-1.5 justify-end">
          {/* Reply button */}
          {replyingId !== row.id && (
            <button
              onClick={() => {
                setReplyText(row.reply || '');
                setReplyError(null);
                setReplyingId(row.id);
              }}
              className="p-1.5 rounded-lg border border-surface-container bg-white text-on-surface-variant hover:text-primary hover:border-primary/30 transition-all"
              title={row.reply ? '답글 수정' : '답글 달기'}
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Toggle hide button */}
          <button
            onClick={() => handleToggleHide(row.id, row.isHidden)}
            className={`p-1.5 rounded-lg border transition-all ${
              row.isHidden
                ? 'border-blue-100 bg-blue-50/50 text-blue-600 hover:bg-blue-50'
                : 'border-surface-container bg-white text-on-surface-variant hover:bg-red-50 hover:text-red-500 hover:border-red-100'
            }`}
            title={row.isHidden ? '숨김 해제 및 공개' : '댓글 숨기기'}
          >
            {row.isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
        </div>
      ),
      cellClassName: 'w-24 text-right',
    },
  ];

  return (
    <div className="space-y-6 font-body animate-fade-in">
      {/* Title block */}
      <div className="border-b border-surface-container pb-5">
        <h1 className="text-3xl font-display font-black text-on-surface">댓글 통합 제어</h1>
        <p className="text-xs text-on-surface-variant font-medium mt-1">
          크록허브 전체 게시물에 게재된 댓글 목록을 확인하고, 신속하게 답글을 작성하거나 스팸/악성 게시물을 숨김처리합니다.
        </p>
      </div>

      {/* AdminTable list */}
      <AdminTable columns={columns} data={commentsData?.data || []} loading={isLoading} emptyMessage="게재된 댓글이 존재하지 않습니다." />

      {/* Pagination component */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4 select-none">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 border border-surface-container bg-white rounded-xl text-on-surface-variant hover:text-primary hover:bg-primary/5 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 text-xs font-bold rounded-xl border transition ${
                page === p
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-white text-on-surface-variant border-surface-container hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 border border-surface-container bg-white rounded-xl text-on-surface-variant hover:text-primary hover:bg-primary/5 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
