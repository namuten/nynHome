import AdminStatCard from './AdminStatCard';
import { FileText, Image as ImageIcon, Users, MessageSquare, Calendar, Bell } from 'lucide-react';
import type { AdminDashboardMetrics } from '../../types/admin';

interface DashboardMetricGridProps {
  metrics?: AdminDashboardMetrics;
  isLoading: boolean;
}

/**
 * DashboardMetricGrid - 어드민 대시보드 통계 카드 그리드
 * 총 6개의 핵심 운영 통계 지표를 시각적 프리미엄 카드 형태로 노출합니다.
 */
export default function DashboardMetricGrid({ metrics, isLoading }: DashboardMetricGridProps) {
  // 로딩 상태 기본값 처리
  const safeMetrics = metrics || {
    postsTotal: 0,
    publishedPosts: 0,
    draftPosts: 0,
    mediaTotal: 0,
    usersTotal: 0,
    commentsTotal: 0,
    hiddenComments: 0,
    schedulesThisMonth: 0,
    pushSubscriptions: 0,
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* 1. 총 게시물 */}
      <AdminStatCard
        title="총 게시물"
        value={isLoading ? '...' : safeMetrics.postsTotal}
        description={isLoading ? '' : `공개: ${safeMetrics.publishedPosts} / 임시: ${safeMetrics.draftPosts}`}
        icon={FileText}
        gradient="from-purple-500/5 to-pink-500/5"
        iconBg="bg-primary/10"
        iconColor="text-primary"
      />

      {/* 2. 총 미디어 파일 */}
      <AdminStatCard
        title="미디어 라이브러리"
        value={isLoading ? '...' : safeMetrics.mediaTotal}
        description={isLoading ? '' : '업로드 파일 합산'}
        icon={ImageIcon}
        gradient="from-emerald-500/5 to-teal-500/5"
        iconBg="bg-emerald-500/10"
        iconColor="text-emerald-600"
      />

      {/* 3. 총 가입 회원 */}
      <AdminStatCard
        title="가입 사용자"
        value={isLoading ? '...' : safeMetrics.usersTotal}
        description={isLoading ? '' : '크록허브 등록 회원수'}
        icon={Users}
        gradient="from-blue-500/5 to-cyan-500/5"
        iconBg="bg-blue-500/10"
        iconColor="text-blue-600"
      />

      {/* 4. 총 댓글 관리 */}
      <AdminStatCard
        title="댓글수"
        value={isLoading ? '...' : safeMetrics.commentsTotal}
        description={isLoading ? '' : `숨김 댓글: ${safeMetrics.hiddenComments}개`}
        icon={MessageSquare}
        gradient="from-amber-500/5 to-orange-500/5"
        iconBg="bg-amber-500/10"
        iconColor="text-amber-600"
      />

      {/* 5. 이번 달 일정 */}
      <AdminStatCard
        title="이번 달 일정"
        value={isLoading ? '...' : safeMetrics.schedulesThisMonth}
        description={isLoading ? '' : '이번 달 캘린더 등록 이벤트'}
        icon={Calendar}
        gradient="from-indigo-500/5 to-violet-500/5"
        iconBg="bg-indigo-500/10"
        iconColor="text-indigo-600"
      />

      {/* 6. 푸시 알림 구독 */}
      <AdminStatCard
        title="푸시 알림 구독"
        value={isLoading ? '...' : safeMetrics.pushSubscriptions}
        description={isLoading ? '' : '브라우저 푸시 수신 허용 사용자'}
        icon={Bell}
        gradient="from-red-500/5 to-rose-500/5"
        iconBg="bg-red-500/10"
        iconColor="text-rose-600"
      />
    </div>
  );
}
