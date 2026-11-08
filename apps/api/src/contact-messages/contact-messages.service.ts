import { Injectable, NotFoundException } from '@nestjs/common';

import { MailService } from '../mail/mail.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

import type { CreateContactMessageDto } from './dto/contact-message.dto.js';

// Kaynak tüketimini sınırla (OWASP A04): en fazla bu kadar mesaj tutulur,
// fazlası gelirse en eski OKUNMUŞ mesajlar silinir.
export const MAX_CONTACT_MESSAGES = 2000;
export const ADMIN_LIST_LIMIT = 500;

const clean = (v: string | undefined) => {
  const t = v?.trim();
  return t ? t : null;
};

@Injectable()
export class ContactMessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  async create(dto: CreateContactMessageDto) {
    // Bot: başarılı gibi davran ama kaydetme (botu uyarmamak için)
    if (dto.website?.trim()) return { success: true };

    await this.prisma.contactMessage.create({
      data: {
        name: dto.name.trim(),
        email: dto.email.trim().toLowerCase(),
        phone: clean(dto.phone),
        subject: clean(dto.subject),
        message: dto.message.trim(),
      },
    });

    await this.trim();
    await this.notify(dto);
    // Kaydedilen veri ziyaretçiye geri döndürülmez
    return { success: true };
  }

  /** Yeni mesaj bildirimi (admin → Gelen Mesajlar → bildirim adresi) */
  private async notify(dto: CreateContactMessageDto) {
    if (!this.mail.configured) return;
    const settings = await this.prisma.siteSettings.findUnique({
      where: { id: 'main' },
      select: { notifyEmail: true, siteName: true },
    });
    if (!settings?.notifyEmail) return;
    this.mail.sendInBackground({
      to: settings.notifyEmail,
      replyTo: dto.email.trim(),
      subject: `${settings.siteName}: yeni iletişim mesajı — ${dto.name.trim()}`,
      text: [
        `Ad: ${dto.name.trim()}`,
        `E-posta: ${dto.email.trim()}`,
        dto.phone?.trim() ? `Telefon: ${dto.phone.trim()}` : null,
        dto.subject?.trim() ? `Konu: ${dto.subject.trim()}` : null,
        '',
        dto.message.trim(),
        '',
        '— Yanıtlamak için bu e-postayı yanıtlayın. Tüm mesajlar yönetim panelinde: Gelen Mesajlar.',
      ]
        .filter((l) => l !== null)
        .join('\n'),
    });
  }

  findAll() {
    return this.prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: ADMIN_LIST_LIMIT,
    });
  }

  async unreadCount() {
    return { count: await this.prisma.contactMessage.count({ where: { read: false } }) };
  }

  async setRead(id: string, read: boolean) {
    await this.ensureExists(id);
    return this.prisma.contactMessage.update({ where: { id }, data: { read } });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.contactMessage.delete({ where: { id } });
  }

  private async ensureExists(id: string) {
    const found = await this.prisma.contactMessage.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!found) throw new NotFoundException('Mesaj bulunamadı.');
  }

  private async trim() {
    const total = await this.prisma.contactMessage.count();
    if (total <= MAX_CONTACT_MESSAGES) return;
    const old = await this.prisma.contactMessage.findMany({
      where: { read: true },
      orderBy: { createdAt: 'asc' },
      take: total - MAX_CONTACT_MESSAGES,
      select: { id: true },
    });
    if (old.length) {
      await this.prisma.contactMessage.deleteMany({
        where: { id: { in: old.map((m) => m.id) } },
      });
    }
  }
}
