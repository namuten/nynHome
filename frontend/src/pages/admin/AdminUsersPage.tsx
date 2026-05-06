import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../lib/adminApi';
import { Trash2, ShieldAlert, ArrowLeft, ArrowRight, UserCheck } from 'lucide-react';
import AdminTable from '../../components/admin/AdminTable';
import AdminStatusBadge from '../../components/admin/AdminStatusBadge';
import AdminConfirmDialog from '../../components/admin/AdminConfirmDialog';

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const limit = 10;

  // Fetch users list
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin', 'users', { page, limit }],
    queryFn: () => adminApi.getAdminUsers({ page, limit }),
  });

  // Force delete user mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteAdminUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setDeleteError(null);
    },
    onError: (err: any) => {
      console.error(err);
      if (err.error === 'CANNOT_DELETE_ADMIN') {
        setDeleteError('어드민 계정은 삭제할 수 없습니다. 안전한 시스템 보호 정책이 적용 중입니다.');
      } else {
        setDeleteError(err.message || '사용자 강제 탈퇴 과정에서 오류가 발생했습니다.');
      }
    },
  });

  const total = (usersData as any)?.total ?? (usersData as any)?.pagination?.total ?? 0;
  const totalPages = Math.ceil(total / limit) || 1;

  const handleDeleteConfirm = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
      setDeleteId(null);
    }
  };

  // Define columns for our beautiful AdminTable
  const columns = [
    {
      key: 'id',
      header: 'ID',
      cellClassName: 'w-16 font-semibold text-on-surface-variant/80',
    },
    {
      key: 'user',
      header: '사용자 정보',
      render: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 text-primary font-black text-xs flex items-center justify-center shadow-inner select-none">
            {row.nickname?.[0] || 'U'}
          </div>
          <div>
            <h4 className="text-xs font-bold text-on-surface">{row.nickname}</h4>
            <p className="text-[10px] text-on-surface-variant font-medium">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: '권한 등급',
      render: (row: any) => <AdminStatusBadge status={row.role} type="role" />,
      cellClassName: 'w-32',
    },
    {
      key: 'createdAt',
      header: '가입일시',
      render: (row: any) => (
        <span className="text-on-surface-variant text-[11px] font-bold">
          {new Date(row.createdAt).toLocaleString('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '제어',
      render: (row: any) => {
        const isAdmin = row.role === 'admin';
        return (
          <div className="flex items-center justify-end">
            {isAdmin ? (
              <span className="text-[10px] font-bold text-primary/60 px-2 py-1 bg-primary/5 rounded-lg border border-primary/10 flex items-center gap-1 select-none">
                <UserCheck className="w-3 h-3" />
                <span>보호됨</span>
              </span>
            ) : (
              <button
                onClick={() => {
                  setDeleteError(null);
                  setDeleteId(row.id);
                }}
                className="p-1.5 rounded-lg border border-surface-container bg-white text-red-500 hover:bg-red-50 hover:border-red-100 transition-all"
                title="강제 탈퇴"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        );
      },
      cellClassName: 'w-24 text-right',
    },
  ];

  return (
    <div className="space-y-6 font-body animate-fade-in">
      {/* Title section */}
      <div className="border-b border-surface-container pb-5">
        <h1 className="text-3xl font-display font-black text-on-surface">사용자 관리</h1>
        <p className="text-xs text-on-surface-variant font-medium mt-1">
          가입된 회원 목록을 조회하고, 커뮤니티 정책 위반 회원의 강제 탈퇴를 제어합니다.
        </p>
      </div>

      {/* Error alert indicator */}
      {deleteError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-xs font-semibold text-red-600 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>권한 거부: {deleteError}</span>
        </div>
      )}

      {/* Table grid listing */}
      <AdminTable columns={columns} data={usersData?.data || []} loading={isLoading} emptyMessage="가입된 사용자가 존재하지 않습니다." />

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

      {/* Force Delete Confirmation Dialogue */}
      <AdminConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="사용자 강제 탈퇴 진행"
        description="이 사용자를 크록허브에서 강제로 탈퇴 처리하시겠습니까? 탈퇴 처리된 계정 정보와 데이터는 완전히 소멸하며, 가입 이메일도 안전하게 격리 복구 불가 상태가 됩니다."
        confirmLabel="강제 탈퇴"
        cancelLabel="취소"
        isDestructive={true}
      />
    </div>
  );
}
