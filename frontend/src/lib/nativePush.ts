import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { api } from './api';

export async function registerNativePush() {
  if (!Capacitor.isNativePlatform()) return; // 웹 환경에서는 Plan 6 PWA Web Push 런타임 사용

  try {
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      console.warn('⚠️ Native push permission not granted:', permStatus.receive);
      return;
    }

    await PushNotifications.register();

    // 장치 등록 성공 시 백엔드 DB로 알림 수신 토큰 업로드
    PushNotifications.addListener('registration', async ({ value: token }) => {
      console.log('📱 Native device push registration token:', token);
      try {
        await api.post('/push/native-token', {
          token,
          platform: Capacitor.getPlatform(),
        });
        console.log('✅ Native device token saved on backend server.');
      } catch (err) {
        console.error('❌ Failed to save native token to server:', err);
      }
    });

    PushNotifications.addListener('registrationError', (err) => {
      console.error('❌ Native push registration error:', err);
    });

    // 포그라운드 구동 시의 수신 반응 리스닝
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('🔔 Push notification received in foreground:', notification);
    });

  } catch (err) {
    console.error('⚠️ Native push system error:', err);
  }
}
export default registerNativePush;
