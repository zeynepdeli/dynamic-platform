"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FilePlus2, Pencil, X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { PageForm } from "@/components/pages/PageForm";
import { createPageAction } from "@/app/actions/pages";

import type { PageFormValues } from "@/lib/validations/page.schema";

type PageDialogProps = {
  mode?: "create" | "edit";
  initialData?: Partial<PageFormValues>;
  onSubmit?: (values: PageFormValues) => Promise<void>;
  initialOpen?: boolean;
  hideTrigger?: boolean;
  onClose?: () => void;
};

export function PageDialog({
  mode = "create",
  initialData,
  onSubmit,
  initialOpen = false,
  hideTrigger = false,
  onClose,
}: PageDialogProps) {
  const router = useRouter();

  const [open, setOpen] = useState(initialOpen);

  const [submitError, setSubmitError] = useState<string | null>(null);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (!nextOpen) {
      setSubmitError(null);
      onClose?.();
    }
  }

  async function handleSubmit(values: PageFormValues) {
    setSubmitError(null);

    try {
      if (mode === "edit") {
        if (!onSubmit) {
          setSubmitError("Sayfa düzenleme işlemi yapılandırılmadı.");
          return;
        }

        await onSubmit(values);
      } else if (onSubmit) {
        await onSubmit(values);
      } else {
        const result = await createPageAction(values);

        if (!result.success) {
          setSubmitError(result.error);
          return;
        }
      }

      handleOpenChange(false);
      router.refresh();
    } catch (error: unknown) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "İşlem sırasında bir hata oluştu. Lütfen tekrar deneyin.",
      );
    }
  }

  return (
    <>
      {!hideTrigger && (
        <Button
          type="button"
          onClick={() => {
            setSubmitError(null);
            setOpen(true);
          }}
          className="min-h-11 gap-2 bg-(--brand-primary) px-5 font-semibold text-white hover:bg-[#24486c]"
        >
          {mode === "create" ? (
            <FilePlus2 className="size-4" />
          ) : (
            <Pencil className="size-4" />
          )}

          {mode === "create" ? "Yeni Sayfa" : "Düzenle"}
        </Button>
      )}

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          showCloseButton={false}
          className="
            fixed!
            top-1/2!
            left-1/2!
            flex
            h-[94dvh]!
            max-h-[94dvh]!
            w-[96vw]!
            max-w-[1400px]!
            -translate-x-1/2!
            -translate-y-1/2!
            flex-col
            gap-0
            overflow-hidden
            rounded-2xl
            border
            border-border
            bg-background
            p-0
            shadow-2xl
            sm:w-[94vw]!
          "
        >
          <DialogHeader className="shrink-0 border-b border-border bg-surface px-6 py-5 sm:px-9 sm:py-6">
            <div className="flex items-center justify-between gap-5">
              <div className="min-w-0">
                <div className="mb-2 flex items-center gap-2">
                  <span className="size-2 rounded-full bg-(--brand-accent)" />

                  <span className="text-xs font-semibold uppercase tracking-[0.15em] text-(--brand-accent)">
                    Sayfa Yönetimi
                  </span>
                </div>

                <DialogTitle className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  {mode === "create" ? "Yeni Sayfa Oluştur" : "Sayfayı Düzenle"}
                </DialogTitle>

                <DialogDescription className="mt-2 text-sm leading-6 text-muted-foreground">
                  İçerik, SEO ve yayın ayarlarını tek yerden yönetin.
                </DialogDescription>
              </div>

              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Modalı kapat"
                onClick={() => handleOpenChange(false)}
                className="size-11 shrink-0 rounded-xl border-border bg-surface text-foreground hover:bg-surface-muted"
              >
                <X className="size-5" />
              </Button>
            </div>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto bg-background px-6 py-6 sm:px-9 sm:py-8">
            <div className="mx-auto w-full max-w-[1240px]">
              {submitError && (
                <div
                  role="alert"
                  className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
                >
                  {submitError}
                </div>
              )}

              <PageForm
                mode={mode}
                initialData={initialData}
                onSubmit={handleSubmit}
                onCancel={() => handleOpenChange(false)}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
