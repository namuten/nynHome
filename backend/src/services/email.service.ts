import nodemailer from 'nodemailer';

export interface EmailSendOptions {
  to: string;
  subject: string;
  html: string;
}

export interface EmailAdapter {
  send(opts: EmailSendOptions): Promise<void>;
}

/**
 * 1. 실서비스 운영용 SMTP Nodemailer 어댑터
 */
export class NodemailerAdapter implements EmailAdapter {
  private transporter: nodemailer.Transporter | null = null;

  private getTransporter() {
    if (this.transporter) return this.transporter;

    const host = process.env.EMAIL_SMTP_HOST;
    const port = parseInt(process.env.EMAIL_SMTP_PORT || '587', 10);
    const user = process.env.EMAIL_SMTP_USER;
    const pass = process.env.EMAIL_SMTP_PASS;

    // 만약 호스트 설정이 안 되어 있다면 전송 불가 경고를 던지거나 더미 리턴
    if (!host || !user || !pass) {
      console.warn('⚠️ SMTP 설정정보(.env)가 완전하지 않습니다. 이메일이 실제 발송되지 않고 더미 로깅 처리됩니다.');
      return null;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // SSL/TLS 포트 여부
      auth: {
        user,
        pass,
      },
    });

    return this.transporter;
  }

  async send(opts: EmailSendOptions): Promise<void> {
    const transporter = this.getTransporter();
    const from = process.env.EMAIL_FROM || '"CrocHub" <no-reply@crochub.dev>';

    if (!transporter) {
      console.log(`[SMTP Dummy Send] TO: ${opts.to} | SUBJECT: ${opts.subject}`);
      return;
    }

    await transporter.sendMail({
      from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
  }
}

/**
 * 2. 통합 테스트용 무진동 메모리 Mock 어댑터
 */
export class MockEmailAdapter implements EmailAdapter {
  public sentEmails: EmailSendOptions[] = [];

  async send(opts: EmailSendOptions): Promise<void> {
    this.sentEmails.push(opts);
    console.log(`[Mock Email Buffered] TO: ${opts.to} | SUBJECT: ${opts.subject}`);
  }

  clear() {
    this.sentEmails = [];
  }
}

/**
 * 3. 이메일 유포 총괄 서비스 매니저
 */
export class EmailService {
  constructor(private adapter: EmailAdapter) {}

  async send(opts: EmailSendOptions): Promise<void> {
    // 다이제스트 및 통지가 메인 서비스 기동에 악영향을 절대 주지 않도록 내부 안전 가드 탑재
    try {
      await this.adapter.send(opts);
    } catch (error) {
      console.error('❌ [EmailService.send] 이메일 다이제스트 전송 중 예상치 못한 에러 감지 (안전 격리됨):', error);
    }
  }

  getAdapter(): EmailAdapter {
    return this.adapter;
  }
}

// 기본 운영용으로 싱글톤 생성
export const emailService = new EmailService(new NodemailerAdapter());
export default emailService;
