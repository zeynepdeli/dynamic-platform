"use client";

import { useMemo, useState } from "react";
import { Ban, ChevronDown, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

import { MENU_ICONS, SOCIAL_ICONS, getIcon, type IconEntry } from "./registry";

type IconPickerProps = {
  kind: "social" | "menu";
  value: string;
  onChange: (key: string) => void;
  /** "İkon yok" seçeneği */
  allowNone?: boolean;
  label?: string;
  disabled?: boolean;
};

export function IconPicker({
  kind,
  value,
  onChange,
  allowNone = false,
  label = "İkon",
  disabled,
}: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const current = getIcon(kind, value);

  const entries = useMemo(() => {
    const set: Record<string, IconEntry> = kind === "social" ? SOCIAL_ICONS : MENU_ICONS;
    const q = query.trim().toLocaleLowerCase("tr");
    return Object.entries(set).filter(
      ([key, e]) =>
        !q || key.includes(q) || e.label.toLocaleLowerCase("tr").includes(q),
    );
  }, [kind, query]);

  function pick(key: string) {
    onChange(key);
    setOpen(false);
    setQuery("");
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={() => setOpen(true)}
        aria-label={`${label}: ${current?.label ?? "seçilmedi"}. Değiştir`}
        className="h-10 shrink-0 gap-2 px-3"
      >
        {current ? (
          <current.Icon className="size-4" />
        ) : (
          <Ban className="size-4 text-muted-foreground" />
        )}
        <span className="hidden max-w-28 truncate text-sm sm:inline">
          {current?.label ?? "İkon yok"}
        </span>
        <ChevronDown className="size-3.5 opacity-60" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
          <DialogTitle className="text-lg font-semibold">{label} seç</DialogTitle>
          <DialogDescription className="sr-only">
            Listeden bir ikona tıklayın.
          </DialogDescription>

          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value.slice(0, 40))}
              placeholder="Ara (ör. instagram, telefon)"
              aria-label="İkon ara"
              className="h-10 w-full rounded-xl border border-border bg-surface pl-9 pr-3 text-sm"
            />
          </label>

          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {allowNone && !query && (
              <li>
                <IconTile
                  label="İkon yok"
                  selected={!value}
                  onClick={() => pick("")}
                  icon={<Ban className="size-5 text-muted-foreground" />}
                />
              </li>
            )}
            {entries.map(([key, e]) => (
              <li key={key}>
                <IconTile
                  label={e.label}
                  selected={key === value}
                  onClick={() => pick(key)}
                  icon={<e.Icon className="size-5" />}
                />
              </li>
            ))}
          </ul>
          {entries.length === 0 && (
            <p className="text-center text-sm text-muted-foreground">Sonuç yok.</p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function IconTile({
  label,
  icon,
  selected,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex w-full flex-col items-center gap-1.5 rounded-xl border p-3 text-[11px] transition hover:border-(--brand-accent) hover:bg-surface-muted ${
        selected ? "border-(--brand-primary) bg-(--brand-primary)/5 ring-1 ring-(--brand-primary)" : "border-border"
      }`}
    >
      {icon}
      <span className="w-full truncate text-center">{label}</span>
    </button>
  );
}
