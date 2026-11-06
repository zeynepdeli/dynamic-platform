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
  })
  .superRefine((env, ctx) => {
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
