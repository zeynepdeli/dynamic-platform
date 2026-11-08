/**
 * Hangi modüllerin açık olduğu. Ortam değişkeninden okunur; değiştirmek için
 * .env'i güncelleyip API'yi yeniden başlatın. Kapalı modülün uçları HİÇ
 * yüklenmez (saldırı yüzeyi küçülür), yalnızca veritabanı tabloları durur.
 */
export type Features = { commerce: boolean };

export function readFeatures(env: NodeJS.ProcessEnv = process.env): Features {
  return { commerce: env.COMMERCE_ENABLED === 'true' };
}
