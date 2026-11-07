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

/** Bölüm formundaki alanlar */
export type SectionField =
  | "title"
  | "subtitle"
  | "body"
  | "backgroundColor"
  | "textColor"
  | "backgroundImage"
  | "buttonText"
  | "buttonHref"
  | "columns";

/** Kart formundaki alanlar */
export type ItemField =
  | "title"
  | "description"
  | "imageUrl"
  | "icon"
  | "backgroundColor"
  | "backgroundImage"
  | "buttonText"
  | "buttonHref";

/**
 * Alan adlarını tasarıma göre değiştir ya da gizle:
 *   { backgroundImage: "Vizyon Ana Görsel", textColor: false }
 * string → alanın admin'deki adı, false → alan gizlenir.
 */
export type FieldConfig<F extends string> = Partial<Record<F, string | false>>;

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
  /** Bölüm alanlarının adları / gizlenecek alanlar */
  fields?: FieldConfig<SectionField>;
  /** Kart alanlarının adları / gizlenecek alanlar (Kart bölümlerinde) */
  itemFields?: FieldConfig<ItemField>;
  /** Kartlara verilecek ad (ör. "Değer", "Hizmet"). Varsayılan: "Kart" */
  itemLabel?: string;
};

export type PageTemplate = {
  /** Dashboard'da sayfa kartının altında görünen açıklama */
  description?: string;
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
  //   description: "Vizyon, misyon ve değerlerimiz",
  //   allowExtraSections: false,
  //   sections: [
  //     {
  //       key: "vizyon",
  //       label: "Vizyonumuz",
  //       type: "IMAGE_TEXT",
  //       // Alan adları tasarıma göre; gereksizler gizli
  //       fields: {
  //         backgroundImage: "Vizyon Ana Görsel",
  //         body: "Vizyon Metni",
  //         subtitle: false,
  //         textColor: false,
  //       },
  //     },
  //     { key: "misyon", label: "Misyonumuz", type: "IMAGE_TEXT" },
  //     {
  //       key: "degerler",
  //       label: "Değerlerimiz",
  //       type: "CARDS",
  //       itemLabel: "Değer",
  //       itemFields: { imageUrl: "Mini Görsel", buttonText: false, buttonHref: false },
  //     },
  //   ],
  // },
};
