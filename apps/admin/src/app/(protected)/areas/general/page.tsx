import { Palette } from "lucide-react";

import { AreaShell } from "@/components/areas/AreaShell";
import { AppearanceForm } from "@/components/appearance/AppearanceForm";
import { getMediaBaseUrl } from "@/lib/media-base-url";
import { getSiteSettings, toAppearanceFormValues } from "@/lib/site-settings";

export default async function GeneralAreaPage() {
  const settings = await getSiteSettings();

  return (
    <AreaShell
      icon={Palette}
      title="Genel Ayarlar"
      description="Tema renkleri, sitenin varsayılan arka planı, favicon ve arama motoru (SEO) bilgileri."
    >
      <AreaShellNote />
      <AppearanceForm initialValues={toAppearanceFormValues(settings)} mediaBaseUrl={getMediaBaseUrl()} />
    </AreaShell>
  );
}

function AreaShellNote() {
  return (
    <p className="rounded-xl border border-border bg-surface-muted px-4 py-3 text-sm text-muted-foreground">
      Bir sayfaya özel arka plan vermek için o sayfanın ekranındaki <strong>Arka plan</strong> kartını kullanın.
      Buradaki arka plan, özel arka planı olmayan sayfalarda geçerlidir.
    </p>
  );
}
