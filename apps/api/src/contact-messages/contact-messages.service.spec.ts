import { Test, type TestingModule } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { MailService } from '../mail/mail.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ContactMessagesService } from './contact-messages.service.js';
import { CreateContactMessageDto } from './dto/contact-message.dto.js';

describe('ContactMessagesService', () => {
  let service: ContactMessagesService;
  const prisma = {
    contactMessage: {
      create: vi.fn(),
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn(),
      deleteMany: vi.fn(),
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    prisma.contactMessage.count.mockResolvedValue(1);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactMessagesService,
        { provide: PrismaService, useValue: prisma },
        { provide: MailService, useValue: { configured: false, sendInBackground: vi.fn() } },
      ],
    }).compile();
    service = module.get(ContactMessagesService);
  });

  const base = { name: 'Ayşe', email: 'AYSE@Example.com ', message: 'Merhaba, bilgi almak istiyorum.' };

  it('bal küpü doluysa kaydetmez ama başarılı döner', async () => {
    await expect(service.create({ ...base, website: 'http://spam' })).resolves.toEqual({ success: true });
    expect(prisma.contactMessage.create).not.toHaveBeenCalled();
  });

  it('kaydeder, e-postayı normalize eder, veriyi geri döndürmez', async () => {
    const result = await service.create(base);
    expect(result).toEqual({ success: true });
    expect(prisma.contactMessage.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ email: 'ayse@example.com', phone: null }),
    });
  });
});

describe('CreateContactMessageDto', () => {
  const errors = async (body: object) =>
    (await validate(plainToInstance(CreateContactMessageDto, body))).map((e) => e.property);

  it('geçersiz e-posta, kısa mesaj ve harfli telefon reddedilir', async () => {
    const e = await errors({ name: 'A b', email: 'x', message: 'kısa', phone: 'abc<script>' });
    expect(e).toEqual(expect.arrayContaining(['email', 'message', 'phone']));
  });

  it('ad ve konuda satır sonu reddedilir (başlık enjeksiyonu)', async () => {
    const e = await errors({ name: 'Ali\r\nBcc: x@evil.com', subject: 'a\nb', email: 'a@b.co', message: 'merhaba merhaba' });
    expect(e).toEqual(expect.arrayContaining(['name', 'subject']));
  });

  it('çok uzun mesaj reddedilir', async () => {
    expect(await errors({ name: 'Ali', email: 'a@b.co', message: 'x'.repeat(5001) })).toContain('message');
  });
});
