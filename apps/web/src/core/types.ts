// API'nin ziyaretçiye açık uçlarından dönen veri tipleri.

export type SiteSettings = {
  siteName: string;
  description: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  backgroundType: "COLOR" | "IMAGE";
  backgroundColor: string;
  backgroundImage: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
};

export type MenuItem = {
  id: string;
  label: string;
  href: string;
  order: number;
  parentId: string | null;
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
  description: string | null;
  copyright: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  linkedinUrl: string | null;
  youtubeUrl: string | null;
  githubUrl: string | null;
};

export type SectionType = "CARDS" | "TEXT" | "IMAGE_TEXT" | "CTA";

export type SectionItem = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  icon: string | null;
  buttonText: string | null;
  buttonHref: string | null;
  backgroundColor: string | null;
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
  updatedAt: string;
};

export type SiteBootstrap = {
  settings: SiteSettings;
  menuItems: MenuItem[];
  heroSlides: HeroSlide[];
  footer: FooterSettings;
  homeSections: Section[];
};
