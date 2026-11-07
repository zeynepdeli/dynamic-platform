import { PanelBottom } from "lucide-react";

import { AreaCard, AreaShell } from "@/components/areas/AreaShell";
import { SettingsForm } from "@/components/areas/SettingsForm";
import { MenuItemDialog } from "@/components/menu/MenuItemDialog";
import { MenuTree } from "@/components/menu/MenuTree";
import { SocialLinksEditor } from "@/components/settings/SocialLinksEditor";
import { getFooterFormValues } from "@/lib/footer";
import { buildMenuTree, getAdminMenuItems } from "@/lib/menu";
import { getMediaBaseUrl } from "@/lib/media-base-url";
import { getAdminSocialLinks } from "@/lib/social-links";

export default async function FooterAreaPage() {
  const [footer, socialLinks, menuItems] = await Promise.all([
    getFooterFormValues(),
    getAdminSocialLinks(),
    getAdminMenuItems(),
  ]);
  const links = buildMenuTree(menuItems, "FOOTER");

  return (
    <AreaShell
      icon={PanelBottom}
      title="Footer Yönetimi"
      description="Sitenin en altındaki alan: marka yazısı, iletişim bilgileri, linkler, sosyal medya ve telif."
      shared
    >
      <SettingsForm
        group="footer"
        submitLabel="Footer Ayarlarını Kaydet"
        mediaBaseUrl={getMediaBaseUrl()}
        initialValues={footer}
        panels={[
          {
            title: "Genel Footer Ayarları",
            fields: [
              { name: "enabled", label: "Footer gösterilsin", kind: "switch", description: "Kapalıysa sitenin alt kısmı gösterilmez.", wide: true },
              { name: "backgroundColor", label: "Arka Plan Rengi", kind: "color-optional", description: "Boşsa tema ana rengi kullanılır." },
              { name: "backgroundImage", label: "Arka Plan Fotoğrafı", kind: "image" },
            ],
          },
          {
            title: "Marka Alanı",
            fields: [{ name: "description", label: "Kısa Açıklama", kind: "textarea", description: "Site adının altında görünür.", wide: true }],
          },
          {
            title: "Footer İletişim Bilgileri",
            fields: [
              { name: "email", label: "E-posta", kind: "text", placeholder: "info@siteadi.com" },
              { name: "phone", label: "Telefon", kind: "text", placeholder: "+90 212 000 00 00" },
              { name: "address", label: "Adres", kind: "textarea", wide: true },
            ],
          },
          {
            title: "Telif Yazısı",
            fields: [{ name: "copyright", label: "Telif Metni", kind: "text", placeholder: "© 2026 Site Adı", wide: true }],
          },
        ]}
      />

      <AreaCard
        title="Footer Linkleri"
        hint="Footer'da listelenen site içi linkler (ör. Gizlilik, KVKK). Tek seviye."
        action={<MenuItemDialog mode="create" location="FOOTER" parents={[]} triggerLabel="Link Ekle" />}
      >
        <MenuTree tree={links} location="FOOTER" />
      </AreaCard>

      <AreaCard title="Footer Sosyal Medya" hint="Footer'da ikon olarak görünür.">
        <SocialLinksEditor links={socialLinks} />
      </AreaCard>
    </AreaShell>
  );
}
