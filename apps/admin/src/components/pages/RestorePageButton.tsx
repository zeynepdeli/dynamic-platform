"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RotateCcw } from "lucide-react";

import { restorePageAction } from "@/app/actions/pages";

type RestorePageButtonProps = {
  pageId: string;
};

export function RestorePageButton({ pageId }: RestorePageButtonProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRestore() {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const result = await restorePageAction(pageId);

      if (!result.success) {
        setError(result.error);
        return;
      }

      router.refresh();
    } catch {
      setError("Geri yükleme sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={() => void handleRestore()}
        disabled={loading}
        className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-background disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <RotateCcw className="size-4" />
        )}

        {loading ? "Yükleniyor..." : "Geri Yükle"}
      </button>

      {error && (
        <p role="alert" className="max-w-64 text-right text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
