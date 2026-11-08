import { SearchCode } from "lucide-react";

import { AreaShell } from "@/components/areas/AreaShell";
import { SettingsForm } from "@/components/areas/SettingsForm";
import { getMediaBaseUrl } from "@/lib/media-base-url";
import { getSiteSettings, pickSettings } from "@/lib/site-settings";

export default async function SeoAreaPage() {
  const settings = await getSiteSettings();
  return (
    <AreaShell
      icon={SearchCode}
      title="SEO Yönetimi"
      description="Google ve sosyal medya paylaşımlarında sitenin nasıl görüneceği. Sayfalara özel SEO, her sayfanın “Sayfa Bilgileri” kutucuğundadır; boş bırakılan alanlarda buradaki değerler kullanılır."
      shared
    >
      <SettingsForm
        group="seo"
        submitLabel="SEO Ayarlarını Kaydet"
        mediaBaseUrl={getMediaBaseUrl()}
        initialValues={pickSettings(settings, [
          "metaTitle",
          "metaDescription",
          "metaKeywords",
          "description",
          "faviconUrl",
          "ogImageUrl",
          "allowIndexing",
          "gaMeasurementId",
        ])}
        panels={[
          {
            title: "Genel SEO",
            fields: [
              { name: "metaTitle", label: "Site Başlığı (Title)", kind: "text", placeholder: "Site Adı – Kısa slogan", description: "Tarayıcı sekmesinde ve Google sonuçlarında görünür." },
              { name: "metaKeywords", label: "Anahtar Kelimeler", kind: "text", placeholder: "lojistik, nakliye, depolama", description: "Virgülle ayırın." },
              { name: "metaDescription", label: "Site Açıklaması (Description)", kind: "textarea", description: "Google sonuçlarında başlığın altında görünür (150–160 karakter ideal).", wide: true },
              { name: "description", label: "Kısa Tanıtım", kind: "textarea", description: "Site hakkında bir iki cümle; açıklama boşsa bu kullanılır.", wide: true },
            ],
          },
          {
            title: "Site İkonu ve Paylaşım Görseli",
            fields: [
              { name: "faviconUrl", label: "Favicon", kind: "image", description: "Sekmede görünen küçük ikon. Kare görsel (ör. 512×512)." },
              { name: "ogImageUrl", label: "Paylaşım Görseli (OpenGraph)", kind: "image", description: "WhatsApp, Facebook, LinkedIn'de link paylaşıldığında görünür (1200×630 önerilir)." },
            ],
          },
          {
            title: "Google Analytics",
            hint: "Ziyaretçi istatistikleri için. Yalnızca ölçüm kimliği girilir; site koduna serbest kod eklenmez.",
            fields: [
              { name: "gaMeasurementId", label: "Ölçüm Kimliği", kind: "text", placeholder: "G-XXXXXXXXXX", description: "Google Analytics → Yönetici → Veri akışları → Ölçüm kimliği." },
            ],
          },
          {
            title: "Robots Ayarları",
            fields: [
              { name: "allowIndexing", label: "Arama motorları siteyi listeleyebilsin", kind: "switch", description: "Kapatırsanız site Google'da görünmez (yapım aşamasında kapalı tutabilirsiniz).", wide: true },
            ],
          },
        ]}
      />
    </AreaShell>
  );
}
