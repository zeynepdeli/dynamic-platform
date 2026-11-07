import {
  Award,
  BadgeCheck,
  Clock,
  Headphones,
  Heart,
  Leaf,
  type LucideIcon,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  Users,
  Wrench,
} from "lucide-react";

import { getIcon } from "../site/icons";

/**
 * ✏️ MÜŞTERİYE ÖZEL: Kartlarda admin'den yazılabilen ikon isimleri.
 * Admin'de kartın "İkon" alanına buradaki anahtarlardan biri yazılır.
 * Listede olmayan isim yazılırsa ikon gösterilmez (güvenli).
 */
export const ICONS: Record<string, LucideIcon> = {
  award: Award,
  "badge-check": BadgeCheck,
  clock: Clock,
  headphones: Headphones,
  heart: Heart,
  leaf: Leaf,
  "map-pin": MapPin,
  phone: Phone,
  "shield-check": ShieldCheck,
  sparkles: Sparkles,
  star: Star,
  truck: Truck,
  users: Users,
  wrench: Wrench,
};

export function CardIcon({ name, className }: { name: string | null; className?: string }) {
  // Önce müşteriye özel set, yoksa admin'deki ikon seçicinin seti
  const Icon = name && Object.hasOwn(ICONS, name) ? ICONS[name] : getIcon("menu", name)?.Icon;
  return Icon ? <Icon className={className} aria-hidden="true" /> : null;
}
