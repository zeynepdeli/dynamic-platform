import { Wallpaper } from "lucide-react";

import { AreaShell } from "@/components/areas/AreaShell";
import { SettingsForm } from "@/components/areas/SettingsForm";
import { getMediaBaseUrl } from "@/lib/media-base-url";
import { getSiteSettings, pickSettings } from "@/lib/site-settings";

export default async function BackgroundAreaPage() {
  const settings = await getSiteSettings();
  return (
    <AreaShell
      icon={Wallpaper}
      title="Site Arka Planı"
      description="Kendine özel arka planı olmayan tüm sayfalarda kullanılır. Bir sayfaya özel arka plan, o sayfanın “Sayfa Arka Planı” kutucuğundan verilir."
      shared
    >
      <SettingsForm
        group="background"
        submitLabel="Arka Planı Kaydet"
        mediaBaseUrl={getMediaBaseUrl()}
        initialValues={pickSettings(settings, ["backgroundColor", "backgroundImage"])}
        panels={[
          {
            title: "Arka Plan Ayarları",
            hint: "Renk her zaman uygulanır; fotoğraf seçilirse rengin üstünde görünür (fotoğraf yüklenene kadar renk görünür).",
            fields: [
              { name: "backgroundColor", label: "Arka Plan Rengi", kind: "color" },
              { name: "backgroundImage", label: "Arka Plan Fotoğrafı", kind: "image", description: "Geniş görsel önerilir (ör. 1920×1080) — en fazla 5 MB." },
            ],
          },
        ]}
      />
    </AreaShell>
  );
}
