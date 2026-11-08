"use client";

import { mediaSrc } from "@/lib/media-src";
import { useState, useTransition } from "react";
import { Check, ImageIcon, Images, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  listMediaForPickerAction,
  type PickerMedia,
} from "@/app/actions/media";

type MediaPickerDialogProps = {
  mediaBaseUrl: string;
  current?: string;
  disabled?: boolean;
  onPick: (url: string) => void;
};

// "SEÇ": medya kütüphanesinden görsel seçtirir
export function MediaPickerDialog({
  mediaBaseUrl,
  current,
  disabled,
  onPick,
}: MediaPickerDialogProps) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<PickerMedia[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, startLoading] = useTransition();

  function openPicker() {
    setOpen(true);
    setError(null);
    startLoading(async () => {
      const result = await listMediaForPickerAction();
      if (result.success) setFiles(result.files);
      else setError(result.error);
    });
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="h-10 shrink-0 gap-2 px-4 text-xs font-semibold uppercase tracking-wider"
        disabled={disabled}
        onClick={openPicker}
      >
        <Images className="size-4" />
        Seç
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
          <DialogTitle className="text-lg font-semibold">
            Medyadan görsel seç
          </DialogTitle>
          <DialogDescription>
            Daha önce yüklenen görsellerden birine tıklayın.
          </DialogDescription>

          {loading && !files ? (
            <div className="flex justify-center p-10">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : files && files.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-10 text-muted-foreground">
              <ImageIcon className="size-6" />
              Kütüphanede görsel yok. Yükle butonuyla ekleyebilirsiniz.
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {files?.map((file) => {
                const isCurrent = file.url === current;
                return (
                  <li key={file.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onPick(file.url);
                        setOpen(false);
                      }}
                      aria-label={`${file.name || "Görsel"} seç`}
                      className={`group relative block aspect-square w-full overflow-hidden rounded-xl border bg-surface-muted transition hover:ring-2 hover:ring-[#346872] ${
                        isCurrent ? "ring-2 ring-[#183350]" : "border-border"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={mediaSrc(file.url, mediaBaseUrl)}
                        alt=""
                        loading="lazy"
                        className="size-full object-contain p-1"
                      />
                      {isCurrent && (
                        <span className="absolute right-1.5 top-1.5 rounded-full bg-[#183350] p-1 text-white">
                          <Check className="size-3" />
                        </span>
                      )}
                      {file.name && (
                        <span className="absolute inset-x-0 bottom-0 truncate bg-black/50 px-2 py-1 text-left text-[11px] text-white">
                          {file.name}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
