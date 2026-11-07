import type { ComponentType, SVGProps } from "react";
import {
  siAirbnb,
  siBehance,
  siBluesky,
  siDiscord,
  siDribbble,
  siEtsy,
  siFacebook,
  siGithub,
  siGooglemaps,
  siInstagram,
  siLinktree,
  siMedium,
  siPinterest,
  siSnapchat,
  siSpotify,
  siTelegram,
  siThreads,
  siTiktok,
  siTripadvisor,
  siTwitch,
  siVimeo,
  siWhatsapp,
  siX,
  siYoutube,
} from "simple-icons";
import {
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  Camera,
  CircleHelp,
  Coffee,
  FileText,
  Gift,
  Globe,
  GraduationCap,
  Heart,
  Home,
  Image,
  Info,
  Leaf,
  Mail,
  MapPin,
  MessageCircle,
  Newspaper,
  Package,
  Phone,
  ShoppingBag,
  ShoppingCart,
  Star,
  Tag,
  Truck,
  Users,
  UtensilsCrossed,
  Wrench,
} from "lucide-react";

/**
 * İkon kayıtları. Anahtarlar API whitelist'iyle aynı olmalı:
 * apps/api/src/common/icons.ts
 */

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

// simple-icons yol verisinden (yalnızca derleme zamanında gelen sabit veri) ikon
function brand(path: string): IconComponent {
  function BrandIcon(props: SVGProps<SVGSVGElement>) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
        <path d={path} />
      </svg>
    );
  }
  return BrandIcon;
}

// LinkedIn simple-icons'ta yok: sade "in" rozeti
function LinkedinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M4 2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm1.5 7.5V19h3V9.5h-3ZM7 4.75a1.75 1.75 0 1 0 0 3.5 1.75 1.75 0 0 0 0-3.5ZM10.5 9.5V19h3v-5c0-1.4.6-2.3 1.8-2.3 1.1 0 1.7.8 1.7 2.3v5h3v-5.6c0-2.8-1.5-4.1-3.5-4.1-1.5 0-2.5.7-3 1.6V9.5h-3Z" />
    </svg>
  );
}

export type IconEntry = { label: string; Icon: IconComponent };

export const SOCIAL_ICONS = {
  instagram: { label: "Instagram", Icon: brand(siInstagram.path) },
  facebook: { label: "Facebook", Icon: brand(siFacebook.path) },
  x: { label: "X (Twitter)", Icon: brand(siX.path) },
  linkedin: { label: "LinkedIn", Icon: LinkedinIcon },
  youtube: { label: "YouTube", Icon: brand(siYoutube.path) },
  tiktok: { label: "TikTok", Icon: brand(siTiktok.path) },
  whatsapp: { label: "WhatsApp", Icon: brand(siWhatsapp.path) },
  telegram: { label: "Telegram", Icon: brand(siTelegram.path) },
  pinterest: { label: "Pinterest", Icon: brand(siPinterest.path) },
  threads: { label: "Threads", Icon: brand(siThreads.path) },
  bluesky: { label: "Bluesky", Icon: brand(siBluesky.path) },
  github: { label: "GitHub", Icon: brand(siGithub.path) },
  spotify: { label: "Spotify", Icon: brand(siSpotify.path) },
  discord: { label: "Discord", Icon: brand(siDiscord.path) },
  behance: { label: "Behance", Icon: brand(siBehance.path) },
  dribbble: { label: "Dribbble", Icon: brand(siDribbble.path) },
  medium: { label: "Medium", Icon: brand(siMedium.path) },
  twitch: { label: "Twitch", Icon: brand(siTwitch.path) },
  snapchat: { label: "Snapchat", Icon: brand(siSnapchat.path) },
  vimeo: { label: "Vimeo", Icon: brand(siVimeo.path) },
  googlemaps: { label: "Google Haritalar", Icon: brand(siGooglemaps.path) },
  tripadvisor: { label: "Tripadvisor", Icon: brand(siTripadvisor.path) },
  airbnb: { label: "Airbnb", Icon: brand(siAirbnb.path) },
  etsy: { label: "Etsy", Icon: brand(siEtsy.path) },
  linktree: { label: "Linktree", Icon: brand(siLinktree.path) },
  website: { label: "Web sitesi", Icon: Globe },
} satisfies Record<string, IconEntry>;

export const MENU_ICONS = {
  home: { label: "Ev", Icon: Home },
  info: { label: "Bilgi", Icon: Info },
  briefcase: { label: "Çanta", Icon: Briefcase },
  users: { label: "Ekip", Icon: Users },
  phone: { label: "Telefon", Icon: Phone },
  mail: { label: "E-posta", Icon: Mail },
  "map-pin": { label: "Konum", Icon: MapPin },
  "shopping-bag": { label: "Alışveriş", Icon: ShoppingBag },
  "shopping-cart": { label: "Sepet", Icon: ShoppingCart },
  package: { label: "Paket", Icon: Package },
  truck: { label: "Kargo", Icon: Truck },
  wrench: { label: "Servis", Icon: Wrench },
  star: { label: "Yıldız", Icon: Star },
  heart: { label: "Kalp", Icon: Heart },
  image: { label: "Galeri", Icon: Image },
  "file-text": { label: "Belge", Icon: FileText },
  newspaper: { label: "Haberler", Icon: Newspaper },
  "book-open": { label: "Blog", Icon: BookOpen },
  calendar: { label: "Takvim", Icon: Calendar },
  "help-circle": { label: "Yardım", Icon: CircleHelp },
  "message-circle": { label: "Mesaj", Icon: MessageCircle },
  tag: { label: "Etiket", Icon: Tag },
  gift: { label: "Hediye", Icon: Gift },
  globe: { label: "Dünya", Icon: Globe },
  building: { label: "Kurumsal", Icon: Building2 },
  "graduation-cap": { label: "Eğitim", Icon: GraduationCap },
  utensils: { label: "Yemek", Icon: UtensilsCrossed },
  coffee: { label: "Kafe", Icon: Coffee },
  camera: { label: "Fotoğraf", Icon: Camera },
  leaf: { label: "Doğal", Icon: Leaf },
} satisfies Record<string, IconEntry>;

export type SocialIconKey = keyof typeof SOCIAL_ICONS;
export type MenuIconKey = keyof typeof MENU_ICONS;

export const SOCIAL_ICON_KEYS = Object.keys(SOCIAL_ICONS) as [
  SocialIconKey,
  ...SocialIconKey[],
];
export const MENU_ICON_KEYS = Object.keys(MENU_ICONS) as [
  MenuIconKey,
  ...MenuIconKey[],
];

export function getIcon(
  kind: "social" | "menu",
  key: string | null | undefined,
): IconEntry | null {
  if (!key) return null;
  const set: Record<string, IconEntry> = kind === "social" ? SOCIAL_ICONS : MENU_ICONS;
  return Object.hasOwn(set, key) ? set[key] : null;
}
