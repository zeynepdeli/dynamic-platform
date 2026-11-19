import { Languages } from "lucide-react";

import { AreaCard, AreaShell } from "@/components/areas/AreaShell";
import { LanguagesForm } from "@/components/i18n/LanguagesForm";
import { normalizeLocaleConfig } from "@/lib/i18n";
import { getSiteSettings } from "@/lib/site-settings";

export default async function LanguagesAreaPage() {
  const settings = await getSiteSettings();
  return (
    <AreaShell
      icon={Languages}
      title="Diller"
      description="Sitenin hangi dillerde yayınlanacağı. Ek dil açılınca menü, slider, sayfa ve bölüm formlarında o dilin çeviri kutusu görünür."
      shared
    >
      <AreaCard
        title="Site Dilleri"
        hint="Çevirisi girilmeyen alanlar sitede ana dildeki haliyle görünür; site hiçbir dilde boş kalmaz."
      >
        <LanguagesForm
          initial={normalizeLocaleConfig(
            settings.defaultLocale,
            settings.locales,
          )}
        />
      </AreaCard>
    </AreaShell>
  );
}
