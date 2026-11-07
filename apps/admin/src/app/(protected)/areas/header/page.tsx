import { PanelTop } from "lucide-react";

import { AreaCard, AreaShell } from "@/components/areas/AreaShell";
import { MenuItemDialog } from "@/components/menu/MenuItemDialog";
import { MenuTree } from "@/components/menu/MenuTree";
import { HeaderBrandingForm } from "@/components/outline/HeaderBlock";
import { buildMenuTree, getAdminMenuItems } from "@/lib/menu";
import { getMediaBaseUrl } from "@/lib/media-base-url";
import { getSiteSettings } from "@/lib/site-settings";

export default async function HeaderAreaPage() {
  const [settings, menuItems] = await Promise.all([getSiteSettings(), getAdminMenuItems()]);
  const tree = buildMenuTree(menuItems);

  return (
    <AreaShell icon={PanelTop} title="Header" description="Sitenin en üstü: site adı, logo ve menü.">
      <AreaCard title="Site adı ve logo">
        <HeaderBrandingForm
          initialValues={{ siteName: settings.siteName, logoUrl: settings.logoUrl ?? "" }}
          mediaBaseUrl={getMediaBaseUrl()}
        />
      </AreaCard>

      <AreaCard
        title="Menü"
        hint="En fazla 2 seviye. İkon seçmek için öğeyi düzenleyin."
        action={<MenuItemDialog mode="create" parents={tree.map((n) => ({ id: n.id, label: n.label }))} />}
      >
        <MenuTree tree={tree} />
      </AreaCard>
    </AreaShell>
  );
}
