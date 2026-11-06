import { Palette } from "lucide-react";

import { AppearanceForm } from "@/components/appearance/AppearanceForm";
import { getSiteSettings, toAppearanceFormValues } from "@/lib/site-settings";

export default async function AppearancePage() {
  const settings = await getSiteSettings();

  // Önizlemede /media/... görsellerini göstermek için TARAYICININ
  // erişebileceği API adresi. (API_URL sunucu içi adres olabilir.)
  const mediaBaseUrl = (
    process.env.API_PUBLIC_URL ??
    process.env.API_URL ??
    ""
  ).replace(/\/$/, "");

  return (
    <main className="min-w-0 space-y-7 pb-10">
      <header className="flex items-center gap-4">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-[#183350]/10 text-[#183350]">
          <Palette className="size-6" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Görünüm</h1>
          <p className="text-sm text-muted-foreground">
            Sitenin renklerini, arka planını ve logosunu yönetin.
          </p>
        </div>
      </header>

      <AppearanceForm
        initialValues={toAppearanceFormValues(settings)}
        mediaBaseUrl={mediaBaseUrl}
      />
    </main>
  );
}
