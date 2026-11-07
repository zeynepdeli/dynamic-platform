import { BadRequestException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { PrismaService } from '../prisma/prisma.service.js';
import { CreateSocialLinkDto } from './dto/social-link.dto.js';
import { MAX_SOCIAL_LINKS, SocialLinksService } from './social-links.service.js';

describe('SocialLinksService', () => {
  let service: SocialLinksService;
  const prisma = { socialLink: { count: vi.fn(), create: vi.fn() } };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [SocialLinksService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get(SocialLinksService);
  });

  it(`en fazla ${MAX_SOCIAL_LINKS} bağlantı`, async () => {
    prisma.socialLink.count.mockResolvedValue(MAX_SOCIAL_LINKS);
    await expect(
      service.create({ icon: 'instagram', url: 'https://instagram.com/a' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.socialLink.create).not.toHaveBeenCalled();
  });

  it('yeni bağlantı sona eklenir, boş etiket null olur', async () => {
    prisma.socialLink.count.mockResolvedValue(3);
    prisma.socialLink.create.mockResolvedValue({});
    await service.create({ icon: 'x', label: '  ', url: 'https://x.com/a' });
    expect(prisma.socialLink.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ order: 3, label: null }),
    });
  });
});

describe('CreateSocialLinkDto', () => {
  const errors = async (body: object) =>
    (await validate(plainToInstance(CreateSocialLinkDto, body))).map(
      (e) => e.property,
    );

  it('whitelist dışı ikon reddedilir', async () => {
    expect(
      await errors({ icon: '<svg onload=alert(1)>', url: 'https://a.com' }),
    ).toContain('icon');
  });

  it('javascript:, http: ve kullanıcı bilgili adresler reddedilir', async () => {
    for (const url of [
      'javascript:alert(1)',
      'http://instagram.com/a',
      'https://user:pw@evil.com',
    ]) {
      expect(await errors({ icon: 'instagram', url })).toContain('url');
    }
  });

  it('geçerli bağlantı kabul edilir', async () => {
    expect(
      await errors({ icon: 'whatsapp', url: 'https://wa.me/905551112233' }),
    ).toEqual([]);
  });
});
