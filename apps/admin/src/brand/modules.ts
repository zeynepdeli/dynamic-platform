import type { PageTemplate } from "./page-templates";

/**
 * ✏️ MÜŞTERİYE ÖZEL: Dashboard'daki hazır modüller (enfesGurme'deki gibi
 * kendi yönetim ekranı olan sayfalar). Müşteride istemediğinizi silin.
 *
 * Her modül arka planda normal bir sayfadır (adres: /slug); bölümleri
 * kilitlidir ve yalnızca modül ekranından düzenlenir.
 */
export type ModuleDefinition = {
  key: string;
  /** Dashboard kutucuğu ve ekran başlığı */
  title: string;
  description: string;
  icon: "faq" | "contact" | "gallery";
  /** Sitedeki adres: /sss */
  slug: string;
  /** Kurulumda oluşturulacak sayfanın başlığı (menüde de bu görünür) */
  pageTitle: string;
  template: PageTemplate;
};

export const MODULES: ModuleDefinition[] = [
  {
    key: "sss",
    title: "SSS Yönetimi",
    description: "Sıkça sorulan sorular sayfası",
    icon: "faq",
    slug: "sss",
    pageTitle: "Sıkça Sorulan Sorular",
    template: {
      allowExtraSections: false,
      sections: [
        {
          key: "sorular",
          label: "Sorular",
          type: "FAQ",
          itemLabel: "Soru",
          fields: {
            columns: false,
            buttonText: false,
            buttonHref: false,
            body: "Giriş Metni",
          },
        },
      ],
    },
  },
  {
    key: "iletisim",
    title: "İletişim Yönetimi",
    description: "Adres, harita ve iletişim formu",
    icon: "contact",
    slug: "iletisim",
    pageTitle: "İletişim",
    template: {
      allowExtraSections: false,
      sections: [
        {
          key: "harita",
          label: "Adres ve Harita",
          type: "MAP",
          fields: { body: "Açıklama (ör. çalışma saatleri)" },
        },
        {
          key: "form",
          label: "İletişim Formu",
          type: "CONTACT_FORM",
          fields: { body: "Formun yanındaki metin" },
        },
      ],
    },
  },
  {
    key: "galeri",
    title: "Galeri Yönetimi",
    description: "Fotoğraf galerisi sayfası",
    icon: "gallery",
    slug: "galeri",
    pageTitle: "Galeri",
    template: {
      allowExtraSections: false,
      sections: [
        {
          key: "fotograflar",
          label: "Fotoğraflar",
          type: "GALLERY",
          itemLabel: "Görsel",
          fields: { body: "Giriş Metni" },
        },
      ],
    },
  },
];

export const moduleByKey = (key: string) => MODULES.find((m) => m.key === key);
export const moduleBySlug = (slug: string) =>
  MODULES.find((m) => m.slug === slug);
