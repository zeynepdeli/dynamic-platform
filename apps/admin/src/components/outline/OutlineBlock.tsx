"use client";

import { useId, useState } from "react";
import { ChevronDown, Link2 } from "lucide-react";

type OutlineBlockProps = {
  /** Sayfadaki sıra numarası (①, ②…) */
  number?: number;
  title: string;
  hint?: string;
  /** "Tüm sayfalarda ortak" etiketi */
  shared?: boolean;
  /** Gizli bölümler soluk görünür */
  muted?: boolean;
  badge?: React.ReactNode;
  /** Başlık satırındaki sağ butonlar (sırala, yayında, sil…) */
  actions?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
};

/** Sayfa düzenleme ekranındaki açılır/kapanır blok */
export function OutlineBlock({
  number,
  title,
  hint,
  shared = false,
  muted = false,
  badge,
  actions,
  defaultOpen = false,
  children,
}: OutlineBlockProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <section
      className={`rounded-2xl border bg-card shadow-sm transition ${
        open ? "border-[#346872]/40" : "border-border"
      } ${muted ? "opacity-70" : ""}`}
    >
      <div className="flex flex-wrap items-center gap-3 p-4 sm:p-5">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
          className="flex min-w-0 flex-1 items-center gap-4 text-left"
        >
          {number !== undefined && (
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#183350]/10 text-sm font-bold text-[#183350]">
              {number}
            </span>
          )}
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <span className="truncate text-base font-semibold text-foreground">{title}</span>
              {shared && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#346872]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#346872]">
                  <Link2 className="size-3" />
                  Tüm sayfalarda ortak
                </span>
              )}
              {badge}
            </span>
            {hint && <span className="mt-0.5 block truncate text-xs text-muted-foreground">{hint}</span>}
          </span>
          <ChevronDown
            className={`size-5 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>

        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {open && (
        <div id={panelId} className="border-t border-border p-4 sm:p-6">
          {children}
        </div>
      )}
    </section>
  );
}
