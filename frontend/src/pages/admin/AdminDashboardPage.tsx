import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../lib/adminApi';
import AdminStatCard from '../../components/admin/AdminStatCard';
import { FileText, Image as ImageIcon, Users, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminStatusBadge from '../../components/admin/AdminStatusBadge';

export default function AdminDashboardPage() {
  // Fetch lists in parallel to calculate counts and show previews
  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['admin', 'posts', { limit: 5 }],
    queryFn: () => adminApi.getAdminPosts({ limit: 5 }),
  });

  const { data: mediaData, isLoading: mediaLoading } = useQuery({
    queryKey: ['admin', 'media'],
    queryFn: () => adminApi.getAdminMedia(),
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin', 'users', { limit: 5 }],
    queryFn: () => adminApi.getAdminUsers({ limit: 5 }),
  });

  const isLoading = postsLoading || mediaLoading || usersLoading;

  // Safe extraction of total counts (supporting both root total and nested pagination)
  const totalPosts = (postsData as any)?.total ?? (postsData as any)?.pagination?.total ?? 0;
  const totalMedia = mediaData?.length ?? 0;
  const totalUsers = (usersData as any)?.total ?? (usersData as any)?.pagination?.total ?? 0;

  const recentPosts = postsData?.data?.slice(0, 5) || [];
  const recentUsers = usersData?.data?.slice(0, 5) || [];
  const recentMedia = mediaData?.slice(0, 4) || [];

  return (
    <div className="space-y-8 font-body animate-fade-in">
      {/* Title block */}
      <div>
        <h1 className="text-3xl font-display font-black text-on-surface">대시보드</h1>
        <p className="text-xs text-on-surface-variant font-medium mt-1">
          크록허브의 주요 지표와 콘텐츠 현황을 한눈에 조망합니다.
        </p>
      </div>

      {/* Grid Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AdminStatCard
          title="총 게시물"
          value={isLoading ? '...' : totalPosts}
          description="기록, 학습, 창작물 합산"
          icon={FileText}
          gradient="from-purple-500/5 to-pink-500/5"
          iconBg="bg-primary/10"
          iconColor="text-primary"
        />
        <AdminStatCard
          title="총 미디어 파일"
          value={isLoading ? '...' : totalMedia}
          description="라이브러리 업로드 파일"
          icon={ImageIcon}
          gradient="from-emerald-500/5 to-teal-500/5"
          iconBg="bg-emerald-500/10"
          iconColor="text-emerald-600"
        />
        <AdminStatCard
          title="가입 사용자"
          value={isLoading ? '...' : totalUsers}
          description="크록허브 가입 회원 명수"
          icon={Users}
          gradient="from-blue-500/5 to-cyan-500/5"
          iconBg="bg-blue-500/10"
          iconColor="text-blue-600"
        />
      </div>

      {/* Overview Lists Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Posts Card */}
        <div className="p-6 bg-white rounded-3xl border border-surface-container shadow-sm space-y-4">
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

        {/* Recent Registered Users */}
        <div className="p-6 bg-white rounded-3xl border border-surface-container shadow-sm space-y-4">
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

      {/* Recent Media Gallery block */}
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
                      src={media.fileUrl}
                      alt={media.fileName}
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
