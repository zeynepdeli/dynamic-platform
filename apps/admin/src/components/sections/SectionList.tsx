"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  LayoutGrid,
  Lock,
} from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";
import { SectionDialog } from "@/components/sections/SectionDialog";
import { SectionItems } from "@/components/sections/items/SectionItems";

import {
  deleteSectionAction,
  reorderSectionsAction,
  setSectionActiveAction,
} from "@/app/actions/sections";
import type { TemplateSection } from "@/brand/page-templates";
import type { Section, SectionItem } from "@/lib/sections";
import { HEX_COLOR_REGEX } from "@/lib/validations/common";
import {
  SECTION_TYPE_LABELS,
  type SectionFormValues,
  type SectionItemFormValues,
} from "@/lib/validations/section.schema";

export type SectionListEntry = Section & {
  formValues: SectionFormValues;
  items: (SectionItem & { formValues: SectionItemFormValues })[];
};

type SectionListProps = {
  pageId: string | null;
  sections: SectionListEntry[];
  /** Şablon bilgisi: anahtar → etiket / kilit */
  templateByKey: Record<string, TemplateSection>;
  mediaBaseUrl: string;
};

export function SectionList({
  pageId,
  sections,
  templateByKey,
  mediaBaseUrl,
}: SectionListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  // Hangi bölümlerin kartları açık
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggleExpanded(id: string) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

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
        {sections.map((section, index) => {
          const template = section.key ? templateByKey[section.key] : undefined;
          const locked = template?.locked ?? false;
          const isCards = section.type === "CARDS";
          const isOpen = expanded.has(section.id);
          const swatch = HEX_COLOR_REGEX.test(section.backgroundColor ?? "")
            ? (section.backgroundColor as string)
            : undefined;

          return (
            <li
              key={section.id}
              className={`rounded-2xl border border-border bg-card ${
                section.active ? "" : "opacity-60"
              }`}
            >
              <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
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

                {/* Renk örneği (yalnızca doğrulanmış #RRGGBB) */}
                <div
                  className="size-12 shrink-0 rounded-xl border border-border"
                  style={{ backgroundColor: swatch }}
                  aria-hidden="true"
                />

                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 truncate font-semibold">
                    {template?.label ?? (section.title || "(Başlıksız bölüm)")}
                    {locked && (
                      <Lock
                        className="size-3.5 shrink-0 text-muted-foreground"
                        aria-label="Tasarıma bağlı bölüm"
                      />
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {SECTION_TYPE_LABELS[section.type]}
                    {isCards &&
                      ` · ${section.items.length} kart · ${section.columns} sütun`}
                    {section.key && ` · #${section.key}`}
                  </p>
                  {template?.hint && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {template.hint}
                    </p>
                  )}
                </div>

                {/* İşlemler */}
                <div className="flex flex-wrap items-center gap-3">
                  {isCards && (
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => toggleExpanded(section.id)}
                      className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-medium hover:bg-surface-muted"
                    >
                      Kartlar ({section.items.length})
                      <ChevronDown
                        className={`size-3.5 transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  )}

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
                    lock={locked && template ? { label: template.label } : null}
                  />

                  {/* Tasarıma bağlı bölümler silinemez */}
                  {!locked && (
                    <ConfirmDeleteDialog
                      title="Bölümü sil"
                      description={
                        <>
                          <strong>{section.title || "Başlıksız bölüm"}</strong>{" "}
                          ve içindeki{" "}
                          <strong>{section.items.length} kart</strong> kalıcı
                          olarak silinecek. Bu işlem geri alınamaz.
                        </>
                      }
                      onConfirm={() => deleteSectionAction(section.id)}
                    />
                  )}
                </div>
              </div>

              {isCards && isOpen && (
                <div className="border-t border-border p-3 sm:p-4">
                  <SectionItems
                    sectionId={section.id}
                    items={section.items}
                    mediaBaseUrl={mediaBaseUrl}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
