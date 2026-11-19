import { BadgeCheck, CircleHelp, Images, Info, Mail, MessageSquareQuote, Users } from "lucide-react";

import type { ModuleDefinition } from "@/brand/modules";

export const MODULE_ICONS: Record<
  ModuleDefinition["icon"],
  React.ComponentType<{ className?: string }>
> = {
  faq: CircleHelp,
  contact: Mail,
  gallery: Images,
  about: Info,
  team: Users,
  brands: BadgeCheck,
  testimonials: MessageSquareQuote,
};
