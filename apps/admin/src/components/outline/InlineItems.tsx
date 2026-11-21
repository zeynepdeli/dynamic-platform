"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ImageIcon, Pencil, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";
import { EditModal } from "@/components/common/EditModal";
import { swapIds } from "@/components/common/OrderButtons";
import { ItemForm } from "@/components/sections/items/ItemForm";

import {
  createItemAction,
  deleteItemAction,
  reorderItemsAction,
  setItemActiveAction,
  updateItemAction,
} from "@/app/actions/sections";
import type { FieldConfig, ItemField } from "@/brand/page-templates";
import type { SectionItem } from "@/lib/sections";
import { imageUrlSchema } from "@/lib/validations/common";
import type { SectionItemFormValues, SectionType } from "@/lib/validations/section.schema";

type InlineItemsProps = {
  sectionId: string;
  items: (SectionItem & { formValues: SectionItemFormValues })[];
  mediaBaseUrl: string;
  itemLabel: string;
  fields?: FieldConfig<ItemField>;
  sectionType?: SectionType;
};

function thumb(value: string | null, base: string) {
  if (!value || !imageUrlSchema.safeParse(value).success) return null;
  return value.startsWith("/media/") ? `${base}${value}` : value;
}

/** Kısa ikinci satır: açıklamanın başı */
const excerpt = (text: string | null | undefined) => (text ?? "").replace(/\s+/g, " ").trim().slice(0, 90);

/**
 * Bölümdeki kartlar (e-ticaret panelindeki düzen): her kart tek satır;
 * ekleme ve düzenleme pencerede (modal) açılır.
 */
export function InlineItems({ sectionId, items, mediaBaseUrl, itemLabel, fields, sectionType }: InlineItemsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  /** null: pencere kapalı · "new": yeni · id: düzenlenen */
  const [editing, setEditing] = useState<"new" | string | null>(null);

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

  const ids = items.map((item) => item.id);
  const move = (index: number, dir: -1 | 1) => {
    const next = swapIds(ids, index, dir);
    if (next) run(() => reorderItemsAction(sectionId, next));
  };
  const current = editing && editing !== "new" ? items.find((i) => i.id === editing) : undefined;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-foreground">
          {itemLabel} listesi <span className="font-normal text-muted-foreground">({items.length})</span>
        </p>
        <Button type="button" onClick={() => setEditing("new")} className="gap-2">
          <Plus className="size-4" /> {itemLabel} Ekle
        </Button>
      </div>

      {error && (
        <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {items.length === 0 ? (
        <p className="rounded-2xl border-2 border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Henüz {itemLabel.toLocaleLowerCase("tr-TR")} yok. &ldquo;{itemLabel} Ekle&rdquo; ile ilkini ekleyin.
        </p>
      ) : (
        <ol className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card" aria-busy={isPending}>
          {items.map((item, index) => {
            const src = thumb(item.imageUrl, mediaBaseUrl);
            const name = item.title || itemLabel;
            return (
              <li key={item.id} className={`flex items-center gap-3 px-3 py-2.5 ${item.active ? "" : "opacity-60"}`}>
                <span className="w-5 shrink-0 text-center text-xs text-muted-foreground tabular-nums">{index + 1}</span>
                <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-muted">
                  {src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={src} alt="" referrerPolicy="no-referrer" className="size-full object-cover" />
                  ) : (
                    <ImageIcon className="size-5 text-muted-foreground" />
                  )}
                </span>
                <button type="button" onClick={() => setEditing(item.id)} className="min-w-0 flex-1 text-left">
                  <span className="block truncate font-semibold">
                    {item.title || <span className="font-normal italic text-muted-foreground">(başlıksız)</span>}
                  </span>
                  {(item.subtitle || item.description) && (
                    <span className="block truncate text-xs text-muted-foreground">{item.subtitle || excerpt(item.description)}</span>
                  )}
                </button>
                {!item.active && (
                  <span className="hidden shrink-0 rounded-full bg-neutral-500/10 px-2 py-0.5 text-[11px] font-semibold text-neutral-600 sm:inline">Gizli</span>
                )}
                <Switch
                  size="sm"
                  checked={item.active}
                  disabled={isPending}
                  onCheckedChange={(checked) => run(() => setItemActiveAction(sectionId, item.id, checked))}
                  aria-label={`${name} yayında`}
                />
                <span className="flex shrink-0">
                  <Button type="button" variant="ghost" size="icon" disabled={isPending || index === 0} onClick={() => move(index, -1)} aria-label={`${name} yukarı taşı`}>
                    <ArrowUp className="size-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" disabled={isPending || index === items.length - 1} onClick={() => move(index, 1)} aria-label={`${name} aşağı taşı`}>
                    <ArrowDown className="size-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" onClick={() => setEditing(item.id)} aria-label={`${name} düzenle`}>
                    <Pencil className="size-4" />
                  </Button>
                  <ConfirmDeleteDialog
                    title={`${itemLabel} sil`}
                    description={<><strong>{name}</strong> kalıcı olarak silinecek.</>}
                    onConfirm={() => deleteItemAction(sectionId, item.id)}
                  />
                </span>
              </li>
            );
          })}
        </ol>
      )}

      <EditModal
        open={editing !== null}
        title={editing === "new" ? `Yeni ${itemLabel}` : `${itemLabel} Düzenle`}
        description={editing === "new" ? "Kaydedince listeye eklenir ve sitede görünür." : current?.title || undefined}
        onClose={() => setEditing(null)}
      >
        {editing === "new" ? (
          <ItemForm
            mode="create"
            fields={fields}
            sectionType={sectionType}
            mediaBaseUrl={mediaBaseUrl}
            submitLabel={`${itemLabel} Ekle`}
            onCancel={() => setEditing(null)}
            onSubmit={async (values) => {
              const result = await createItemAction(sectionId, values);
              if (!result.success) return result.error;
              setEditing(null);
              router.refresh();
              return null;
            }}
          />
        ) : current ? (
          <ItemForm
            key={current.id}
            mode="edit"
            fields={fields}
            sectionType={sectionType}
            initialValues={current.formValues}
            mediaBaseUrl={mediaBaseUrl}
            onCancel={() => setEditing(null)}
            onSubmit={async (values) => {
              const result = await updateItemAction(sectionId, current.id, values);
              if (!result.success) return result.error;
              setEditing(null);
              router.refresh();
              return null;
            }}
          />
        ) : null}
      </EditModal>
    </div>
  );
}
