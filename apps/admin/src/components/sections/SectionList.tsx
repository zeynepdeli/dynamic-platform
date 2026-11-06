"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, LayoutGrid } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";
import { SectionDialog } from "@/components/sections/SectionDialog";

import {
  deleteSectionAction,
  reorderSectionsAction,
  setSectionActiveAction,
} from "@/app/actions/sections";
import type { Section } from "@/lib/sections";
import {
  SECTION_TYPE_LABELS,
  type SectionFormValues,
} from "@/lib/validations/section.schema";

type SectionListProps = {
  pageId: string | null;
  sections: (Section & { formValues: SectionFormValues })[];
  mediaBaseUrl: string;
};

export function SectionList({
  pageId,
  sections,
  mediaBaseUrl,
}: SectionListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(action: () => Promise<{ success: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.success) {
        setError(result.error ?? "İşlem başarısız oldu.");
        return;
      }
      router.refresh();
    });
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;

    const ids = sections.map((section) => section.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];

    run(() => reorderSectionsAction(pageId, ids));
  }

  if (sections.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
        <LayoutGrid className="size-8" />
        <p>Bu sayfada henüz bölüm yok.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <ol className="space-y-3" aria-busy={isPending}>
        {sections.map((section, index) => (
          <li
            key={section.id}
            className={`flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center ${
              section.active ? "" : "opacity-60"
            }`}
          >
            {/* Sıralama */}
            <div className="flex gap-1 sm:flex-col">
              <button
                type="button"
                aria-label="Yukarı taşı"
                disabled={isPending || index === 0}
                onClick={() => move(index, -1)}
                className="inline-flex size-8 items-center justify-center rounded-lg border border-border hover:bg-surface-muted disabled:opacity-30"
              >
                <ArrowUp className="size-4" />
              </button>
              <button
                type="button"
                aria-label="Aşağı taşı"
                disabled={isPending || index === sections.length - 1}
                onClick={() => move(index, 1)}
                className="inline-flex size-8 items-center justify-center rounded-lg border border-border hover:bg-surface-muted disabled:opacity-30"
              >
                <ArrowDown className="size-4" />
              </button>
            </div>

            {/* Renk örneği + bilgi */}
            <div
              className="size-12 shrink-0 rounded-xl border border-border"
              style={{
                // Değer API'de #RRGGBB olarak doğrulandı; yine de kontrol et
                backgroundColor: /^#[0-9a-fA-F]{6}$/.test(
                  section.backgroundColor ?? "",
                )
                  ? section.backgroundColor!
                  : undefined,
              }}
              aria-hidden="true"
            />

            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">
                {section.title || "(Başlıksız bölüm)"}
              </p>
              <p className="text-xs text-muted-foreground">
                {SECTION_TYPE_LABELS[section.type]}
                {section.type === "CARDS" &&
                  ` · ${section.items.length} kart · ${section.columns} sütun`}
              </p>
            </div>

            {/* İşlemler */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <Switch
                  checked={section.active}
                  disabled={isPending}
                  onCheckedChange={(checked) =>
                    run(() => setSectionActiveAction(section.id, checked))
                  }
                  aria-label="Yayında"
                />
                {section.active ? "Yayında" : "Gizli"}
              </label>

              <SectionDialog
                mode="edit"
                sectionId={section.id}
                initialValues={section.formValues}
                mediaBaseUrl={mediaBaseUrl}
              />

              <ConfirmDeleteDialog
                title="Bölümü sil"
                description={
                  <>
                    <strong>{section.title || "Başlıksız bölüm"}</strong> ve
                    içindeki <strong>{section.items.length} kart</strong>{" "}
                    kalıcı olarak silinecek. Bu işlem geri alınamaz.
                  </>
                }
                onConfirm={() => deleteSectionAction(section.id)}
              />
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
