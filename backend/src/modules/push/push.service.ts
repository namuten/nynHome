import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { webpush } from '../../lib/webpush';
import { firebaseAdmin } from '../../lib/firebase';
import { SubscribeDto, SendPushDto } from './push.types';

export async function subscribe(dto: SubscribeDto, userId?: number) {
  try {
    return await prisma.pushSubscription.upsert({
      where: { endpoint: dto.endpoint } as any,
      update: { p256dh: dto.keys.p256dh, auth: dto.keys.auth, userId: userId ?? null },
      create: {
        endpoint: dto.endpoint,
        p256dh: dto.keys.p256dh,
        auth: dto.keys.auth,
        userId: userId ?? null,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      // Fallback to update if concurrent registration occurred
      return await prisma.pushSubscription.update({
        where: { endpoint: dto.endpoint },
        data: { p256dh: dto.keys.p256dh, auth: dto.keys.auth, userId: userId ?? null },
      });
    }
    throw error;
  }
}

export async function saveNativeToken(token: string, platform: 'android' | 'ios', userId?: number) {
  try {
    return await prisma.nativeDevice.upsert({
      where: { token },
      update: { userId: userId ?? null, platform },
      create: { token, platform, userId: userId ?? null },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      // Fallback to update if concurrent registration occurred
      return await prisma.nativeDevice.update({
        where: { token },
        data: { userId: userId ?? null, platform },
      });
    }
    throw error;
  }
}

export async function sendToAll(dto: SendPushDto, adminUserId: number): Promise<number> {
  // 1. Web Push (VAPID) 발송
  const subscriptions = await prisma.pushSubscription.findMany();
  const payload = JSON.stringify({ 
    title: dto.title, 
    body: dto.body, 
    url: dto.url ?? '/',
    imageUrl: dto.imageUrl,
  });

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
  const devices = await prisma.nativeDevice.findMany();
  const tokens = devices.map(d => d.token);

  if (firebaseAdmin) {
    console.log(`📱 [FCM Native Push] DB에서 조회된 기기 수: ${tokens.length}대`);

    if (tokens.length > 0) {
      console.log(`📣 [FCM Native Push] 발송을 시작합니다.`);
      console.log(`📝 [FCM Native Push] 제목: "${dto.title}"`);
      console.log(`📝 [FCM Native Push] 내용: "${dto.body}"`);
      console.log(`📝 [FCM Native Push] 대상 토큰 목록:`, tokens);

      try {
        // FCM Multicast payload 구성
        const message = {
          tokens,
          notification: {
            title: dto.title,
            body: dto.body,
            image: dto.imageUrl || undefined,
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
        
        console.log(`✅ [FCM Native Push] 구글 FCM 서버 전송 성공: ${response.successCount}대, 실패: ${response.failureCount}대`);

        // 유효하지 않거나 만료된 FCM 토큰(stale) 처리
        if (response.failureCount > 0) {
          const staleTokens: string[] = [];
          response.responses.forEach((resp, idx) => {
            if (!resp.success) {
              const error = resp.error;
              console.warn(`⚠️ [FCM Native Push] 기기 토큰 [${tokens[idx]}] 전송 실패 원인:`, error?.message || error?.code);
              if (error && (
                error.code === 'messaging/invalid-registration-token' ||
                error.code === 'messaging/registration-token-not-registered'
              )) {
                staleTokens.push(tokens[idx]);
              }
            }
          });

          if (staleTokens.length > 0) {
            console.log(`🗑️ [FCM Native Push] 만료되었거나 무효한 토큰 ${staleTokens.length}개를 DB에서 안전하게 정리합니다.`);
            await prisma.nativeDevice.deleteMany({ where: { token: { in: staleTokens } } });
          }
        }
      } catch (err) {
        console.error('❌ [FCM Native Push] 구글 FCM 전송 중 치명적 오류 발생:', err);
      }
    } else {
      console.log('⚠️ [FCM Native Push] DB에 등록된 활성화된 안드로이드/iOS 기기 토큰이 없어 전송을 생략합니다.');
    }
  }

  const totalCount = subscriptions.length + tokens.length;
  const successCount = webSentCount + nativeSentCount;
  const failCount = totalCount - successCount;

  // 발송 후 캠페인 기록 생성
  await prisma.pushCampaign.create({
    data: {
      title: dto.title,
      body: dto.body,
      imageUrl: dto.imageUrl ?? null,
      linkUrl: dto.url ?? null,
      targetType: 'all',
      totalCount,
      successCount,
      failCount,
      sentAt: new Date(),
      createdBy: adminUserId,
    },
  });

  return successCount;
}

export async function sendToUser(dto: SendPushDto, targetUserId: number, adminUserId: number): Promise<number> {
  // 1. 해당 유저의 Web Push 구독 조회
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId: targetUserId },
  });
  const payload = JSON.stringify({ 
    title: dto.title, 
    body: dto.body, 
    url: dto.url ?? '/',
    imageUrl: dto.imageUrl,
  });

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

  // 2. 해당 유저의 Native 토큰 조회
  let nativeSentCount = 0;
  const devices = await prisma.nativeDevice.findMany({
    where: { userId: targetUserId },
  });
  const tokens = devices.map(d => d.token);

  if (firebaseAdmin && tokens.length > 0) {
    try {
      const message = {
        tokens,
        notification: {
          title: dto.title,
          body: dto.body,
          image: dto.imageUrl || undefined,
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
      console.error('❌ [FCM Native Push] sendToUser 중 오류 발생:', err);
    }
  }

  const totalCount = subscriptions.length + tokens.length;
  const successCount = webSentCount + nativeSentCount;
  const failCount = totalCount - successCount;

  // 발송 후 캠페인 기록 생성
  await prisma.pushCampaign.create({
    data: {
      title: dto.title,
      body: dto.body,
      imageUrl: dto.imageUrl ?? null,
      linkUrl: dto.url ?? null,
      targetType: 'user',
      targetUserId,
      totalCount,
      successCount,
      failCount,
      sentAt: new Date(),
      createdBy: adminUserId,
    },
  });

  return successCount;
}

export async function getCampaignHistory(page = 1, limit = 20) {
  const [campaigns, total] = await Promise.all([
    prisma.pushCampaign.findMany({
      orderBy: { sentAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.pushCampaign.count(),
  ]);
  return { campaigns, total, page, limit };
}

export async function getCampaignStats() {
  const result = await prisma.pushCampaign.aggregate({
    _count: { id: true },
    _sum: { totalCount: true, successCount: true, failCount: true },
  });
  return {
    totalCampaigns: result._count.id,
    totalSent: Number(result._sum.totalCount ?? 0),
    totalSuccess: Number(result._sum.successCount ?? 0),
    totalFail: Number(result._sum.failCount ?? 0),
  };
}
