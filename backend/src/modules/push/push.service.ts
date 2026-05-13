import { prisma } from '../../lib/prisma';
import { webpush } from '../../lib/webpush';
import { firebaseAdmin } from '../../lib/firebase';
import { SubscribeDto, SendPushDto } from './push.types';

export async function subscribe(dto: SubscribeDto, userId?: number) {
  return prisma.pushSubscription.upsert({
    where: { endpoint: dto.endpoint } as any,
    update: { p256dh: dto.keys.p256dh, auth: dto.keys.auth },
    create: {
      endpoint: dto.endpoint,
      p256dh: dto.keys.p256dh,
      auth: dto.keys.auth,
      userId: userId ?? null,
    },
  });
}

export async function saveNativeToken(token: string, platform: 'android' | 'ios', userId: number) {
  return prisma.nativeDevice.upsert({
    where: { token },
    update: { userId, platform },
    create: { token, platform, userId },
  });
}

export async function sendToAll(dto: SendPushDto): Promise<number> {
  // 1. Web Push (VAPID) 발송
  const subscriptions = await prisma.pushSubscription.findMany();
  const payload = JSON.stringify({ title: dto.title, body: dto.body, url: dto.url ?? '/' });

  let webSentCount = 0;
  const staleWebSubs: number[] = [];

  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload,
        );
        webSentCount++;
      } catch {
        staleWebSubs.push(sub.id);
      }
    }),
  );

  if (staleWebSubs.length > 0) {
    await prisma.pushSubscription.deleteMany({ where: { id: { in: staleWebSubs } } });
  }

  // 2. Android/iOS Native (FCM) 발송
  let nativeSentCount = 0;
  if (firebaseAdmin) {
    const devices = await prisma.nativeDevice.findMany();
    const tokens = devices.map(d => d.token);

    if (tokens.length > 0) {
      try {
        // FCM Multicast payload 구성
        const message = {
          tokens,
          notification: {
            title: dto.title,
            body: dto.body,
          },
          data: {
            url: dto.url ?? '/',
          },
          android: {
            notification: {
              sound: 'default',
              clickAction: 'FCM_PLUGIN_ACTIVITY',
            },
          },
          apns: {
            payload: {
              aps: {
                sound: 'default',
                badge: 1,
              },
            },
          },
        };

        const response = await firebaseAdmin.messaging().sendEachForMulticast(message);
        nativeSentCount = response.successCount;

        // 유효하지 않거나 만료된 FCM 토큰(stale) 처리
        if (response.failureCount > 0) {
          const staleTokens: string[] = [];
          response.responses.forEach((resp, idx) => {
            if (!resp.success) {
              const error = resp.error;
              if (error && (
                error.code === 'messaging/invalid-registration-token' ||
                error.code === 'messaging/registration-token-not-registered'
              )) {
                staleTokens.push(tokens[idx]);
              }
            }
          });

          if (staleTokens.length > 0) {
            await prisma.nativeDevice.deleteMany({ where: { token: { in: staleTokens } } });
          }
        }
      } catch (err) {
        console.error('❌ Failed to dispatch multicast FCM messages:', err);
      }
    }
  }

  return webSentCount + nativeSentCount;
}
