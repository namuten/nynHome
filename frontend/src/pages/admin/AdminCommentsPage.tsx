import { useState } from 'react';
import { useAdminComments } from '../../hooks/useAdminComments';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, MessageSquare, ArrowLeft, ArrowRight, CornerDownRight, Search, SlidersHorizontal, MessageCircle } from 'lucide-react';
import AdminTable from '../../components/admin/AdminTable';
import AdminStatusBadge from '../../components/admin/AdminStatusBadge';

/**
 * AdminCommentsPage - 어드민 댓글 목록 및 고도화 필터 관리 화면
 * 실시간 검색, 노출 상태별 필터링, 게시글 아이디 필터 및 즉각적인 숨김 제어/인라인 답글 기능을 지원합니다.
 */
export default function AdminCommentsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<'all' | 'visible' | 'hidden'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [postIdFilter, setPostIdFilter] = useState<string>('');
  
  const [replyingId, setReplyingId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyError, setReplyError] = useState<string | null>(null);

  const limit = 10;

  // 필터 파라미터 빌드
  const filterParams = {
    page,
    limit,
    status,
    q: searchQuery.trim() || undefined,
    postId: postIdFilter.trim() ? parseInt(postIdFilter) : undefined,
  };

  // 커스텀 훅 호출
  const { commentsQuery, toggleHideMutation, replyMutation } = useAdminComments(filterParams);
  const { data: commentsData, isLoading, error } = commentsQuery;

  const totalPages = commentsData?.pagination?.totalPages ?? 1;

  // 필터 변경 시 첫 페이지로 이동
  const handleStatusChange = (newStatus: 'all' | 'visible' | 'hidden') => {
    setStatus(newStatus);
    setPage(1);
  };

  const handlePostIdChange = (val: string) => {
    setPostIdFilter(val);
    setPage(1);
  };

  // 댓글 숨김/해제 제어
  const handleToggleHide = (id: number, currentHidden: boolean) => {
    toggleHideMutation.mutate({ id, isHidden: !currentHidden });
  };

  // 관리자 답글 전송
  const handleReplySubmit = (id: number) => {
    if (!replyText.trim()) return;
    replyMutation.mutate(
      { id, reply: replyText },
      {
        onSuccess: () => {
          setReplyingId(null);
          setReplyText('');
          setReplyError(null);
        },
        onError: (err: any) => {
          console.error(err);
          setReplyError(err.message || '답글을 저장하는 과정에서 오류가 발생했습니다.');
        },
      }
    );
  };

  // 컬럼 컬렉션 정의
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
            to={`/post/${row.postId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-primary hover:underline transition"
            title={row.postTitle}
          >
            {row.postTitle || `게시물 #${row.postId}`}
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
          <div className="w-6 h-6 rounded-md bg-surface-container text-on-surface-variant text-[10px] font-bold flex items-center justify-center select-none shrink-0 border border-surface-container-high">
            {row.author?.nickname?.[0] || 'U'}
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-on-surface block truncate max-w-[110px]" title={row.author?.nickname}>
              {row.author?.nickname || '비회원'}
            </span>
            {row.author?.email && (
              <span className="text-[9px] text-on-surface-variant block truncate max-w-[110px]" title={row.author?.email}>
                {row.author?.email}
              </span>
            )}
          </div>
        </div>
      ),
      cellClassName: 'w-36',
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
            <div className="flex gap-1.5 p-2 rounded-xl bg-surface-container/30 border border-surface-container text-[11px] font-medium text-on-surface-variant leading-relaxed">
              <CornerDownRight className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold text-primary mr-1">관리자 답글:</span>
                <span>{row.reply}</span>
              </div>
            </div>
          )}

          {/* 인라인 답변 에디터 양식 */}
          {replyingId === row.id && (
            <div className="space-y-2 pt-2 animate-fade-in">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="답글 내용을 작성하세요..."
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
                  className="px-3 py-1.5 rounded-lg border border-surface-container text-[10px] font-bold text-on-surface-variant bg-white hover:bg-surface-container transition"
                >
                  취소
                </button>
                <button
                  onClick={() => handleReplySubmit(row.id)}
                  disabled={replyMutation.isPending || !replyText.trim()}
                  className="px-3 py-1.5 rounded-lg bg-primary text-white text-[10px] font-bold hover:bg-primary-container hover:text-primary transition disabled:opacity-50"
                >
                  {replyMutation.isPending ? '저장 중...' : '답글 등록'}
                </button>
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'isHidden',
      header: '노출 상태',
      render: (row: any) => <AdminStatusBadge status={row.isHidden} type="hidden" />,
      cellClassName: 'w-24',
    },
    {
      key: 'createdAt',
      header: '작성일',
      render: (row: any) => (
        <span className="text-on-surface-variant text-[11px] font-bold">
          {new Date(row.createdAt).toLocaleDateString('ko-KR')}
        </span>
      ),
      cellClassName: 'w-24',
    },
    {
      key: 'actions',
      header: '운영 제어',
      render: (row: any) => (
        <div className="flex items-center gap-1.5 justify-end">
          {/* 답글 토글 버튼 */}
          {replyingId !== row.id && (
            <button
              onClick={() => {
                setReplyText(row.reply || '');
                setReplyError(null);
                setReplyingId(row.id);
              }}
              className="p-1.5 rounded-lg border border-surface-container bg-white text-on-surface-variant hover:text-primary hover:border-primary/30 transition-all shadow-sm"
              title={row.reply ? '답글 수정' : '답글 작성'}
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </button>
          )}

          {/* 노출 상태 즉각 반전(숨김/해제) 제어 */}
          <button
            onClick={() => handleToggleHide(row.id, row.isHidden)}
            className={`p-1.5 rounded-lg border transition-all shadow-sm ${
              row.isHidden
                ? 'border-blue-100 bg-blue-50/70 text-blue-600 hover:bg-blue-100'
                : 'border-surface-container bg-white text-on-surface-variant hover:bg-red-50 hover:text-red-500 hover:border-red-100'
            }`}
            title={row.isHidden ? '숨김 해제 및 사이트 공개' : '댓글 숨김 처리'}
          >
            {row.isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
        </div>
      ),
      cellClassName: 'w-24 text-right',
    },
  ];

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl">
        <h3 className="font-bold text-sm">댓글 데이터를 로딩하는 중 오류가 발생했습니다.</h3>
        <p className="text-xs mt-1">네트워크 상태를 점검하거나 서버 로그를 확인하세요.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-body animate-fade-in">
      {/* 상단 제목 바 */}
      <div className="border-b border-surface-container pb-5">
        <h1 className="text-3xl font-display font-black text-on-surface tracking-tight flex items-center gap-2">
          <MessageCircle className="w-8 h-8 text-primary" />
          댓글 통합 제어
        </h1>
        <p className="text-xs text-on-surface-variant font-medium mt-1">
          크록허브의 모든 댓글을 한눈에 조회하고, 필터링 및 악성 광고/스팸 필터링, 신속한 답글 소통을 지원합니다.
        </p>
      </div>

      {/* 필터 제어 대시보드 바 */}
      <div className="p-4 bg-white rounded-3xl border border-surface-container shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* 노출 여부 필터 배지 그룹 */}
          <div className="flex items-center bg-surface-container/40 p-1.5 rounded-2xl border border-surface-container/50 text-xs">
            <button
              onClick={() => handleStatusChange('all')}
              className={`px-3 py-1 rounded-xl font-bold transition ${
                status === 'all'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => handleStatusChange('visible')}
              className={`px-3 py-1 rounded-xl font-bold transition ${
                status === 'visible'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              공개 중
            </button>
            <button
              onClick={() => handleStatusChange('hidden')}
              className={`px-3 py-1 rounded-xl font-bold transition ${
                status === 'hidden'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              숨겨짐
            </button>
          </div>

          {/* 게시글 ID 세부 검색 필터 */}
          <div className="relative flex items-center gap-2 text-xs font-semibold text-on-surface-variant">
            <SlidersHorizontal className="w-3.5 h-3.5 text-on-surface-variant/70" />
            <input
              type="number"
              placeholder="게시글 ID 필터..."
              value={postIdFilter}
              onChange={(e) => handlePostIdChange(e.target.value)}
              className="w-28 px-3 py-2 bg-surface-container/30 border border-surface-container rounded-xl focus:outline-none focus:border-primary transition font-bold"
            />
          </div>
        </div>

        {/* 텍스트 내용 키워드 검색 인풋 */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="댓글 본문 및 답변 내용 검색..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2.5 bg-surface-container/30 border border-surface-container rounded-2xl text-xs font-semibold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition"
          />
          <Search className="w-4 h-4 text-on-surface-variant/60 absolute left-3.5 top-3" />
        </div>
      </div>

      {/* 댓글 관리 그리드 및 테이블 */}
      <AdminTable
        columns={columns}
        data={commentsData?.data || []}
        loading={isLoading}
        emptyMessage="설정된 필터 및 검색어 조건에 부합하는 댓글 목록이 존재하지 않습니다."
      />

      {/* 페이지네이션 인터랙션 바 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4 select-none">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 border border-surface-container bg-white rounded-xl text-on-surface-variant hover:text-primary hover:bg-primary/5 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 text-xs font-bold rounded-xl border transition shadow-sm ${
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
            className="p-2 border border-surface-container bg-white rounded-xl text-on-surface-variant hover:text-primary hover:bg-primary/5 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
