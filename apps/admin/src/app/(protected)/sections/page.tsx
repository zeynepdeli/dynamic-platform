import { LayoutGrid } from "lucide-react";

import { PageSelector } from "@/components/sections/PageSelector";
import { SectionDialog } from "@/components/sections/SectionDialog";
import { SectionList } from "@/components/sections/SectionList";
import { getAdminPages } from "@/lib/pages";
import { getAdminSections, toSectionFormValues } from "@/lib/sections";

type SectionsPageProps = {
  searchParams: Promise<{ page?: string | string[] }>;
};

export default async function SectionsPage({ searchParams }: SectionsPageProps) {
  const { page } = await searchParams;
  const pages = await getAdminPages();

  // ?page= değeri yalnızca gerçekten var olan bir sayfanın id'si ise
  // kullanılır. Aksi halde (boş, bozuk, silinmiş) ana sayfa gösterilir.
  const selectedPage =
    typeof page === "string" ? pages.find((p) => p.id === page) : undefined;
  const pageId = selectedPage?.id ?? null;

  const sections = await getAdminSections(pageId);

  const mediaBaseUrl = (
    process.env.API_PUBLIC_URL ??
    process.env.API_URL ??
    ""
  ).replace(/\/$/, "");

  return (
    <main className="min-w-0 space-y-7 pb-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-[#183350]/10 text-[#183350]">
            <LayoutGrid className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Bölümler</h1>
            <p className="text-sm text-muted-foreground">
              {selectedPage ? selectedPage.title : "Ana Sayfa"} bölümlerini
              yönetin.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <PageSelector
            pages={pages.map((p) => ({ id: p.id, title: p.title }))}
            selectedPageId={pageId}
          />
          <SectionDialog mode="create" pageId={pageId} mediaBaseUrl={mediaBaseUrl} />
        </div>
      </header>

      <SectionList
        pageId={pageId}
        sections={sections.map((section) => ({
          ...section,
          formValues: toSectionFormValues(section),
        }))}
        mediaBaseUrl={mediaBaseUrl}
      />
    </main>
  );
}
