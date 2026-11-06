const API_URL = process.env.API_URL;

export type SiteSettings = {
  id: string;
  siteName: string;
  description: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  backgroundType: string;
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
  visible: boolean;
  parentId: string | null;
};

export type HeroSlide = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  imageUrl: string | null;
  mobileImageUrl: string | null;
  buttonText: string | null;
  buttonHref: string | null;
  order: number;
  active: boolean;
};

export type FooterSettings = {
  id: string;
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
  enabled: boolean;
};

export type SiteBootstrap = {
  settings: SiteSettings;
  menuItems: MenuItem[];
  heroSlides: HeroSlide[];
  footer: FooterSettings;
};

export async function getSiteBootstrap(): Promise<SiteBootstrap> {
  if (!API_URL) {
    throw new Error("API_URL ortam değişkeni tanımlanmamış.");
  }

  const response = await fetch(`${API_URL}/site/bootstrap`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Site verileri alınamadı. HTTP: ${response.status}`);
  }

  return (await response.json()) as SiteBootstrap;
}
