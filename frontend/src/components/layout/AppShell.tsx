import { Outlet } from 'react-router-dom';
import SiteHeader from './SiteHeader';
import Footer from './Footer';
import MobileNav from './MobileNav';
import PageContainer from './PageContainer';
import PwaInstallBanner from '../common/PwaInstallBanner';
import { AnalyticsProvider } from '../analytics/AnalyticsProvider';

export default function AppShell() {
  return (
    <AnalyticsProvider>
      <div className="min-h-screen flex flex-col bg-background pb-16 md:pb-0">
        <PwaInstallBanner />
        <SiteHeader />
        <PageContainer>
          <Outlet />
        </PageContainer>
        <Footer />
        <MobileNav />
      </div>
    </AnalyticsProvider>
  );
}
