import { PanelBottom } from "lucide-react";

import { AreaCard, AreaShell } from "@/components/areas/AreaShell";
import { FooterForm } from "@/components/settings/FooterForm";
import { SocialLinksEditor } from "@/components/settings/SocialLinksEditor";
import { getFooterFormValues } from "@/lib/footer";
import { getAdminSocialLinks } from "@/lib/social-links";

export default async function FooterAreaPage() {
  const [footer, socialLinks] = await Promise.all([getFooterFormValues(), getAdminSocialLinks()]);

  return (
    <AreaShell icon={PanelBottom} title="Footer" description="Sitenin en altı: açıklama, iletişim bilgileri, sosyal medya ve telif.">
      <FooterForm initialValues={footer} />

      <AreaCard title="Sosyal medya" hint="Footer'da ikon olarak görünür.">
        <SocialLinksEditor links={socialLinks} />
      </AreaCard>
    </AreaShell>
  );
}
