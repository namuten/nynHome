import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { adminApi } from '../../lib/adminApi';
import { Send, HelpCircle, CheckCircle2, AlertCircle, Smartphone, Globe, AlertTriangle, Bell, Zap } from 'lucide-react';

/**
 * AdminPushPage - 전체 PWA 구독자 대상 푸시 알림 발송 콘솔 (Push Composer)
 * - 좌측: 푸시 상세 기획 Composer 폼 (Title, Body, Link)
 * - 우측: 스마트폰 잠금 화면 형태의 실시간 푸시 미리보기(Mobile Web Notification Preview) 지원
 * - 발송 진행 및 수신 성공 단말기 수(sentCount) 산뜻한 통계 피드백 탑재
 */
export default function AdminPushPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('/');
  
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // 대시보드 통계로부터 전체 푸시 구독 수치를 가볍게 가져와 노출하기 위한 대시보드 조회 연동 (선택사항)
  const { data: dashboardData } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => adminApi.getAdminDashboard(),
  });
  const totalSubscribers = dashboardData?.metrics?.pushSubscriptions ?? 0;

  // 푸시 발송 뮤테이션
  const pushMutation = useMutation({
    mutationFn: (payload: { title: string; body: string; url?: string }) =>
      adminApi.sendAdminPush(payload),
    onSuccess: (data) => {
      setSuccessCount(data.sentCount);
      setFormError(null);
      // 성공 시 폼 초기화
      setTitle('');
      setBody('');
      setUrl('/');
      // 7초 후 성공 알림 숨김
      setTimeout(() => setSuccessCount(null), 7000);
    },
    onError: (err: any) => {
      console.error(err);
      setFormError(err.message || '푸시 메시지를 전송하는 도중 예기치 못한 오류가 발생했습니다.');
      setSuccessCount(null);
    },
  });

  const handleSendPush = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessCount(null);

    if (!title.trim()) {
      setFormError('푸시 알림의 제목을 입력해 주세요.');
      return;
    }
    if (!body.trim()) {
      setFormError('푸시 알림의 본문 내용을 입력해 주세요.');
      return;
    }

    pushMutation.mutate({
      title: title.trim(),
      body: body.trim(),
      url: url.trim() || undefined,
    });
  };

  return (
    <div className="space-y-6 font-body animate-fade-in pb-12">
      {/* 타이틀 헤더 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-surface-container pb-5">
        <div>
          <h1 className="text-3xl font-display font-black text-on-surface tracking-tight flex items-center gap-2.5">
            <Send className="w-8 h-8 text-primary" />
            푸시 알림 발송
          </h1>
          <p className="text-xs text-on-surface-variant font-medium mt-1">
            PWA 앱 설치 후 알림 수신에 동의한 모든 구독자의 브라우저/모바일 단말기에 실시간 백그라운드 푸시 알림을 즉각 발송합니다.
          </p>
        </div>
      </div>

      {/* 실시간 성공/에러 상태 피드백 */}
      {successCount !== null && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-3xl flex items-start gap-3 max-w-4xl animate-fade-in shadow-sm">
          <CheckCircle2 className="w-5.5 h-5.5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-extrabold text-sm">📢 긴급 알림 전송 완료!</p>
            <p className="font-semibold leading-relaxed">
              총 <span className="text-emerald-600 font-black text-sm">{successCount}</span>개의 활성화된 기기 단말기로 푸시 알림이 성공적으로 송출되었습니다. 
              (오래되었거나 비활성 상태인 브라우저 구독 키 정보는 안전하게 자동 청소되었습니다)
            </p>
          </div>
        </div>
      )}

      {formError && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-3xl flex items-start gap-3 max-w-4xl animate-fade-in shadow-sm">
          <AlertCircle className="w-5.5 h-5.5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-extrabold text-sm">⚠️ 푸시 발송 실패</p>
            <p className="font-semibold leading-relaxed">{formError}</p>
          </div>
        </div>
      )}

      {/* 푸시 구독 통계 및 가이드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl">
        <div className="p-5 bg-white border border-surface-container rounded-3xl shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-on-surface-variant font-bold block select-none">총 푸시 알림 수신자</span>
            <span className="text-lg font-black text-on-surface tracking-tight">
              {totalSubscribers} 명 구독 중
            </span>
          </div>
        </div>

        <div className="p-5 bg-amber-50/60 border border-amber-100 rounded-3xl shadow-sm flex items-center gap-4 col-span-2">
          <AlertTriangle className="w-5.5 h-5.5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[10px] text-amber-900 font-bold leading-relaxed">
            <b>발송 시 유의사항:</b> 푸시 전송은 구독자의 단말기 네트워크 상태에 따라 최대 수초~수분의 지연이 발생할 수 있습니다. 
            동일한 내용의 알림을 짧은 시간 내에 반복하여 과도하게 발송 시 브라우저 정책에 의해 스팸 처리가 되거나 수신 거부될 수 있으니 신중하게 작성하십시오.
          </p>
        </div>
      </div>

      {/* 메인 컴포저 및 실시간 모바일 프리뷰 영역 */}
      <div className="flex flex-col lg:flex-row gap-6 max-w-5xl items-start">
        
        {/* 좌측: 푸시 에디터 양식 */}
        <div className="flex-1 bg-white border border-surface-container rounded-3xl p-6 shadow-sm space-y-5 w-full">
          <h2 className="text-sm font-bold text-on-surface flex items-center gap-1.5 border-b border-surface-container pb-3">
            <Zap className="w-4 h-4 text-primary" />
            푸시 메시지 기획 (Composer)
          </h2>

          <form onSubmit={handleSendPush} className="space-y-4">
            
            {/* 1. 알림 타이틀 */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-on-surface-variant flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-on-surface-variant/70" />
                <span>푸시 알림 제목 *</span>
              </label>
              <input
                type="text"
                placeholder="예: 📢 크록허브 신규 업데이트 소식!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={40}
                className="w-full px-3.5 py-2.5 bg-surface-container/20 border border-surface-container rounded-xl text-xs font-semibold focus:outline-none focus:border-primary transition"
                required
              />
              <span className="text-[9px] text-on-surface-variant/70 block text-right">
                {title.length}/40자 (모바일 노출 권장 글자수)
              </span>
            </div>

            {/* 2. 알림 본문 */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-on-surface-variant flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-on-surface-variant/70" />
                <span>푸시 알림 본문 내용 *</span>
              </label>
              <textarea
                placeholder="구독 유저들이 잠금 화면에서 한눈에 확인하도록 알림 메시지를 매력적으로 요약해서 작성하세요."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                maxLength={120}
                rows={4}
                className="w-full p-3.5 bg-surface-container/20 border border-surface-container rounded-xl text-xs font-semibold focus:outline-none focus:border-primary transition resize-none leading-relaxed"
                required
              />
              <span className="text-[9px] text-on-surface-variant/70 block text-right">
                {body.length}/120자
              </span>
            </div>

            {/* 3. 랜딩 URL */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-on-surface-variant flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-on-surface-variant/70" />
                <span>알림 탭 클릭 시 연결할 앱 내 주소 (Landing URL)</span>
              </label>
              <input
                type="text"
                placeholder="예: / (홈화면) 혹은 /post/45 (특정 게시글)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-surface-container/20 border border-surface-container rounded-xl text-xs font-bold text-primary focus:outline-none focus:border-primary transition"
              />
              <span className="text-[9px] text-on-surface-variant/70 block">
                * 공백 시 기본값으로 크록허브 메인 홈 화면으로 자동 라우팅 처리됩니다.
              </span>
            </div>

            {/* 전송 단추 */}
            <div className="pt-3 border-t border-surface-container/60">
              <button
                type="submit"
                disabled={pushMutation.isPending || !title.trim() || !body.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 text-xs font-bold rounded-2xl bg-primary text-white hover:bg-primary-container hover:text-primary shadow-sm hover:shadow transition disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{pushMutation.isPending ? '전체 구독 단말기로 푸시 전송 중...' : '푸시 알림 대량 발송 시작'}</span>
              </button>
            </div>

          </form>
        </div>

        {/* 우측: 스마트폰 잠금 화면 실시간 푸시 미리보기 (WOW 팩터) */}
        <div className="w-full lg:w-80 bg-white border border-surface-container rounded-3xl p-6 shadow-sm space-y-4 flex flex-col items-center">
          <h2 className="text-sm font-bold text-on-surface flex items-center gap-1.5 border-b border-surface-container pb-3 w-full justify-center">
            <Smartphone className="w-4 h-4 text-primary" />
            수신 잠금화면 미리보기
          </h2>

          {/* 모바일 잠금화면 프레임 시각화 */}
          <div className="w-64 h-[390px] bg-gradient-to-br from-indigo-900 via-purple-900 to-black rounded-[36px] p-4 relative shadow-lg overflow-hidden border-[6px] border-surface-container-high flex flex-col justify-between">
            {/* 상단 노치 바 장식 */}
            <div className="w-24 h-4 bg-black rounded-full mx-auto -mt-2.5 flex justify-around items-center px-3.5 text-[7px] text-white/50 font-sans select-none pointer-events-none">
              <span>9:41</span>
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full scale-75" />
            </div>

            {/* 잠금화면 중간 날짜 장식 */}
            <div className="text-center text-white/80 select-none pointer-events-none mt-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">5월 6일 수요일</p>
              <h3 className="text-3xl font-display font-black tracking-tighter mt-0.5">09:41</h3>
            </div>

            {/* 실시간 알림 팝업 배너 (와우 포인트!) */}
            <div className="flex-1 flex flex-col justify-end pb-8">
              <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3 shadow-md text-white space-y-1.5 animate-bounce">
                
                {/* 알림 배너 헤더 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-md bg-primary flex items-center justify-center text-[8px] font-black font-display text-white">
                      C
                    </div>
                    <span className="text-[9px] font-bold text-white/80">CrocHub</span>
                  </div>
                  <span className="text-[8px] font-semibold text-white/60">지금</span>
                </div>

                {/* 실시간 타이핑 반영 본문 */}
                <div className="space-y-0.5">
                  <p className="text-[11px] font-black truncate block">
                    {title.trim() || '여기에 알림 제목이 노출됩니다'}
                  </p>
                  <p className="text-[9.5px] font-semibold text-white/85 leading-relaxed break-words line-clamp-3">
                    {body.trim() || '작성한 본문 알림 메시지가 실시간 잠금화면 팝업 메시지 형태로 실감 나게 피드백됩니다.'}
                  </p>
                </div>

              </div>
            </div>

            {/* 하단 제스처 바 잠금 해제 슬라이드 */}
            <div className="w-24 h-1 bg-white/40 rounded-full mx-auto mb-1 pointer-events-none" />
          </div>

          <div className="text-center">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-surface-container text-[9px] font-bold text-on-surface-variant">
              <HelpCircle className="w-3 h-3" />
              <span>PWA 모바일 잠금화면 가상 시뮬레이터</span>
            </span>
          </div>

        </div>

      </div>
    </div>
  );
}
