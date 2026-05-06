import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../lib/adminApi';
import { Link } from 'react-router-dom';
import { Plus, Edit3, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';
import AdminTable from '../../components/admin/AdminTable';
import AdminStatusBadge from '../../components/admin/AdminStatusBadge';
import AdminConfirmDialog from '../../components/admin/AdminConfirmDialog';

export default function AdminPostsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<string>('all');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const limit = 10;

  // Fetch posts query
  const { data: postsData, isLoading } = useQuery({
    queryKey: ['admin', 'posts', { category, page, limit }],
    queryFn: () =>
      adminApi.getAdminPosts({
        category: category === 'all' ? undefined : category,
        page,
        limit,
      }),
  });

  // Delete post mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteAdminPost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] });
    },
  });

  const total = (postsData as any)?.total ?? (postsData as any)?.pagination?.total ?? 0;
  const totalPages = Math.ceil(total / limit) || 1;

  const handleDeleteConfirm = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    setPage(1); // Reset to first page upon filter change
  };

  // Reusable columns definition for our generic AdminTable
  const columns = [
    {
      key: 'id',
      header: '번호',
      cellClassName: 'w-16 font-semibold text-on-surface-variant/80',
    },
    {
      key: 'category',
      header: '카테고리',
      render: (row: any) => <AdminStatusBadge status={row.category} type="category" />,
      cellClassName: 'w-32',
    },
    {
      key: 'title',
      header: '제목',
      render: (row: any) => (
        <div className="flex items-center gap-3 max-w-md sm:max-w-lg lg:max-w-xl">
          {row.thumbnailUrl && (
            <img
              src={row.thumbnailUrl}
              alt="Thumbnail"
              className="w-10 h-10 object-cover rounded-lg border border-surface-container shrink-0"
            />
          )}
          <span className="font-bold text-on-surface truncate hover:text-primary transition">
            {row.title}
          </span>
        </div>
      ),
    },
    {
      key: 'isPublished',
      header: '공개상태',
      render: (row: any) => <AdminStatusBadge status={row.isPublished} type="published" />,
      cellClassName: 'w-24',
    },
    {
      key: 'viewCount',
      header: '조회수',
      render: (row: any) => <span className="font-mono font-bold text-on-surface-variant">{row.viewCount}회</span>,
      cellClassName: 'w-20 text-center',
    },
    {
      key: 'createdAt',
      header: '작성일',
      render: (row: any) => (
        <span className="text-on-surface-variant text-[11px] font-bold">
          {new Date(row.createdAt).toLocaleDateString('ko-KR')}
        </span>
      ),
      cellClassName: 'w-28',
    },
    {
      key: 'actions',
      header: '제어',
      render: (row: any) => (
        <div className="flex items-center gap-1.5 justify-end">
          <Link
            to={`/admin/content/${row.id}/edit`}
            className="p-1.5 rounded-lg border border-surface-container bg-white text-on-surface-variant hover:text-primary hover:border-primary/30 transition-all"
            title="수정"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => setDeleteId(row.id)}
            className="p-1.5 rounded-lg border border-surface-container bg-white text-red-500 hover:bg-red-50 hover:border-red-100 transition-all"
            title="삭제"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
      cellClassName: 'w-24 text-right',
    },
  ];

  return (
    <div className="space-y-6 font-body animate-fade-in">
      {/* Title section with Create action button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-surface-container pb-5">
        <div>
          <h1 className="text-3xl font-display font-black text-on-surface">게시물 관리</h1>
          <p className="text-xs text-on-surface-variant font-medium mt-1">
            크록허브의 피드 콘텐츠를 발행하고 관리합니다.
          </p>
        </div>
        <Link
          to="/admin/content/new"
          className="flex items-center gap-1.5 px-5 py-3 bg-primary hover:bg-primary-container hover:text-primary text-white text-xs font-bold rounded-xl transition-all duration-300 shadow-md shadow-primary/10 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>새 게시물 작성</span>
        </Link>
      </div>

      {/* Filter Tabs block */}
      <div className="flex flex-wrap gap-2.5">
        {[
          { key: 'all', label: '전체 피드' },
          { key: 'creative', label: '창작물 (Creative)' },
          { key: 'blog', label: '블로그 (Blog)' },
          { key: 'study', label: '학습기록 (Study)' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleCategoryChange(tab.key)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition border select-none ${
              category === tab.key
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-white text-on-surface-variant border-surface-container hover:bg-surface-container hover:text-on-surface'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table listing */}
      <AdminTable columns={columns} data={postsData?.data || []} loading={isLoading} emptyMessage="조회 조건에 만족하는 게시물이 없습니다." />

      {/* Pagination Controls */}
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

      {/* Delete Confirmation Modal Dialog */}
      <AdminConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="게시물 삭제 확인"
        description="이 게시물을 정말로 삭제하시겠습니까? 삭제된 게시물은 복구할 수 없으며, 포함된 댓글들도 영구 삭제됩니다."
        confirmLabel="게시물 삭제"
        cancelLabel="취소"
        isDestructive={true}
      />
    </div>
  );
}
