import { CircleHelp, Images, Mail } from "lucide-react";

import type { ModuleDefinition } from "@/brand/modules";

export const MODULE_ICONS: Record<
  ModuleDefinition["icon"],
  React.ComponentType<{ className?: string }>
> = {
  faq: CircleHelp,
  contact: Mail,
  gallery: Images,
};
