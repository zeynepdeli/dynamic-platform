import { z } from 'zod';

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),

    PORT: z.coerce.number().int().min(1).max(65535).default(4000),

    DATABASE_URL: z
      .string()
      .min(1, 'DATABASE_URL zorunludur')
      .startsWith('postgresql://', {
        message: 'DATABASE_URL PostgreSQL bağlantısı olmalıdır',
      }),

    JWT_SECRET: z.string().min(64, 'JWT_SECRET en az 64 karakter olmalıdır'),

    FRONTEND_URL: z.string().url('FRONTEND_URL geçerli bir URL olmalıdır'),

    // API önünde kaç adet güvenilir proxy var (0 = yok).
    TRUST_PROXY_HOPS: z.coerce.number().int().min(0).max(5).default(0),

    // Görsellerin saklanacağı yer: local (sunucu diski) | cloudinary
    MEDIA_STORAGE: z.enum(['local', 'cloudinary']).default('local'),
    CLOUDINARY_CLOUD_NAME: z
      .string()
      .regex(/^[a-z0-9_-]{1,64}$/i, 'CLOUDINARY_CLOUD_NAME geçersiz')
      .optional(),
    CLOUDINARY_API_KEY: z.string().regex(/^\d{6,20}$/, 'CLOUDINARY_API_KEY geçersiz').optional(),
    CLOUDINARY_API_SECRET: z.string().min(10).optional(),
    CLOUDINARY_FOLDER: z
      .string()
      .regex(/^[a-z0-9_-]{1,64}$/i, 'CLOUDINARY_FOLDER yalnızca harf, rakam, - ve _ içerebilir')
      .default('dynamic-platform'),

    // ───── E-posta (SMTP) — boşsa e-posta gönderilmez ─────
    SMTP_HOST: z.string().min(1).optional(),
    SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(587),
    // true: 465 (SSL) · false: 587 (STARTTLS)
    SMTP_SECURE: z.enum(['true', 'false']).default('false'),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    MAIL_FROM: z.string().email('MAIL_FROM geçerli bir e-posta olmalıdır').optional(),

    // Web sitesi ↔ API ortak gizli anahtar (iletişim formunda ziyaretçi IP'si için)
    WEB_API_SECRET: z.string().min(32, 'WEB_API_SECRET en az 32 karakter olmalıdır').optional(),

    // ───── Modüller (müşteriye göre açılıp kapanır) ─────
    // E-ticaret: ürün, kategori (ileride sepet, sipariş, ödeme)
    COMMERCE_ENABLED: z.enum(['true', 'false']).default('false'),
  })
  .superRefine((env, ctx) => {
    if (env.SMTP_HOST && !env.MAIL_FROM) {
      ctx.addIssue({ code: 'custom', path: ['MAIL_FROM'], message: 'SMTP_HOST tanımlıysa MAIL_FROM zorunludur' });
    }

    if (env.MEDIA_STORAGE === 'cloudinary') {
      for (const key of ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'] as const) {
        if (!env[key]) {
          ctx.addIssue({ code: 'custom', path: [key], message: `MEDIA_STORAGE=cloudinary için ${key} zorunludur` });
        }
      }
    }

    if (
      env.NODE_ENV === 'production' &&
      !env.FRONTEND_URL.startsWith('https://')
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['FRONTEND_URL'],
        message: 'Production ortamında FRONTEND_URL HTTPS kullanmalıdır',
      });
    }
  });

export function validateEnv(config: Record<string, unknown>) {
  return envSchema.parse(config);
}
