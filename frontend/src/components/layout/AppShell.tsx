import { useEffect } from 'react';
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
  return (
    <AnalyticsProvider>
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
