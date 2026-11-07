"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { deletePageAction } from "@/app/actions/pages";

type DeletePageDialogProps = {
  pageId: string;
  pageTitle: string;
  /** Silindikten sonra gidilecek adres (sayfa ekranından silinince) */
  redirectTo?: string;
};

export function DeletePageDialog({ pageId, pageTitle, redirectTo }: DeletePageDialogProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const result = await deletePageAction(pageId);

      if (!result.success) {
        setError(result.error);
        return;
      }

      setOpen(false);
      if (redirectTo) router.push(redirectTo);
      else router.refresh();
    } catch {
      setError("Silme işlemi sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (loading) return;
        setOpen(nextOpen);
        if (!nextOpen) setError(null);
      }}
    >
      <AlertDialogTrigger className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50">
        <Trash2 className="size-3.5" />
        Çöp Kutusuna Taşı
      </AlertDialogTrigger>

      <AlertDialogContent className="border-border bg-surface">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-foreground">
            Sayfayı çöp kutusuna taşı
          </AlertDialogTitle>

          <AlertDialogDescription className="leading-6 text-muted-foreground">
            <strong>{pageTitle}</strong> sayfasını çöp kutusuna taşımak
            istediğinizden emin misiniz? Sayfa yayından kaldırılacak ve daha
            sonra geri yüklenebilecek.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>İptal</AlertDialogCancel>

          <AlertDialogAction
            disabled={loading}
            onClick={(event) => {
              event.preventDefault();
              void handleDelete();
            }}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Siliniyor...
              </>
            ) : (
              <>
                <Trash2 className="size-4" />
                Çöp Kutusuna Taşı
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
