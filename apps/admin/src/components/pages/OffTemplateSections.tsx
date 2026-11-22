"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";

import { deleteSectionAction } from "@/app/actions/sections";
import { Button } from "@/components/ui/button";

type Row = { id: string; title: string; summary: string };

/**
 * Sayfanın tasarımında olmayan bölümler (ör. kurulumdaki örnek içerik).
 * Sitede gösterilmezler; burada tek tek ya da topluca silinir.
 */
export function OffTemplateSections({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [confirmAll, setConfirmAll] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = (ids: string[]) =>
    start(async () => {
      setError(null);
      for (const id of ids) {
        const result = await deleteSectionAction(id);
        if (!result.success) {
          setError(result.error);
          break;
        }
      }
      setConfirmAll(false);
      router.refresh();
    });

  return (
    <div className="space-y-3 rounded-2xl border border-amber-400/60 bg-amber-50 p-4 text-amber-950">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="flex items-start gap-2 text-sm">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <span>
            <strong>Tasarımda olmayan {rows.length} bölüm.</strong> Kurulumdaki örnek içerikten kaldı; sitede{" "}
            <strong>görünmez</strong>. Karışıklık olmaması için silebilirsiniz.
          </span>
        </p>
        {confirmAll ? (
          <span className="flex items-center gap-2">
            <Button type="button" size="sm" variant="destructive" disabled={pending} onClick={() => remove(rows.map((r) => r.id))}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />} Evet, hepsini sil
            </Button>
            <Button type="button" size="sm" variant="ghost" disabled={pending} onClick={() => setConfirmAll(false)}>
              Vazgeç
            </Button>
          </span>
        ) : (
          <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => setConfirmAll(true)} className="gap-1.5 bg-white">
            <Trash2 className="size-4" /> Hepsini sil
          </Button>
        )}
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <ul className="divide-y divide-amber-200 overflow-hidden rounded-xl border border-amber-200 bg-white">
        {rows.map((r) => (
          <li key={r.id} className="flex items-center gap-3 px-4 py-2.5">
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-foreground">{r.title}</p>
              {r.summary && <p className="truncate text-xs text-muted-foreground">{r.summary}</p>}
            </div>
            <Button type="button" size="sm" variant="ghost" disabled={pending} onClick={() => remove([r.id])} className="gap-1.5 text-destructive" aria-label={`${r.title} sil`}>
              <Trash2 className="size-4" /> Sil
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
