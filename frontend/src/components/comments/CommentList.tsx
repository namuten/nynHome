import { useState } from 'react';
import type { CommentItem } from '../../types/api';
import CommentForm from './CommentForm';
import { CornerDownRight, Flag } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import ReportDialog from '../safety/ReportDialog';

interface CommentListProps {
  comments: CommentItem[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onAddReply: (parentId: number, body: string) => Promise<void>;
  isReplying: boolean;
}

export default function CommentList({
  comments,
  isLoading,
  isError,
  onAddReply,
  isReplying,
}: CommentListProps) {
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
  const [reportCommentId, setReportCommentId] = useState<number | null>(null);
  const { isAuthenticated } = useAuth();

  const formatCommentDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2].map((i) => (
          <div key={i} className="h-16 bg-surface-container rounded-2xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 rounded-2xl bg-red-50 text-red-600 text-xs font-body border border-red-100 text-center">
        댓글을 불러오는 도중 에러가 발생했습니다.
      </div>
    );
  }

  if (!comments || comments.length === 0) {
    return (
      <div className="py-10 text-center text-sm font-body text-on-surface-variant">
        첫 번째 댓글의 주인공이 되어보세요!
      </div>
    );
  }

  return (
    <div className="space-y-6 font-body">
      {comments.map((comment) => (
        <div key={comment.id} className="space-y-3">
          {/* Main parent comment */}
          <div className="p-4 rounded-3xl bg-white border border-surface-container shadow-sm space-y-2 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-bold ${comment.isAdminReply ? 'text-primary' : 'text-on-surface'}`}>
                  {comment.nickname}
                </span>
                {comment.isAdminReply && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase font-display">
                    Admin
                  </span>
                )}
              </div>
              <span className="text-[11px] text-on-surface-variant">
                {formatCommentDate(comment.createdAt)}
              </span>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap pl-1">
              {comment.body}
            </p>
            <div className="flex items-center justify-end pt-1 gap-3">
              {isAuthenticated && (
                <button
                  onClick={() => setReportCommentId(comment.id)}
                  className="flex items-center gap-1 text-[11px] font-medium text-on-surface-variant hover:text-red-500 transition-colors"
                >
                  <Flag className="w-3 h-3" />
                  <span>신고</span>
                </button>
              )}
              <button
                onClick={() => setActiveReplyId(activeReplyId === comment.id ? null : comment.id)}
                className="text-xs font-semibold text-primary hover:underline transition duration-200"
              >
                답글 달기
              </button>
            </div>
          </div>

          {/* Render replies */}
          {comment.replies && comment.replies.map((reply) => (
            <div key={reply.id} className="flex space-x-3 pl-6 sm:pl-10">
              <CornerDownRight className="w-5 h-5 text-on-surface-variant opacity-40 shrink-0 mt-3" />
              <div className="p-4 rounded-3xl bg-surface-container/30 border border-surface-container/50 shadow-inner space-y-2 flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-bold ${reply.isAdminReply ? 'text-primary' : 'text-on-surface'}`}>
                      {reply.nickname}
                    </span>
                    {reply.isAdminReply && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase font-display">
                        Admin
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-on-surface-variant">
                    {formatCommentDate(reply.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                  {reply.body}
                </p>
                {isAuthenticated && (
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => setReportCommentId(reply.id)}
                      className="flex items-center gap-1 text-[11px] font-medium text-on-surface-variant hover:text-red-500 transition-colors"
                    >
                      <Flag className="w-3 h-3" />
                      <span>신고</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Active Reply Editor form */}
          {activeReplyId === comment.id && (
            <div className="pl-6 sm:pl-10">
              <div className="p-4 rounded-3xl bg-surface-container/10 border border-dashed border-surface-container">
                <CommentForm
                  placeholder={`${comment.nickname}님에게 답글 달기...`}
                  isSubmitting={isReplying}
                  onSubmit={async (body) => {
                    await onAddReply(comment.id, body);
                    setActiveReplyId(null);
                  }}
                />
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Report Dialog */}
      <ReportDialog
        isOpen={reportCommentId !== null}
        commentId={reportCommentId!}
        onClose={() => setReportCommentId(null)}
      />
    </div>
  );
}
