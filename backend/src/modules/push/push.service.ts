import { prisma } from '../../lib/prisma';
import { webpush } from '../../lib/webpush';
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

export async function sendToAll(dto: SendPushDto): Promise<number> {
  const subscriptions = await prisma.pushSubscription.findMany();
  const payload = JSON.stringify({ title: dto.title, body: dto.body, url: dto.url ?? '/' });

  let sent = 0;
  const stale: number[] = [];

  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload,
        );
        sent++;
      } catch {
        stale.push(sub.id);
      }
    }),
  );

  if (stale.length > 0) {
    await prisma.pushSubscription.deleteMany({ where: { id: { in: stale } } });
  }

  return sent;
}
