import type { SectionType } from "@/lib/validations/section.schema";

/**
 * ─────────────────────────────────────────────────────────────
 *  MÜŞTERİYE ÖZEL DOSYA
 *  Çekirdek (dynamic-platform) bu dosyayı ilk sürümden sonra
 *  değiştirmez; müşteri projesinde serbestçe düzenleyebilirsin.
 * ─────────────────────────────────────────────────────────────
 *
 * Sayfa şablonları, frontend tasarımının beklediği bölümleri tanımlar.
 * Admin bu bölümleri anlamlı isimleriyle gösterir, eksik olanları
 * "Oluştur" butonuyla ekletir ve kilitli bölümlerin silinmesini /
 * tipinin değiştirilmesini engeller.
 *
 * Frontend (apps/web) bölümü anahtarıyla bulur:
 *   page.section("vizyon")
 *
 * Anahtar kuralı: küçük harf, rakam ve tire (ör. "vizyon", "hizmetler-2").
 *
 * Not: Kilit, müşterinin tasarımı yanlışlıkla bozmasını önleyen bir
 * KULLANICI DENEYİMİ önlemidir; güvenlik sınırı değildir. Yetki
 * kontrolü her zaman API'de yapılır.
 */

export type TemplateSection = {
  /** Frontend'in bölümü bulduğu anahtar. Sayfa içinde benzersiz olmalı. */
  key: string;
  /** Admin'de görünen isim (ör. "Vizyonumuz") */
  label: string;
  type: SectionType;
  /** Admin'de bölümün altında görünen kısa açıklama */
  hint?: string;
  /** true (varsayılan): silinemez, tipi ve anahtarı değiştirilemez */
  locked?: boolean;
};

export type PageTemplate = {
  sections: TemplateSection[];
  /** Şablon dışında serbest bölüm eklenebilsin mi? (varsayılan: true) */
  allowExtraSections?: boolean;
};

/**
 * Anahtar: "home" = Ana Sayfa, diğerleri sayfanın slug'ı (ör. "hakkimizda").
 * Şablonu olmayan sayfalarda bölümler tamamen serbesttir.
 */
export const pageTemplates: Record<string, PageTemplate> = {
  // ÖRNEK — müşteri projesinde yorum satırlarını kaldırıp düzenle:
  //
  // home: {
  //   sections: [
  //     { key: "hizmetler", label: "Hizmetlerimiz", type: "CARDS", hint: "3 veya 4 kart önerilir" },
  //     { key: "neden-biz", label: "Neden Biz?", type: "IMAGE_TEXT" },
  //     { key: "iletisim-cagrisi", label: "İletişim Çağrısı", type: "CTA" },
  //   ],
  // },
  //
  // hakkimizda: {
  //   allowExtraSections: false,
  //   sections: [
  //     { key: "vizyon", label: "Vizyonumuz", type: "IMAGE_TEXT" },
  //     { key: "misyon", label: "Misyonumuz", type: "IMAGE_TEXT" },
  //     { key: "degerler", label: "Değerlerimiz", type: "CARDS" },
  //   ],
  // },
};
