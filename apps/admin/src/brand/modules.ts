import type { PageTemplate } from "./page-templates";

/**
 * ✏️ MÜŞTERİYE ÖZEL: Dashboard'daki hazır modüller (enfesGurme'deki gibi
 * kendi yönetim ekranı olan sayfalar). Müşteride istemediğinizi silin.
 *
 * Her modül arka planda normal bir sayfadır (adres: /slug); bölümleri
 * kilitlidir ve yalnızca modül ekranından düzenlenir.
 *
 * Kurulmayan modül sitede hiçbir şey oluşturmaz: dashboard'da "Kur" diyene
 * kadar yalnızca kutucuk olarak durur. Aynı adreste sayfa zaten varsa modül
 * o sayfayı sahiplenir (içeriği silinmez, eksik bölümler eklenir).
 */
export type ModuleDefinition = {
  key: string;
  /** Dashboard kutucuğu ve ekran başlığı */
  title: string;
  description: string;
  icon: "faq" | "contact" | "gallery" | "about" | "team" | "brands" | "testimonials";
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
  {
    key: "hakkimizda",
    title: "Hakkımızda Yönetimi",
    description: "Hikâye, misyon-vizyon-değerler ve rakamlar",
    icon: "about",
    slug: "hakkimizda",
    pageTitle: "Hakkımızda",
    template: {
      allowExtraSections: false,
      sections: [
        {
          key: "hikaye",
          label: "Hikâyemiz",
          type: "IMAGE_TEXT",
          fields: { body: "Metin", backgroundImage: "Görsel", columns: false },
        },
        {
          key: "degerler",
          label: "Misyon, Vizyon ve Değerler",
          type: "CARDS",
          itemLabel: "Madde",
          fields: { body: "Giriş Metni", buttonText: false, buttonHref: false },
          itemFields: {
            title: "Başlık (ör. Misyonumuz)",
            description: "Metin",
            icon: "İkon (isteğe bağlı)",
            imageUrl: false,
            buttonText: false,
            buttonHref: false,
            backgroundColor: false,
            backgroundImage: false,
          },
        },
        {
          key: "rakamlar",
          label: "Rakamlarla Biz",
          type: "STATS",
          itemLabel: "Sayı",
          fields: { body: "Giriş Metni" },
        },
      ],
    },
  },
  {
    key: "ekibimiz",
    title: "Ekip Yönetimi",
    description: "Ekip üyeleri, unvanlar ve fotoğraflar",
    icon: "team",
    slug: "ekibimiz",
    pageTitle: "Ekibimiz",
    template: {
      allowExtraSections: false,
      sections: [
        {
          key: "ekip",
          label: "Ekip",
          type: "TEAM",
          itemLabel: "Kişi",
          fields: { body: "Giriş Metni" },
        },
      ],
    },
  },
  {
    key: "referanslar",
    title: "Markalar / Referanslar",
    description: "Çalışılan markaların logoları",
    icon: "brands",
    slug: "referanslar",
    pageTitle: "Referanslar",
    template: {
      allowExtraSections: false,
      sections: [
        {
          key: "logolar",
          label: "Logolar",
          type: "LOGOS",
          itemLabel: "Logo",
          fields: { body: "Giriş Metni" },
        },
      ],
    },
  },
  {
    key: "yorumlar",
    title: "Yorum Yönetimi",
    description: "Müşteri yorumları ve puanlar",
    icon: "testimonials",
    slug: "yorumlar",
    pageTitle: "Müşteri Yorumları",
    template: {
      allowExtraSections: false,
      sections: [
        {
          key: "yorumlar",
          label: "Yorumlar",
          type: "TESTIMONIALS",
          itemLabel: "Yorum",
          fields: { body: "Giriş Metni" },
        },
      ],
    },
  },
];

export const moduleByKey = (key: string) => MODULES.find((m) => m.key === key);
export const moduleBySlug = (slug: string) =>
  MODULES.find((m) => m.slug === slug);
