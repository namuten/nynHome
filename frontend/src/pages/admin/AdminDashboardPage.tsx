import { useAdminDashboard } from '../../hooks/useAdminDashboard';
import DashboardMetricGrid from '../../components/admin/DashboardMetricGrid';
import { Image as ImageIcon, Users, Clock, ArrowRight, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminStatusBadge from '../../components/admin/AdminStatusBadge';
import { getOptimizedImageUrl } from '../../lib/media';

/**
 * AdminDashboardPage - 어드민 통합 대시보드 페이지
 * 단일 API(GET /api/admin/dashboard)를 활용하여 일체형으로 운영 지표 및 활동 내역을 조망합니다.
 */
export default function AdminDashboardPage() {
  const { data, isLoading, error } = useAdminDashboard();

  const metrics = data?.metrics;
  const recentPosts = data?.recentPosts || [];
  const recentUsers = data?.recentUsers || [];
  const recentMedia = data?.recentMedia || [];
  const recentComments = data?.recentComments || [];

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl">
        <h3 className="font-bold text-sm">대시보드 데이터를 로드하는 도중 오류가 발생했습니다.</h3>
        <p className="text-xs mt-1">서버 연결 상태나 어드민 권한 여부를 확인해 주세요.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-body animate-fade-in">
      {/* 타이틀 헤더 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-black text-on-surface tracking-tight">대시보드</h1>
          <p className="text-xs text-on-surface-variant font-medium mt-1">
            크록허브의 주요 지표와 콘텐츠 현황을 실시간으로 일괄 조회합니다.
          </p>
        </div>
      </div>

      {/* 6대 핵심 메트릭 그리드 */}
      <DashboardMetricGrid metrics={metrics} isLoading={isLoading} />

      {/* 활동 현황 섹션 (최근 게시물, 신규 사용자, 최근 댓글) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 1. 최근 등록 게시물 */}
        <div className="p-6 bg-white rounded-3xl border border-surface-container shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-surface-container pb-4">
              <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span>최근 등록 게시물</span>
              </h3>
              <Link
                to="/admin/content"
                className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
              >
                <span>전체 관리</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {isLoading ? (
              <div className="space-y-3 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 bg-surface-container/50 rounded-xl" />
                ))}
              </div>
            ) : recentPosts.length === 0 ? (
              <p className="text-xs text-on-surface-variant text-center py-6">등록된 게시물이 없습니다.</p>
            ) : (
              <div className="divide-y divide-surface-container/50">
                {recentPosts.map((post) => (
                  <div key={post.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0 gap-4">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-on-surface truncate hover:text-primary transition">
                        {post.title}
                      </h4>
                      <p className="text-[10px] text-on-surface-variant mt-0.5">
                        {new Date(post.createdAt).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <AdminStatusBadge status={post.category} type="category" />
                      <AdminStatusBadge status={post.isPublished} type="published" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 2. 최근 댓글 현황 */}
        <div className="p-6 bg-white rounded-3xl border border-surface-container shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-surface-container pb-4">
              <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-600" />
                <span>최근 등록 댓글</span>
              </h3>
              <Link
                to="/admin/comments"
                className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
              >
                <span>전체 관리</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {isLoading ? (
              <div className="space-y-3 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 bg-surface-container/50 rounded-xl" />
                ))}
              </div>
            ) : recentComments.length === 0 ? (
              <p className="text-xs text-on-surface-variant text-center py-6">새로운 댓글이 없습니다.</p>
            ) : (
              <div className="divide-y divide-surface-container/50">
                {recentComments.map((comment) => (
                  <div key={comment.id} className="py-3 flex flex-col first:pt-0 last:pb-0 gap-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-on-surface-variant truncate">
                        {comment.author?.nickname || '방문자'}
                      </span>
                      <span className="text-[9px] text-on-surface-variant shrink-0">
                        {new Date(comment.createdAt).toLocaleDateString('ko-KR', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface line-clamp-1 font-medium bg-surface-container/20 px-2 py-1 rounded-lg">
                      {comment.body}
                    </p>
                    <div className="flex items-center justify-between text-[9px] text-primary">
                      <span className="truncate max-w-[150px] font-bold">@ {comment.postTitle}</span>
                      {comment.reply ? (
                        <span className="bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-md font-bold">답변 완료</span>
                      ) : (
                        <span className="bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-md font-bold">미답변</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 3. 신규 가입 사용자 */}
        <div className="p-6 bg-white rounded-3xl border border-surface-container shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-surface-container pb-4">
              <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>신규 가입 사용자</span>
              </h3>
              <Link
                to="/admin/users"
                className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
              >
                <span>전체 관리</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {isLoading ? (
              <div className="space-y-3 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 bg-surface-container/50 rounded-xl" />
                ))}
              </div>
            ) : recentUsers.length === 0 ? (
              <p className="text-xs text-on-surface-variant text-center py-6">신규 가입자가 없습니다.</p>
            ) : (
              <div className="divide-y divide-surface-container/50">
                {recentUsers.map((user) => (
                  <div key={user.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0 gap-4">
                    <div className="min-w-0 flex-1 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-xs font-black text-on-surface-variant select-none">
                        {user.nickname?.[0] || 'U'}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-on-surface truncate">{user.nickname}</h4>
                        <p className="text-[10px] text-on-surface-variant truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="shrink-0">
                      <AdminStatusBadge status={user.role} type="role" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 최근 라이브러리 이미지 */}
      <div className="p-6 bg-white rounded-3xl border border-surface-container shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-surface-container pb-4">
          <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-emerald-600" />
            <span>최근 라이브러리 이미지</span>
          </h3>
          <Link
            to="/admin/media"
            className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
          >
            <span>라이브러리 가기</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-video bg-surface-container/50 rounded-2xl" />
            ))}
          </div>
        ) : recentMedia.length === 0 ? (
          <p className="text-xs text-on-surface-variant text-center py-6">등록된 미디어가 없습니다.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {recentMedia.map((media) => {
              const isImage = media.fileCategory === 'image' || media.mimeType.startsWith('image/');
              return (
                <div key={media.id} className="relative aspect-video rounded-2xl border border-surface-container bg-surface-container/10 overflow-hidden group">
                  {isImage ? (
                    <img
                      src={getOptimizedImageUrl(media, 'thumb_medium')}
                      alt={media.fileName}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center text-on-surface-variant">
                      <span className="text-2xl">📁</span>
                      <span className="text-[9px] font-bold truncate max-w-full mt-1 px-1">{media.fileName}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-2">
                    <span className="text-[9px] text-white truncate max-w-full font-bold">
                      {media.fileName}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
