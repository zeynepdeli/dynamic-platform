"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Pencil } from "lucide-react";

import { deleteSectionAction, reorderSectionsAction, setSectionActiveAction } from "@/app/actions/sections";
import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { ActionResult } from "@/lib/admin/send";

export type SectionRow = {
  id: string;
  label: string;
  /** Yalnızca serbest bölümlerde (şablon bölümlerinde adı yeterli) */
  type?: string;
  summary: string;
  active: boolean;
  /** Şablonun zorunlu bölümü: silinemez (yalnızca gizlenebilir) */
  locked: boolean;
};

/**
 * Sayfanın bölümleri, sitede yukarıdan aşağı göründüğü sırayla:
 * yukarı/aşağı taşı, yayında aç/kapat, düzenle, sil.
 */
export function SectionList({ pageId, rows, editBase }: { pageId: string | null; rows: SectionRow[]; editBase: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const run = (fn: () => Promise<ActionResult>) =>
    start(async () => {
      setError(null);
      const result = await fn();
      if (!result.success) setError(result.error);
      router.refresh();
    });

  const move = (i: number, d: -1 | 1) => {
    const ids = rows.map((r) => r.id);
    [ids[i], ids[i + d]] = [ids[i + d], ids[i]];
    run(() => reorderSectionsAction(pageId, ids));
  };

  if (rows.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        Henüz bölüm yok. Aşağıdan ekleyin.
      </p>
    );
  }

  return (
    <div className="grid gap-2">
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <ol className="divide-y divide-border rounded-2xl border border-border bg-card" aria-busy={pending}>
        {rows.map((r, i) => (
          <li key={r.id} className={`flex flex-wrap items-center gap-3 px-4 py-3 ${r.active ? "" : "opacity-60"}`}>
            <span className="flex flex-col">
              <Button type="button" size="icon" variant="ghost" className="size-7" disabled={pending || i === 0} onClick={() => move(i, -1)} aria-label={`${r.label} yukarı taşı`}>
                <ArrowUp className="size-4" />
              </Button>
              <Button type="button" size="icon" variant="ghost" className="size-7" disabled={pending || i === rows.length - 1} onClick={() => move(i, 1)} aria-label={`${r.label} aşağı taşı`}>
                <ArrowDown className="size-4" />
              </Button>
            </span>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-(--brand-primary)/10 text-xs font-bold text-(--brand-primary)">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">
                {r.label}{" "}
                {r.type && <span className="ml-1 rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">{r.type}</span>}
              </p>
              {r.summary && <p className="truncate text-sm text-muted-foreground">{r.summary}</p>}
            </div>
            <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              {r.active ? "Yayında" : "Gizli"}
              <Switch checked={r.active} disabled={pending} aria-label={`${r.label} yayında`} onCheckedChange={(v) => run(() => setSectionActiveAction(r.id, v))} />
            </label>
            <Link href={`${editBase}/${r.id}`} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-semibold hover:bg-surface-muted">
              <Pencil className="size-3.5" /> Düzenle
            </Link>
            {r.locked ? (
              <span className="w-9" aria-hidden="true" />
            ) : (
              <ConfirmDeleteDialog
                title="Bölümü sil"
                description={
                  <>
                    <strong>{r.label}</strong> bölümü ve içindeki tüm kartlar kalıcı olarak silinecek.
                  </>
                }
                onConfirm={async () => {
                  const result = await deleteSectionAction(r.id);
                  router.refresh();
                  return result;
                }}
              />
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
