import { useState, useEffect } from 'react';
import { isStandalone, isIOS, isSafari } from '../lib/pwa';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const DISMISS_KEY = 'crochub:pwa-install-dismissed-at';
const DISMISS_DURATION_DAYS = 7;

export function usePwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalledApp, setIsInstalledApp] = useState(false);

  useEffect(() => {
    // 1. 이미 앱 형태로 실행 중인지(standalone) 확인
    const checkStandalone = isStandalone();
    setIsInstalledApp(checkStandalone);

    if (checkStandalone) {
      return;
    }

    // 2. 디스미스 이력 확인 (7일 제한)
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    let isRecentlyDismissed = false;
    if (dismissedAt) {
      const dismissDate = new Date(parseInt(dismissedAt, 10));
      const differenceInTime = Date.now() - dismissDate.getTime();
      const differenceInDays = differenceInTime / (1000 * 3600 * 24);
      if (differenceInDays < DISMISS_DURATION_DAYS) {
        isRecentlyDismissed = true;
      }
    }

    // 3. iOS Fallback 조건 체크 (iOS Safari이고 standalone이 아니며 최근 닫지 않음)
    const checkIOS = isIOS();
    const checkSafari = isSafari();
    if (checkIOS && checkSafari && !isRecentlyDismissed) {
      setIsInstallable(true);
      setShowBanner(true);
    }

    // 4. Android/Chrome/Edge 브라우저 지원용 beforeinstallprompt 이벤트 핸들링
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setIsInstallable(true);

      if (!isRecentlyDismissed) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 5. 성공적으로 설치되었을 때의 이벤트 리스너(appinstalled)
    const handleAppInstalled = () => {
      console.log('🎉 CrocHub has been successfully installed!');
      setIsInstalledApp(true);
      setShowBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) {
      return false;
    }

    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the CrocHub install prompt');
      setShowBanner(false);
      setDeferredPrompt(null);
      return true;
    } else {
      console.log('User dismissed the CrocHub install prompt');
      return false;
    }
  };

  const dismissBanner = () => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setShowBanner(false);
  };

  return {
    isInstallable,
    showBanner,
    isInstalledApp,
    isIOS: isIOS(),
    installApp,
    dismissBanner,
  };
}
