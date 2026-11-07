/**
 * İzin verilen ikon anahtarları (whitelist).
 * Veritabanına yalnızca bu anahtarlar yazılır; SVG/HTML asla saklanmaz.
 *
 * ⚠️ Admin (components/icons/registry.tsx) ve web (components/site/icons.tsx)
 * aynı listeyi kullanır. Yeni ikon eklerken üçünü birlikte güncelleyin.
 */
export const SOCIAL_ICON_KEYS = [
  'instagram',
  'facebook',
  'x',
  'linkedin',
  'youtube',
  'tiktok',
  'whatsapp',
  'telegram',
  'pinterest',
  'threads',
  'bluesky',
  'github',
  'spotify',
  'discord',
  'behance',
  'dribbble',
  'medium',
  'twitch',
  'snapchat',
  'vimeo',
  'googlemaps',
  'tripadvisor',
  'airbnb',
  'etsy',
  'linktree',
  'website',
] as const;

export const MENU_ICON_KEYS = [
  'home',
  'info',
  'briefcase',
  'users',
  'phone',
  'mail',
  'map-pin',
  'shopping-bag',
  'shopping-cart',
  'package',
  'truck',
  'wrench',
  'star',
  'heart',
  'image',
  'file-text',
  'newspaper',
  'book-open',
  'calendar',
  'help-circle',
  'message-circle',
  'tag',
  'gift',
  'globe',
  'building',
  'graduation-cap',
  'utensils',
  'coffee',
  'camera',
  'leaf',
] as const;

export type SocialIconKey = (typeof SOCIAL_ICON_KEYS)[number];
export type MenuIconKey = (typeof MENU_ICON_KEYS)[number];
