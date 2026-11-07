import { Palette } from "lucide-react";

import { AreaShell } from "@/components/areas/AreaShell";
import { SettingsForm } from "@/components/areas/SettingsForm";
import { getMediaBaseUrl } from "@/lib/media-base-url";
import { getSiteSettings, pickSettings } from "@/lib/site-settings";

export default async function ThemeAreaPage() {
  const settings = await getSiteSettings();
  return (
    <AreaShell
      icon={Palette}
      title="Tema Renkleri"
      description="Sitenin genelinde kullanılan renkler. Header, footer ve butonlar ayrıca renk verilmediyse bu renkleri kullanır."
      shared
    >
      <SettingsForm
        group="theme"
        submitLabel="Renkleri Kaydet"
        mediaBaseUrl={getMediaBaseUrl()}
        initialValues={pickSettings(settings, ["primaryColor", "secondaryColor"])}
        panels={[
          {
            title: "Renkler",
            fields: [
              { name: "primaryColor", label: "Ana Renk", kind: "color", description: "Header, footer, başlıklar" },
              { name: "secondaryColor", label: "İkincil Renk", kind: "color", description: "Butonlar, vurgular" },
            ],
          },
        ]}
      />
    </AreaShell>
  );
}
