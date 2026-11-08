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
  | "CONTACT_FORM";

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
