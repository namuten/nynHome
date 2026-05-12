import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { registerNativePush } from '../../lib/nativePush';
import SiteHeader from './SiteHeader';
import Footer from './Footer';
import MobileNav from './MobileNav';
import PageContainer from './PageContainer';
import PwaInstallBanner from '../common/PwaInstallBanner';
import UpdatePrompt from '../common/UpdatePrompt';
import { AnalyticsProvider } from '../analytics/AnalyticsProvider';

export default function AppShell() {
  const [showIntro, setShowIntro] = useState(true);
  const [isFading, setIsFading] = useState(false);

  // 모바일 네이티브 앱 구동 시 하드웨어 부팅 설정
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      try {
        // 상단 상태바 디자인 깔끔한 어두운 테마로 도색
        StatusBar.setStyle({ style: Style.Dark });
        StatusBar.setBackgroundColor({ color: '#0f0f1a' });
        
        // 네이티브 푸시 알림 등록 절차 기동
        registerNativePush();
      } catch (err) {
        console.error('⚠️ Failed to initialize native Capacitor plugins:', err);
      }
    }
  }, []);

  const handleIntroEnd = () => {
    setIsFading(true);
    setTimeout(() => {
      setShowIntro(false);
    }, 600); // 0.6초간 페이드 아웃 진행 후 인트로 제거
  };

  return (
    <AnalyticsProvider>
      {showIntro && (
        <div 
          className={`fixed inset-0 z-50 bg-[#0f0f1a] flex items-center justify-center transition-opacity duration-500 ${
            isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          {/* iOS 자동 재생 호환 특수 옵션 주입 */}
          <video
            src="/branding/video.mp4"
            autoPlay
            muted
            playsInline
            controls={false}
            onEnded={handleIntroEnd}
            onError={handleIntroEnd}
            className="w-full h-full object-contain"
          />
          
          {/* 건너뛰기 투명 글래스모픽 칩 */}
          <button
            type="button"
            onClick={handleIntroEnd}
            className="absolute top-[calc(1rem+env(safe-area-inset-top))] right-4 z-50 px-4 py-2 rounded-full bg-slate-900/40 hover:bg-slate-900/60 border border-slate-700/30 text-white text-xs font-bold font-body backdrop-blur-md active:scale-95 transition-all duration-200 shadow-md"
          >
            건너뛰기 Skip
          </button>
        </div>
      )}

      <div className="w-full h-full md:h-auto md:min-h-screen flex flex-col bg-background overflow-hidden md:overflow-visible">
        <PwaInstallBanner />
        <UpdatePrompt />
        <SiteHeader />
        <PageContainer>
          <Outlet />
        </PageContainer>
        <div className="hidden md:block">
          <Footer />
        </div>
        <MobileNav />
      </div>
    </AnalyticsProvider>
  );
}
