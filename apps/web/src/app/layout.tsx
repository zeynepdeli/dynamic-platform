import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { getSite } from "@/core/site";
import { safeImageSrc } from "@/core/safe";
import { themeStyle } from "@/core/theme";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";

import "./globals.css";

// ✏️ MÜŞTERİYE ÖZEL: Fontlar
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin", "latin-ext"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getSite();
  const favicon = safeImageSrc(settings.faviconUrl);
  const title = settings.metaTitle || settings.siteName;

  const ogImage = safeImageSrc(settings.ogImageUrl);

  return {
    title: { default: title, template: `%s | ${settings.siteName}` },
    description: settings.metaDescription ?? settings.description ?? undefined,
    keywords: settings.metaKeywords ?? undefined,
    icons: favicon ? { icon: favicon } : undefined,
    openGraph: {
      siteName: settings.siteName,
      type: "website",
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    // Admin → SEO Yönetimi → Robots
    robots: settings.allowIndexing === false ? { index: false, follow: false } : undefined,
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { settings, menuItems, footer, socialLinks } = await getSite();
  // Renk her zaman (themeStyle), fotoğraf varsa rengin üstünde
  const backgroundImage = safeImageSrc(settings.backgroundImage);

  return (
    <html lang="tr" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body style={themeStyle(settings)} className="flex min-h-full flex-col font-sans">
        {/* Site arka plan görseli: CSS url() yerine <img> (CSS injection yok) */}
        {backgroundImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={backgroundImage}
            alt=""
            aria-hidden="true"
            className="fixed inset-0 -z-10 size-full object-cover"
          />
        )}

        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-gray-900"
        >
          İçeriğe geç
        </a>

        <Header settings={settings} menuItems={menuItems} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer footer={footer} settings={settings} socialLinks={socialLinks} menuItems={menuItems} />
      </body>
    </html>
  );
}
