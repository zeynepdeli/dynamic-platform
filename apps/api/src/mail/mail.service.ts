import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { type Transporter } from 'nodemailer';

export type MailMessage = {
  to: string;
  subject: string;
  /** Yalnızca düz metin (HTML yok → içerik enjeksiyonu yok) */
  text: string;
  replyTo?: string;
};

// Başlık enjeksiyonuna karşı: satır sonlarını kaldır, uzunluğu sınırla
const oneLine = (value: string, max = 200) => value.replace(/[\r\n]+/g, ' ').slice(0, max);

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter | null;
  private readonly from: string | undefined;

  constructor(config: ConfigService) {
    const host = config.get<string>('SMTP_HOST');
    this.from = config.get<string>('MAIL_FROM');
    this.transporter =
      host && this.from
        ? nodemailer.createTransport({
            host,
            port: config.get<number>('SMTP_PORT') ?? 587,
            secure: config.get<string>('SMTP_SECURE') === 'true',
            // Production'da şifresiz bağlantıya izin yok (587 → STARTTLS zorunlu).
            // Geliştirmede Mailpit gibi yerel test sunucuları için serbest.
            requireTLS: config.get<string>('SMTP_SECURE') !== 'true' && config.get<string>('NODE_ENV') === 'production',
            auth: config.get<string>('SMTP_USER')
              ? { user: config.get<string>('SMTP_USER') as string, pass: config.get<string>('SMTP_PASS') ?? '' }
              : undefined,
            connectionTimeout: 10_000,
            socketTimeout: 15_000,
          })
        : null;
    if (!this.transporter) {
      this.logger.warn('SMTP tanımlı değil: e-posta gönderilmeyecek (bildirim, şifre sıfırlama).');
    }
  }

  get configured() {
    return this.transporter !== null;
  }

  /** Gönderir; hata olursa fırlatır (çağıran karar verir) */
  async send(message: MailMessage) {
    if (!this.transporter || !this.from) throw new Error('E-posta yapılandırılmamış.');
    await this.transporter.sendMail({
      from: this.from,
      to: oneLine(message.to, 254),
      subject: oneLine(message.subject),
      text: message.text.slice(0, 20_000),
      replyTo: message.replyTo ? oneLine(message.replyTo, 254) : undefined,
    });
  }

  /** Arka planda gönder; hata isteği bozmaz, yalnızca loglanır */
  sendInBackground(message: MailMessage) {
    if (!this.configured) return;
    this.send(message).catch((error: unknown) =>
      this.logger.error('E-posta gönderilemedi.', error instanceof Error ? error.message : String(error)),
    );
  }
}
