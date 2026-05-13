import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.crochub.app',
  appName: 'CrocHub',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  ios: {
    contentInset: 'never',
    preferredContentMode: 'mobile',
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0f0f1a',
      androidSplashResourceName: 'splash',
      iosSplashTemplate: 'Splash',
      splashFullScreen: true,
      splashImmersive: true,
      showSpinner: false,
      launchAutoHide: true,
    },
  },
};

export default config;
