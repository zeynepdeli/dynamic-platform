import { PanelTop } from "lucide-react";

import { AreaCard, AreaShell } from "@/components/areas/AreaShell";
import { SettingsForm } from "@/components/areas/SettingsForm";
import { MenuItemDialog } from "@/components/menu/MenuItemDialog";
import { MenuTree } from "@/components/menu/MenuTree";
import { buildMenuTree, getAdminMenuItems } from "@/lib/menu";
import { getMediaBaseUrl } from "@/lib/media-base-url";
import { getSiteSettings, pickSettings } from "@/lib/site-settings";

export default async function HeaderAreaPage() {
  const [settings, menuItems] = await Promise.all([getSiteSettings(), getAdminMenuItems()]);
  const tree = buildMenuTree(menuItems, "HEADER");

  return (
    <AreaShell
      icon={PanelTop}
      title="Header Yönetimi"
      description="Sitenin en üstündeki alan: site adı, logo, arka plan, buton ve menü linkleri."
      shared
    >
      <SettingsForm
        group="header"
        submitLabel="Header Ayarlarını Kaydet"
        mediaBaseUrl={getMediaBaseUrl()}
        initialValues={pickSettings(settings, [
          "siteName",
          "logoUrl",
          "headerBackgroundColor",
          "headerBackgroundImage",
          "headerButtonText",
          "headerButtonHref",
        ])}
        panels={[
          {
            title: "Genel Header Ayarları",
            fields: [
              { name: "siteName", label: "Site Adı", kind: "text", required: true, description: "Logo yoksa header'da bu yazı görünür." },
              { name: "logoUrl", label: "Logo", kind: "image" },
            ],
          },
          {
            title: "Header Arka Planı",
            hint: "Renk her zaman uygulanır; fotoğraf seçilirse rengin üstünde görünür.",
            fields: [
              { name: "headerBackgroundColor", label: "Arka Plan Rengi", kind: "color-optional", description: "Boşsa tema ana rengi kullanılır." },
              { name: "headerBackgroundImage", label: "Arka Plan Fotoğrafı", kind: "image" },
            ],
          },
          {
            title: "Header Butonu",
            hint: "Menünün sağında öne çıkan buton (ör. Teklif Al). Boş bırakılırsa gösterilmez.",
            fields: [
              { name: "headerButtonText", label: "Buton Yazısı", kind: "text", placeholder: "Teklif Al" },
              { name: "headerButtonHref", label: "Buton Bağlantısı", kind: "text", placeholder: "/iletisim" },
            ],
          },
        ]}
      />

      <AreaCard
        title="Menü Linkleri"
        hint="En fazla 2 seviye. İkon seçmek için linki düzenleyin."
        action={<MenuItemDialog mode="create" location="HEADER" parents={tree.map((n) => ({ id: n.id, label: n.label }))} />}
      >
        <MenuTree tree={tree} location="HEADER" />
      </AreaCard>
    </AreaShell>
  );
}
