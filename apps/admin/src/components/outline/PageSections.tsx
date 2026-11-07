"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { swapIds } from "@/components/common/OrderButtons";
import { InlineSection } from "@/components/outline/InlineSection";
import { SectionForm } from "@/components/sections/SectionForm";
import type { SectionListEntry } from "@/lib/sections-view";

import { createSectionAction, reorderSectionsAction } from "@/app/actions/sections";
import type { TemplateSection } from "@/brand/page-templates";

type PageSectionsProps = {
  pageId: string | null;
  sections: SectionListEntry[];
  templateByKey: Record<string, TemplateSection>;
  allowExtraSections: boolean;
  mediaBaseUrl: string;
  /** Bölüm numaraları buradan başlar (önce Header, Slider… gelir) */
  startNumber: number;
};

/** Sayfanın bölümleri, sitedeki sırasıyla, hepsi sayfa içinde düzenlenir */
export function PageSections({
  pageId,
  sections,
  templateByKey,
  allowExtraSections,
  mediaBaseUrl,
  startNumber,
}: PageSectionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const ids = sections.map((section) => section.id);

  function move(index: number, direction: -1 | 1) {
    const next = swapIds(ids, index, direction);
    if (!next) return;
    setError(null);
    startTransition(async () => {
      const result = await reorderSectionsAction(pageId, next);
      if (!result.success) setError(result.error);
      else router.refresh();
    });
  }

  return (
    <>
      {error && (
        <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {sections.map((section, index) => (
        <InlineSection
          key={section.id}
          number={startNumber + index}
          section={section}
          template={section.key ? templateByKey[section.key] : undefined}
          mediaBaseUrl={mediaBaseUrl}
          index={index}
          total={sections.length}
          moving={isPending}
          onMove={(dir) => move(index, dir)}
        />
      ))}

      {allowExtraSections &&
        (creating ? (
          <section className="rounded-2xl border border-dashed border-[#346872]/40 bg-card p-5 sm:p-6">
            <h3 className="mb-5 text-base font-semibold">Yeni Bölüm</h3>
            <SectionForm
              mode="create"
              mediaBaseUrl={mediaBaseUrl}
              onCancel={() => setCreating(false)}
              onSubmit={async (values) => {
                const result = await createSectionAction(pageId, values);
                if (!result.success) return result.error;
                setCreating(false);
                router.refresh();
                return null;
              }}
            />
          </section>
        ) : (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-card/50 p-5 text-sm font-semibold text-[#346872] transition hover:border-[#346872]/40 hover:bg-card"
          >
            <Plus className="size-4" />
            Yeni Bölüm Ekle
          </button>
        ))}
    </>
  );
}
