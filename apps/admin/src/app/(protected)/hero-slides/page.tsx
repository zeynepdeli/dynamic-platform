import { PanelsTopLeft } from "lucide-react";

import { HeroSlideDialog } from "@/components/hero/HeroSlideDialog";
import { HeroSlideList } from "@/components/hero/HeroSlideList";
import { getAdminHeroSlides, toHeroSlideFormValues } from "@/lib/hero-slides";
import { getMediaBaseUrl } from "@/lib/media-base-url";

export default async function HeroSlidesPage() {
  const slides = await getAdminHeroSlides();
  const mediaBaseUrl = getMediaBaseUrl();

  return (
    <main className="min-w-0 space-y-7 pb-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-[#183350]/10 text-[#183350]">
            <PanelsTopLeft className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Slider</h1>
            <p className="text-sm text-muted-foreground">
              Ana sayfanın en üstündeki kayan görselleri yönetin.
            </p>
          </div>
        </div>

        <HeroSlideDialog mode="create" mediaBaseUrl={mediaBaseUrl} />
      </header>

      <HeroSlideList
        mediaBaseUrl={mediaBaseUrl}
        slides={slides.map((slide) => ({
          ...slide,
          formValues: toHeroSlideFormValues(slide),
        }))}
      />
    </main>
  );
}
