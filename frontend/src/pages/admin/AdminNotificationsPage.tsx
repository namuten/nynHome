import React, { useState, useEffect } from 'react';
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
  useNotifications,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
} from '../../hooks/useNotifications';
import { Bell, Save, Mail, CheckCircle2, ShieldAlert, Loader2, Trash2 } from 'lucide-react';

export const AdminNotificationsPage: React.FC = () => {
  const { data: pref, isLoading: isPrefLoading, isError: isPrefError } = useNotificationPreferences();
  const updatePref = useUpdateNotificationPreferences();

  // 최근 알림 조회 (페이지네이션 포함)
  const [page, setPage] = useState(1);
  const { data: notifsData, isLoading: isNotifsLoading } = useNotifications(page, 10);
  const markAllRead = useMarkAllNotificationsAsRead();
  const deleteNotif = useDeleteNotification();

  // 설정 폼 로컬 상태
  const [onNewComment, setOnNewComment] = useState(true);
  const [onNewGuestbook, setOnNewGuestbook] = useState(true);
  const [onReportFlagged, setOnReportFlagged] = useState(true);
  const [emailDigestFreq, setEmailDigestFreq] = useState<'never' | 'daily' | 'weekly'>('weekly');
  const [emailAddress, setEmailAddress] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // 폼 초기값 주입
  useEffect(() => {
    if (pref) {
      setOnNewComment(pref.onNewComment);
      setOnNewGuestbook(pref.onNewGuestbook);
      setOnReportFlagged(pref.onReportFlagged);
      setEmailDigestFreq(pref.emailDigestFreq);
      setEmailAddress(pref.emailAddress || '');
    }
  }, [pref]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    // 이메일 밸리데이션
    if (emailDigestFreq !== 'never' && emailAddress) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailAddress)) {
        setErrorMsg('유효한 이메일 주소를 입력해주세요.');
        return;
      }
    }

    try {
      await updatePref.mutateAsync({
        onNewComment,
        onNewGuestbook,
        onReportFlagged,
        emailDigestFreq,
        emailAddress: emailAddress || null,
      });
      setSuccessMsg('알림 수신 설정이 안전하게 업데이트되었습니다! 🌟');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || '설정 저장 중 알 수 없는 에러가 발생했습니다.');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead.mutateAsync();
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const handleDeleteNotif = async (id: number) => {
    try {
      await deleteNotif.mutateAsync(id);
    } catch (err) {
      console.error('Failed to delete notification', err);
    }
  };

  if (isPrefLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-zinc-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
        <span className="text-sm">서버 데이터베이스로부터 설정을 긁어오고 있습니다...</span>
      </div>
    );
  }

  if (isPrefError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-red-400 gap-3">
        <ShieldAlert className="w-10 h-10" />
        <span className="text-sm font-semibold">데이터 연동 실패 — 잠시 후 다시 시도해 주세요.</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 px-2">
      {/* 타이틀 헤더 배너 */}
      <div className="relative overflow-hidden bg-gradient-to-r from-violet-950/40 via-fuchsia-950/20 to-zinc-950 p-6 rounded-2xl border border-violet-500/20 shadow-lg text-left">
        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-3">
          <div className="p-3 bg-violet-500/10 rounded-xl border border-violet-500/20">
            <Bell className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-zinc-100 tracking-tight">알림 제어 콕핏</h1>
            <p className="text-xs text-zinc-400 mt-1">인앱 알림 모니터링 및 주기적 이메일 다이제스트 설정을 구성합니다.</p>
          </div>
        </div>
      </div>

      {/* 성공/실패 토스트 */}
      {successMsg && (
        <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs text-left animate-pulse">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-left">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* 왼쪽 폼: 수신 설정 제어 (3/5 분량) */}
        <div className="md:col-span-3 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-sm text-left">
          <h2 className="text-base font-bold text-zinc-200 mb-5 flex items-center gap-1.5">
            ⚙️ 알림 세부 트리거 매핑
          </h2>

          <form onSubmit={handleSave} className="space-y-6">
            {/* 1. 실시간 토글 그룹 */}
            <div className="space-y-4">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">실시간 알림 트리거</label>

              {/* 신규 댓글 */}
              <div className="flex items-center justify-between p-3 bg-zinc-950/40 border border-zinc-900 rounded-xl">
                <div>
                  <h4 className="text-xs font-semibold text-zinc-200">신규 댓글 등록</h4>
                  <p className="text-[10px] text-zinc-500 mt-0.5">내 포트폴리오 글에 댓글이 추가되면 알림 수신</p>
                </div>
                <input
                  type="checkbox"
                  checked={onNewComment}
                  onChange={(e) => setOnNewComment(e.target.checked)}
                  className="w-4 h-4 text-violet-600 bg-zinc-900 border-zinc-700 rounded focus:ring-violet-500 focus:ring-2"
                />
              </div>

              {/* 신규 방명록 */}
              <div className="flex items-center justify-between p-3 bg-zinc-950/40 border border-zinc-900 rounded-xl">
                <div>
                  <h4 className="text-xs font-semibold text-zinc-200">신규 방명록 등록</h4>
                  <p className="text-[10px] text-zinc-500 mt-0.5">공개 방명록 게시판에 새 감사글이 추가되면 알림 수신</p>
                </div>
                <input
                  type="checkbox"
                  checked={onNewGuestbook}
                  onChange={(e) => setOnNewGuestbook(e.target.checked)}
                  className="w-4 h-4 text-violet-600 bg-zinc-900 border-zinc-700 rounded focus:ring-violet-500 focus:ring-2"
                />
              </div>

              {/* 신고 탐지 */}
              <div className="flex items-center justify-between p-3 bg-zinc-950/40 border border-zinc-900 rounded-xl">
                <div>
                  <h4 className="text-xs font-semibold text-zinc-200">신고 접수 및 조치 완료</h4>
                  <p className="text-[10px] text-zinc-500 mt-0.5">신고가 수집되었거나 해결되었을 때 알림 수신</p>
                </div>
                <input
                  type="checkbox"
                  checked={onReportFlagged}
                  onChange={(e) => setOnReportFlagged(e.target.checked)}
                  className="w-4 h-4 text-violet-600 bg-zinc-900 border-zinc-700 rounded focus:ring-violet-500 focus:ring-2"
                />
              </div>
            </div>

            {/* 2. 이메일 수신 간격 설정 */}
            <div className="space-y-4 border-t border-zinc-800/80 pt-5">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">📫 SMTP 이메일 다이제스트</label>

              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">이메일 발송 주기</label>
                <select
                  value={emailDigestFreq}
                  onChange={(e) => setEmailDigestFreq(e.target.value as any)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
                >
                  <option value="never">받지 않음 (인앱 알림만)</option>
                  <option value="daily">매일 (하루 1회 종합 보고)</option>
                  <option value="weekly">매주 (주간 종합 보고)</option>
                </select>
              </div>

              {emailDigestFreq !== 'never' && (
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">이메일 수신 주소</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                    <input
                      type="email"
                      required
                      placeholder="admin@crochub.dev"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-200 focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 제출 버튼 */}
            <button
              type="submit"
              disabled={updatePref.isPending}
              className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-violet-950/20"
            >
              {updatePref.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              수정 사항 안전하게 저장
            </button>
          </form>
        </div>

        {/* 오른쪽 영역: 실시간 알림 콘솔 히스토리 (2/5 분량) */}
        <div className="md:col-span-2 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 backdrop-blur-sm flex flex-col text-left">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-zinc-200 flex items-center gap-1.5">
              📜 알림 로그
            </h2>
            {notifsData?.items && notifsData.items.filter(n => !n.isRead).length > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={markAllRead.isPending}
                className="text-[10px] font-bold text-violet-400 hover:text-violet-300 transition-colors"
              >
                일괄 읽음
              </button>
            )}
          </div>

          {/* 알림 기록들 리스트 */}
          <div className="flex-1 overflow-y-auto space-y-2 max-h-[420px] pr-1 scrollbar-thin">
            {isNotifsLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-5 h-5 animate-spin text-zinc-600" />
              </div>
            ) : !notifsData?.items || notifsData.items.length === 0 ? (
              <div className="text-center py-12 text-zinc-600 text-xs">
                남아있는 인앱 알림이 없습니다.
              </div>
            ) : (
              notifsData.items.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3 rounded-xl border text-xs relative ${
                    notif.isRead
                      ? 'bg-zinc-950/20 border-zinc-900/40 text-zinc-500'
                      : 'bg-zinc-950/60 border-zinc-800 text-zinc-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-bold ${notif.isRead ? 'text-zinc-600' : 'text-zinc-300'}`}>
                      {notif.title}
                    </span>
                    <button
                      onClick={() => handleDeleteNotif(notif.id)}
                      className="text-zinc-600 hover:text-red-400 transition-colors p-0.5 rounded"
                      title="지우기"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="mt-1 leading-relaxed text-[11px]">{notif.body}</p>
                  <span className="text-[9px] text-zinc-600 mt-2 block">
                    {new Date(notif.createdAt).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* 간이 페이지 제어 */}
          {notifsData && notifsData.total > 10 && (
            <div className="flex justify-between items-center mt-4 pt-3 border-t border-zinc-800/50">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="px-2 py-1 bg-zinc-950 rounded text-[10px] text-zinc-400 disabled:opacity-40"
              >
                이전
              </button>
              <span className="text-[10px] text-zinc-500">페이지 {page}</span>
              <button
                disabled={page * 10 >= notifsData.total}
                onClick={() => setPage(p => p + 1)}
                className="px-2 py-1 bg-zinc-950 rounded text-[10px] text-zinc-400 disabled:opacity-40"
              >
                다음
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default AdminNotificationsPage;
