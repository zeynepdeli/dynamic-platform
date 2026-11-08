"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ImageIcon, Plus } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";
import { OrderButtons, swapIds } from "@/components/common/OrderButtons";
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
import type { SectionItemFormValues } from "@/lib/validations/section.schema";

type InlineItemsProps = {
  sectionId: string;
  items: (SectionItem & { formValues: SectionItemFormValues })[];
  mediaBaseUrl: string;
  itemLabel: string;
  fields?: FieldConfig<ItemField>;
};

function thumb(value: string | null, base: string) {
  if (!value || !imageUrlSchema.safeParse(value).success) return null;
  return value.startsWith("/media/") ? `${base}${value}` : value;
}

/** Bölüm içindeki kartlar: her kart açılır form, yeni kart da sayfa içinde */
export function InlineItems({ sectionId, items, mediaBaseUrl, itemLabel, fields }: InlineItemsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

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

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-foreground">
        {itemLabel} listesi{" "}
        <span className="font-normal text-muted-foreground">({items.length})</span>
      </p>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <ol className="space-y-2" aria-busy={isPending}>
        {items.map((item, index) => {
          const src = thumb(item.imageUrl, mediaBaseUrl);
          const open = openId === item.id;

          return (
            <li key={item.id} className={`rounded-xl border border-border bg-surface ${item.active ? "" : "opacity-60"}`}>
              <div className="flex flex-wrap items-center gap-3 p-2.5">
                <OrderButtons
                  index={index}
                  total={items.length}
                  disabled={isPending}
                  size="sm"
                  layout="row"
                  onMove={(dir) => {
                    const next = swapIds(ids, index, dir);
                    if (next) run(() => reorderItemsAction(sectionId, next));
                  }}
                />

                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenId(open ? null : item.id)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-surface-muted">
                    {src ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={src} alt="" referrerPolicy="no-referrer" className="size-full object-cover" />
                    ) : (
                      <ImageIcon className="size-4 text-muted-foreground" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{item.title}</span>
                  <ChevronDown className={`size-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
                </button>

                <Switch
                  size="sm"
                  checked={item.active}
                  disabled={isPending}
                  onCheckedChange={(checked) => run(() => setItemActiveAction(sectionId, item.id, checked))}
                  aria-label={`${item.title} yayında`}
                />
                <ConfirmDeleteDialog
                  title={`${itemLabel} sil`}
                  description={<><strong>{item.title}</strong> kalıcı olarak silinecek.</>}
                  onConfirm={() => deleteItemAction(sectionId, item.id)}
                />
              </div>

              {open && (
                <div className="border-t border-border p-4">
                  <ItemForm
                    mode="edit"
                    fields={fields}
                    initialValues={item.formValues}
                    mediaBaseUrl={mediaBaseUrl}
                    onSubmit={async (values) => {
                      const result = await updateItemAction(sectionId, item.id, values);
                      if (!result.success) return result.error;
                      router.refresh();
                      return null;
                    }}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {creating ? (
        <div className="rounded-xl border border-dashed border-(--brand-accent)/40 bg-surface p-4">
          <p className="mb-4 text-sm font-semibold">Yeni {itemLabel}</p>
          <ItemForm
            mode="create"
            fields={fields}
            mediaBaseUrl={mediaBaseUrl}
            submitLabel={`${itemLabel} Ekle`}
            onCancel={() => setCreating(false)}
            onSubmit={async (values) => {
              const result = await createItemAction(sectionId, values);
              if (!result.success) return result.error;
              setCreating(false);
              router.refresh();
              return null;
            }}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-2.5 text-sm font-medium text-(--brand-accent) hover:bg-surface-muted"
        >
          <Plus className="size-4" />
          {itemLabel} Ekle
        </button>
      )}
    </div>
  );
}
