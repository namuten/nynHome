import { PrismaClient } from '@prisma/client';
import { emailService } from '../services/email.service';

const prisma = new PrismaClient();

export interface DigestConfig {
  freq: 'daily' | 'weekly';
  cutoffDate: Date;
}

/**
 * 1. 각 유저 주기별로 적합한 기준일시를 연산해주는 도우미
 */
export function getCutoffDate(freq: string, lastSent: Date | null): Date {
  if (lastSent) return lastSent;

  const now = new Date();
  if (freq === 'daily') {
    return new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24시간 전
  } else {
    return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7일 전
  }
}

/**
 * 2. 라벤더 퍼플 프리미엄 HTML 템플릿 메이커
 */
export function generateDigestHtml(nickname: string, freq: string, notifications: any[]): string {
  const freqLabel = freq === 'daily' ? '일간 요약' : '주간 요약';
  const brandColor = '#8b5cf6'; // 브랜드 퍼플 HSL hex

  const listItemsHtml = notifications
    .map((n) => {
      const dateStr = new Date(n.createdAt).toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      return `
        <tr style="border-bottom: 1px solid #f1f1f1;">
          <td style="padding: 12px 8px; font-size: 13px; color: #333; line-height: 1.5;">
            <div style="font-weight: bold; color: #111;">${n.title}</div>
            <div style="font-size: 11px; color: #666; margin-top: 3px;">${n.body}</div>
          </td>
          <td style="padding: 12px 8px; font-size: 11px; color: #999; text-align: right; white-space: nowrap;">
            ${dateStr}
          </td>
        </tr>
      `;
    })
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>CrocHub ${freqLabel}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif; background-color: #fafafa;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" max-width="600" style="max-width: 600px; background-color: #ffffff; border: 1px solid #eaeaea; border-radius: 16px; margin: 40px auto; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
        <!-- Top Violet Header -->
        <tr>
          <td style="background-color: ${brandColor}; padding: 32px 24px; text-align: center;">
            <span style="font-size: 32px; display: block; margin-bottom: 8px;">🐊</span>
            <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 900; letter-spacing: -0.5px;">CrocHub 알림 ${freqLabel}</h1>
            <p style="color: #e9d5ff; margin: 4px 0 0 0; font-size: 12px;">운영자님, 그동안 쌓인 소중한 대화와 운영 소식들을 전달해 드립니다.</p>
          </td>
        </tr>
        
        <!-- Content Area -->
        <tr>
          <td style="padding: 32px 24px;">
            <p style="font-size: 14px; color: #333; margin-top: 0; line-height: 1.6;">
              안녕하세요, <strong>${nickname}</strong> 관리자님! <br />
              지정하신 주기에 맞춰 크록허브에서 수렴된 <strong>${notifications.length}건</strong>의 미처리 알림 요약을 전송해 드립니다.
            </p>
            
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 24px; border-top: 2px solid ${brandColor};">
              ${listItemsHtml}
            </table>
            
            <div style="margin-top: 32px; text-align: center;">
              <a href="${process.env.ADMIN_SITE_URL || 'http://localhost:5173/admin'}" style="background-color: ${brandColor}; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 12px; font-size: 13px; font-weight: bold; display: inline-block; transition: background 0.2s;">
                어드민 콘솔 대시보드로 이동
              </a>
            </div>
          </td>
        </tr>
        
        <!-- Footer Info -->
        <tr>
          <td style="background-color: #f7f7f7; padding: 24px; text-align: center; font-size: 11px; color: #888; border-top: 1px solid #eaeaea;">
            <p style="margin: 0 0 4px 0;">본 메일은 크록허브 어드민 알림 환경설정 주기에 맞춰 자동 전송되었습니다.</p>
            <p style="margin: 0;">수신을 원치 않으시면 <a href="${process.env.ADMIN_SITE_URL || 'http://localhost:5173/admin/notifications/preferences'}" style="color: ${brandColor}; text-decoration: underline;">알림 수신동의 변경</a> 페이지에서 주기를 "never"로 변경하십시오.</p>
            <p style="margin: 12px 0 0 0; font-weight: bold; color: #666;">© CrocHub. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

/**
 * 3. 이메일 다이제스트 일괄 발행 메인 실행 엔진 잡 (Cron 혹은 수동 트리거 수렴 가능)
 */
export async function runEmailDigestJob(): Promise<void> {
  console.log('⏳ [EmailDigestJob] 다이제스트 기획 발송 시퀀스 시작...');

  try {
    // 1. 다이제스트 주기 설정이 'never'가 아니면서 유효한 이메일 주소를 보유한 모든 활성 어드민 프리퍼런스 파싱
    const preferences = await prisma.notificationPreference.findMany({
      where: {
        emailDigestFreq: { in: ['daily', 'weekly'] },
        emailAddress: { not: null },
      },
    });

    if (preferences.length === 0) {
      console.log('✅ [EmailDigestJob] 다이제스트 발송 대상 어드민 수신자가 없습니다.');
      return;
    }

    const now = new Date();

    for (const pref of preferences) {
      if (!pref.emailAddress) continue;

      // 2. 관리자 닉네임을 찾기 위해 어드민 계정 취합
      const adminUser = await prisma.user.findUnique({
        where: { id: pref.adminUserId },
      });
      const nickname = adminUser?.nickname || '관리자';

      // 3. 마지막 다이제스트 발송 기준선 연산
      const cutoffDate = getCutoffDate(pref.emailDigestFreq, pref.lastDigestSentAt);

      // 4. 기준 시점 이후에 쌓인 읽지 않은(isRead: false) 어드민용 알림 수집
      const notifications = await prisma.notification.findMany({
        where: {
          userId: pref.adminUserId,
          isRead: false,
          createdAt: { gte: cutoffDate },
        },
        orderBy: { createdAt: 'desc' },
      });

      // 5. 발송할 신규 알림이 전혀 없는 경우에는 불필요한 메일 낭비를 방지하기 위해 과감히 스킵
      if (notifications.length === 0) {
        console.log(`[EmailDigestJob] 어드민 #${pref.adminUserId} (${nickname})님은 발송할 새 알림이 없어 스킵 처리.`);
        continue;
      }

      // 6. 메일 본문 제작 및 발송
      const htmlBody = generateDigestHtml(nickname, pref.emailDigestFreq, notifications);
      const freqLabel = pref.emailDigestFreq === 'daily' ? '일간' : '주간';

      console.log(`[EmailDigestJob] 메일 전송 시도중: TO: ${pref.emailAddress} | COUNT: ${notifications.length}건`);

      await emailService.send({
        to: pref.emailAddress,
        subject: `[CrocHub] ${nickname} 관리자님을 위한 ${freqLabel} 알림 요약 다이제스트입니다.`,
        html: htmlBody,
      });

      // 7. 발송 타임스탬프 갱신으로 발송 내역 마크
      await prisma.notificationPreference.update({
        where: { id: pref.id },
        data: { lastDigestSentAt: now },
      });

      console.log(`✅ [EmailDigestJob] 어드민 #${pref.adminUserId} 다이제스트 메일 발송 및 기록 갱신 완료.`);
    }

    console.log('🎉 [EmailDigestJob] 다이제스트 기획 발송 시퀀스 대성공 마감.');
  } catch (error) {
    console.error('❌ [EmailDigestJob] 작업 수행 중 치명적인 시스템 에러 감지:', error);
  }
}

// Standalone CLI runner 기동을 위한 수문장 배치
if (require.main === module) {
  runEmailDigestJob()
    .then(() => prisma.$disconnect())
    .catch((err) => {
      console.error('❌ [EmailDigestJob Command Runner] 치명적인 충돌:', err);
      process.exit(1);
    });
}

export default runEmailDigestJob;
