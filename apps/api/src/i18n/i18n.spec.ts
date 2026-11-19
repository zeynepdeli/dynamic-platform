import 'reflect-metadata';

import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { UpdateHeroSlideDto } from '../hero-slides/dto/update-hero-slide.dto.js';
import { UpdatePageDto } from '../pages/dto/update-page.dto.js';
import { UpdateSiteSettingsDto } from '../site-settings/dto/update-site-settings.dto.js';

import { normalizeLocaleConfig, resolveLocale } from './locales.js';
import {
  localize,
  localizeHref,
  mergeTranslations,
  pathFor,
  slugFor,
} from './localize.js';

const errors = async (cls: new () => object, body: object) =>
  (
    await validate(plainToInstance(cls, body), {
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  ).map((e) => e.property);

describe('Dil ayarı', () => {
  it('ana dil her zaman açık ve ilk sırada; bilinmeyen diller atılır', () => {
    expect(normalizeLocaleConfig('tr', ['en', 'de', 'tr'])).toEqual({
      defaultLocale: 'tr',
      locales: ['tr', 'en'],
    });
    expect(normalizeLocaleConfig('en', ['tr'])).toEqual({
      defaultLocale: 'en',
      locales: ['en', 'tr'],
    });
    expect(normalizeLocaleConfig('xx', null)).toEqual({
      defaultLocale: 'tr',
      locales: ['tr'],
    });
  });

  it('kapalı ya da bilinmeyen dil istenirse ana dil', () => {
    const config = { defaultLocale: 'tr' as const, locales: ['tr' as const] };
    expect(resolveLocale('en', config)).toBe('tr');
    expect(resolveLocale('en', { ...config, locales: ['tr', 'en'] })).toBe(
      'en',
    );
    expect(resolveLocale('../', config)).toBe('tr');
  });
});

describe('İçeriği çevirme', () => {
  const row = {
    id: '1',
    title: 'Hakkımızda',
    body: 'Metin',
    translations: { en: { title: 'About', body: '  ' } },
  };

  it('çeviri varsa kullanılır, boşsa ana dil; ham çeviri dışarı verilmez', () => {
    expect(localize(row, 'en', 'tr', ['title', 'body'])).toEqual({
      id: '1',
      title: 'About',
      body: 'Metin',
    });
    expect(localize(row, 'tr', 'tr', ['title'])).toEqual({
      id: '1',
      title: 'Hakkımızda',
      body: 'Metin',
    });
  });

  it('listede olmayan alan çevrilmez', () => {
    const r = { id: '1', translations: { en: { id: 'saldırı' } } };
    expect(localize(r, 'en', 'tr', ['title'])).toEqual({ id: '1' });
  });

  it('kaydetme: gönderilen dil bütünüyle değişir, diğerleri korunur, boşlar atılır', () => {
    const current = { en: { title: 'Old', body: 'B' }, de: { title: 'X' } };
    expect(
      mergeTranslations(current, { en: { title: ' New ', body: '' } }),
    ).toEqual({ en: { title: 'New' }, de: { title: 'X' } });
    expect(mergeTranslations(current, { en: { title: '' } })).toEqual({
      de: { title: 'X' },
    });
    expect(mergeTranslations(current, undefined)).toBeUndefined();
  });
});

describe('Adresler', () => {
  const page = {
    slug: 'hakkimizda',
    translations: { en: { slug: 'about-us' } },
  };
  const map = new Map([
    ['hakkimizda', 'about-us'],
    ['iletisim', 'iletisim'],
  ]);

  it('sayfanın dildeki adresi', () => {
    expect(slugFor(page, 'en', 'tr')).toBe('about-us');
    expect(slugFor({ slug: 'sss' }, 'en', 'tr')).toBe('sss');
    expect(pathFor('en', 'tr', 'about-us')).toBe('/en/about-us');
    expect(pathFor('tr', 'tr', null)).toBe('/');
    expect(pathFor('en', 'tr', null)).toBe('/en');
  });

  it.each([
    ['/hakkimizda', '/en/about-us'],
    ['/hakkimizda#ekip', '/en/about-us#ekip'],
    ['/', '/en'],
    ['/#hizmetler', '/en#hizmetler'],
    ['/iletisim?konu=1', '/en/iletisim?konu=1'],
    ['/en/about-us', '/en/about-us'],
    ['/bilinmeyen', '/en/bilinmeyen'],
  ])('bağlantı %s → %s', (href, expected) => {
    expect(localizeHref(href, 'en', 'tr', map)).toBe(expected);
  });

  it('ana dilde bağlantı değişmez', () => {
    expect(localizeHref('/hakkimizda', 'tr', 'tr', map)).toBe('/hakkimizda');
    expect(localizeHref(null, 'en', 'tr', map)).toBeNull();
  });
});

describe('Çeviri doğrulaması', () => {
  it('geçerli çeviriler', async () => {
    expect(
      await errors(UpdateHeroSlideDto, {
        translations: { en: { title: 'Welcome', buttonHref: '/en/contact' } },
      }),
    ).toEqual([]);
    expect(
      await errors(UpdatePageDto, {
        translations: { en: { slug: 'about-us', title: 'About' } },
      }),
    ).toEqual([]);
    expect(
      await errors(UpdatePageDto, { translations: { en: { slug: '' } } }),
    ).toEqual([]);
    expect(
      await errors(UpdateSiteSettingsDto, {
        defaultLocale: 'tr',
        locales: ['tr', 'en'],
      }),
    ).toEqual([]);
  });

  it.each([
    [UpdateHeroSlideDto, { translations: { en: { title: 'a\nb' } } }],
    [
      UpdateHeroSlideDto,
      { translations: { en: { buttonHref: 'https://evil.com' } } },
    ],
    [
      UpdateHeroSlideDto,
      { translations: { en: { buttonHref: '//evil.com' } } },
    ],
    [
      UpdateHeroSlideDto,
      { translations: { en: { imageUrl: '/media/x.png' } } },
    ],
    [UpdateHeroSlideDto, { translations: { de: { title: 'Hallo' } } }],
    [UpdatePageDto, { translations: { en: { slug: 'About Us' } } }],
    [UpdateSiteSettingsDto, { locales: ['tr', 'de'] }],
    [UpdateSiteSettingsDto, { defaultLocale: 'xx' }],
  ] as [new () => object, object][])(
    'geçersiz çeviri reddedilir: %o',
    async (cls, body) => {
      expect((await errors(cls, body)).length).toBeGreaterThan(0);
    },
  );
});
