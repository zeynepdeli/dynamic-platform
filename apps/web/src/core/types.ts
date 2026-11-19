// API'nin ziyaretçiye açık uçlarından dönen veri tipleri.

export type SiteSettings = {
  siteName: string;
  description: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  backgroundImage: string | null;
  homeBackgroundColor: string | null;
  homeBackgroundImage: string | null;
  headerBackgroundColor: string | null;
  headerBackgroundImage: string | null;
  headerButtonText: string | null;
  headerButtonHref: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  ogImageUrl: string | null;
  allowIndexing: boolean;
  gaMeasurementId: string | null;
};

export type MenuItem = {
  id: string;
  label: string;
  href: string;
  icon: string | null;
  order: number;
  parentId: string | null;
  location: "HEADER" | "FOOTER";
};

export type MenuNode = MenuItem & { children: MenuItem[] };

export type HeroSlide = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  imageUrl: string | null;
  mobileImageUrl: string | null;
  /** Arka planın önünde duran görsel (dekupe kişi/ürün) */
  foregroundImageUrl: string | null;
  buttonText: string | null;
  buttonHref: string | null;
};

export type FooterSettings = {
  enabled: boolean;
  backgroundColor: string | null;
  backgroundImage: string | null;
  description: string | null;
  copyright: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
};

export type SocialLink = {
  id: string;
  icon: string;
  label: string | null;
  url: string;
};

export type SectionType =
  | "CARDS"
  | "TEXT"
  | "IMAGE_TEXT"
  | "CTA"
  | "FAQ"
  | "GALLERY"
  | "VIDEO"
  | "MAP"
  | "STATS"
  | "CONTACT_FORM"
  | "LOGOS"
  | "TEAM"
  | "TESTIMONIALS";

export type SectionItem = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  icon: string | null;
  buttonText: string | null;
  buttonHref: string | null;
  backgroundColor: string | null;
  backgroundImage: string | null;
  /** Ekip: unvan · Yorum: şirket/unvan */
  subtitle: string | null;
  /** Yorum puanı (1–5) */
  rating: number | null;
  /** Dış bağlantı (https) — logo için marka sitesi, ekip için profil */
  linkUrl: string | null;
};

export type Section = {
  id: string;
  key: string | null;
  type: SectionType;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  backgroundColor: string | null;
  backgroundImage: string | null;
  textColor: string | null;
  buttonText: string | null;
  buttonHref: string | null;
  columns: number;
  videoUrl: string | null;
  mapAddress: string | null;
  items: SectionItem[];
};

export type Page = {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  ogImageUrl: string | null;
  noIndex: boolean;
  backgroundColor: string | null;
  backgroundImage: string | null;
  updatedAt: string;
};

export type SiteBootstrap = {
  settings: SiteSettings;
  menuItems: MenuItem[];
  heroSlides: HeroSlide[];
  footer: FooterSettings;
  homeSections: Section[];
  socialLinks: SocialLink[];
  /** Görsel adresi → açıklama (admin → Medya) */
  mediaAlts: Record<string, string>;
};

/** Blog listesindeki yazı (içerik hariç) */
export type PostSummary = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  category: string | null;
  publishedAt: string;
  updatedAt: string;
  /** Her açık dildeki adresi: { tr: "/blog/merhaba", en: "/en/blog/hello" } */
  alternates: Record<string, string>;
};

export type Post = PostSummary & {
  content: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
};

export type PostPage = {
  items: PostSummary[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};
