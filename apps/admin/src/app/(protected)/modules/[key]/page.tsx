import { notFound } from "next/navigation";

import { moduleByKey } from "@/brand/modules";
import { AreaCard, AreaShell } from "@/components/areas/AreaShell";
import { ModuleSectionPanel } from "@/components/modules/ModuleSectionPanel";
import { ModuleSetup } from "@/components/modules/ModuleSetup";
import { MODULE_ICONS } from "@/components/modules/module-icons";
import { PageInfoForm } from "@/components/outline/PageInfoForm";
import { BackgroundForm } from "@/components/visual/panels/BackgroundForm";
import { getPageForEditAction } from "@/app/actions/pages";
import { getMediaBaseUrl } from "@/lib/media-base-url";
import { getAdminPages } from "@/lib/pages";
import {
  getAdminSections,
  toSectionFormValues,
  toSectionItemFormValues,
} from "@/lib/sections";
import { ITEM_CONFIG, hasItems } from "@/lib/section-types";

/** Modül ekranı (enfesGurme düzeni): modülün tüm ayarları tek ekranda */
export default async function ModulePage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const mod = moduleByKey(key);
  if (!mod) notFound();

  const Icon = MODULE_ICONS[mod.icon];
  const page = (await getAdminPages()).find((p) => p.slug === mod.slug);
  const shellProps = {
    icon: Icon,
    title: mod.title,
    description: `${mod.description}. Sitede: /${mod.slug}`,
  };

  if (!page) {
    return (
      <AreaShell {...shellProps}>
        <AreaCard title="Kurulum">
          <ModuleSetup
            moduleKey={mod.key}
            slug={mod.slug}
            pageTitle={mod.pageTitle}
          />
        </AreaCard>
      </AreaShell>
    );
  }

  const [sections, pageForm] = await Promise.all([
    getAdminSections(page.id),
    getPageForEditAction(page.id),
  ]);
  const mediaBaseUrl = getMediaBaseUrl();
  const missing = mod.template.sections.filter(
    (e) => !sections.some((s) => s.key === e.key),
  );

  return (
    <AreaShell {...shellProps}>
      {missing.length > 0 && (
        <AreaCard
          title="Eksik bölümler"
          hint="Modülün bazı parçaları silinmiş veya hiç oluşturulmamış."
        >
          <ModuleSetup
            moduleKey={mod.key}
            slug={mod.slug}
            pageTitle={mod.pageTitle}
          />
        </AreaCard>
      )}

      {mod.template.sections.map((entry) => {
        const section = sections.find((s) => s.key === entry.key);
        if (!section) return null;
        const view = {
          id: section.id,
          type: section.type,
          formValues: toSectionFormValues(section),
          items: section.items.map((item) => ({ ...item, formValues: toSectionItemFormValues(item) })),
        };
        return (
          <div key={entry.key} className="space-y-5">
            <AreaCard
              title={`${entry.label} — Genel Ayarlar`}
              hint="Başlık, metin, renkler ve arka plan"
            >
              <ModuleSectionPanel
                section={view}
                entry={entry}
                mediaBaseUrl={mediaBaseUrl}
                part="settings"
              />
            </AreaCard>
            {hasItems(section.type) && (
              <AreaCard
                title={
                  entry.itemLabel
                    ? `${entry.itemLabel} Listesi`
                    : `${ITEM_CONFIG[section.type]?.label ?? "Öğe"} Listesi`
                }
                hint="Sırayla sitede görünür"
              >
                <ModuleSectionPanel
                  section={view}
                  entry={entry}
                  mediaBaseUrl={mediaBaseUrl}
                  part="items"
                />
              </AreaCard>
            )}
          </div>
        );
      })}

      <AreaCard
        title="Sayfa Arka Planı"
        hint="Bu sayfaya özel renk ve fotoğraf. Boşsa Site Arka Planı kullanılır."
      >
        <BackgroundForm
          pageId={page.id}
          initialValues={{
            backgroundColor: page.backgroundColor ?? "",
            backgroundImage: page.backgroundImage ?? "",
          }}
          mediaBaseUrl={mediaBaseUrl}
        />
      </AreaCard>

      {pageForm?.success && (
        <AreaCard
          title="Yayın ve SEO"
          hint="Sayfa başlığı, yayın durumu ve arama motoru bilgileri"
        >
          <PageInfoForm pageId={page.id} initialData={pageForm.data} />
        </AreaCard>
      )}
    </AreaShell>
  );
}
