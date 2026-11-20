import { describe, expect, it } from 'vitest';

import { validateEnv } from './env.validation.js';

const base = {
  DATABASE_URL: 'postgresql://u:p@127.0.0.1:5434/db',
  JWT_SECRET: 'x'.repeat(64),
  FRONTEND_URL: 'http://localhost:3001',
};

describe('validateEnv', () => {
  it('.env.example gibi boş bırakılan isteğe bağlı ayarlar açılışı engellemez', () => {
    const env = validateEnv({
      ...base,
      CLOUDINARY_CLOUD_NAME: '',
      CLOUDINARY_API_KEY: '',
      CLOUDINARY_API_SECRET: '',
      SMTP_HOST: '',
      SMTP_USER: '',
      SMTP_PASS: '',
      MAIL_FROM: '',
      WEB_API_SECRET: '   ',
    });
    expect(env.SMTP_HOST).toBeUndefined();
    expect(env.MAIL_FROM).toBeUndefined();
    expect(env.MEDIA_STORAGE).toBe('local');
    expect(env.PORT).toBe(4000);
  });

  it('zorunlu ayar boşsa yine hata verir', () => {
    expect(() => validateEnv({ ...base, JWT_SECRET: '' })).toThrow();
  });

  it('dolu ama geçersiz değer yine reddedilir', () => {
    expect(() => validateEnv({ ...base, MAIL_FROM: 'eposta-degil' })).toThrow();
    expect(() => validateEnv({ ...base, MEDIA_STORAGE: 'cloudinary' })).toThrow();
  });
});
