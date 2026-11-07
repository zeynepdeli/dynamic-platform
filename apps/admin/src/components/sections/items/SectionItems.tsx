"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ImageIcon } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";
import { ItemDialog } from "@/components/sections/items/ItemDialog";

import {
  deleteItemAction,
  reorderItemsAction,
  setItemActiveAction,
} from "@/app/actions/sections";
import type { SectionItem } from "@/lib/sections";
import { imageUrlSchema } from "@/lib/validations/common";
import type { SectionItemFormValues } from "@/lib/validations/section.schema";

type SectionItemsProps = {
  sectionId: string;
  items: (SectionItem & { formValues: SectionItemFormValues })[];
  mediaBaseUrl: string;
};

function thumbnailSrc(value: string | null, mediaBaseUrl: string) {
  if (!value || !imageUrlSchema.safeParse(value).success) return null;
  return value.startsWith("/media/") ? `${mediaBaseUrl}${value}` : value;
}

// Bir bölümün kartları: sıralama, gizle/göster, düzenle, sil
export function SectionItems({
  sectionId,
  items,
  mediaBaseUrl,
}: SectionItemsProps) {
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
    if (target < 0 || target >= items.length) return;

    const ids = items.map((item) => item.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];

    run(() => reorderItemsAction(sectionId, ids));
  }

  return (
    <div className="space-y-3 rounded-xl border border-border bg-surface-muted/40 p-3 sm:p-4">
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      {items.length === 0 ? (
        <p className="py-2 text-sm text-muted-foreground">
          Bu bölümde henüz kart yok.
        </p>
      ) : (
        <ol className="space-y-2" aria-busy={isPending}>
          {items.map((item, index) => {
            const src = thumbnailSrc(item.imageUrl, mediaBaseUrl);

            return (
              <li
                key={item.id}
                className={`flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-2.5 ${
                  item.active ? "" : "opacity-60"
                }`}
              >
                <div className="flex gap-1">
                  <button
                    type="button"
                    aria-label="Kartı yukarı taşı"
                    disabled={isPending || index === 0}
                    onClick={() => move(index, -1)}
                    className="inline-flex size-7 items-center justify-center rounded-md border border-border hover:bg-surface-muted disabled:opacity-30"
                  >
                    <ArrowUp className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Kartı aşağı taşı"
                    disabled={isPending || index === items.length - 1}
                    onClick={() => move(index, 1)}
                    className="inline-flex size-7 items-center justify-center rounded-md border border-border hover:bg-surface-muted disabled:opacity-30"
                  >
                    <ArrowDown className="size-3.5" />
                  </button>
                </div>

                <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-surface-muted">
                  {src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={src}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="size-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="size-4 text-muted-foreground" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.title}</p>
                  {item.description && (
                    <p className="truncate text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    size="sm"
                    checked={item.active}
                    disabled={isPending}
                    onCheckedChange={(checked) =>
                      run(() => setItemActiveAction(sectionId, item.id, checked))
                    }
                    aria-label={`${item.title} yayında`}
                  />

                  <ItemDialog
                    mode="edit"
                    sectionId={sectionId}
                    itemId={item.id}
                    initialValues={item.formValues}
                    mediaBaseUrl={mediaBaseUrl}
                  />

                  <ConfirmDeleteDialog
                    title="Kartı sil"
                    description={
                      <>
                        <strong>{item.title}</strong> kartı kalıcı olarak
                        silinecek. Bu işlem geri alınamaz.
                      </>
                    }
                    onConfirm={() => deleteItemAction(sectionId, item.id)}
                  />
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <ItemDialog mode="create" sectionId={sectionId} mediaBaseUrl={mediaBaseUrl} />
    </div>
  );
}
