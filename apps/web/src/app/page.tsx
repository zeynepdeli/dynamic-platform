import { getSite } from "@/core/site";
import { safeImageSrc, safeInternalHref } from "@/core/safe";
import { HeroSlider, type HeroSlideView } from "@/components/site/HeroSlider";
import { PageBackground } from "@/components/site/PageBackground";
import { SectionRenderer } from "@/components/sections/SectionRenderer";

// ✏️ MÜŞTERİYE ÖZEL: Ana sayfa düzeni.
// Özel tasarım için: const home = await getHome(); home.section("hizmetler")
export default async function HomePage() {
  const { heroSlides, homeSections, settings } = await getSite();

  // İstemci bileşenine yalnızca doğrulanmış adresler gönderilir
  const slides: HeroSlideView[] = heroSlides.map((slide) => {
    const href = safeInternalHref(slide.buttonHref);
    return {
      id: slide.id,
      title: slide.title,
      subtitle: slide.subtitle,
      description: slide.description,
      image: safeImageSrc(slide.imageUrl),
      mobileImage: safeImageSrc(slide.mobileImageUrl),
      button: slide.buttonText && href ? { text: slide.buttonText, href } : null,
    };
  });

  return (
    <PageBackground color={settings.homeBackgroundColor} image={settings.homeBackgroundImage}>
      <HeroSlider slides={slides} />
      <SectionRenderer sections={homeSections} />
    </PageBackground>
  );
}
