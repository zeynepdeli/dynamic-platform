"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";

import { getPageForEditAction, updatePageAction } from "@/app/actions/pages";

import { PageDialog } from "@/components/pages/PageDialog";

import type { PageFormValues } from "@/lib/validations/page.schema";

type EditPageDialogProps = {
  pageId: string;
  mobile?: boolean;
};

export function EditPageDialog({
  pageId,
  mobile = false,
}: EditPageDialogProps) {
  const [loading, setLoading] = useState(false);

  const [initialData, setInitialData] = useState<PageFormValues | null>(null);

  const [error, setError] = useState<string | null>(null);

  async function handleOpen() {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const result = await getPageForEditAction(pageId);

      if (!result.success) {
        setError(result.error);
        return;
      }

      setInitialData(result.data);
    } catch {
      setError("Sayfa bilgileri yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(values: PageFormValues) {
    const result = await updatePageAction(pageId, values);

    if (!result.success) {
      throw new Error(result.error);
    }
  }

  function handleClose() {
    setInitialData(null);
    setError(null);
  }

  return (
    <>
      <div className={mobile ? "w-full" : "inline-flex"}>
        <button
          type="button"
          disabled={loading}
          onClick={handleOpen}
          className={
            mobile
              ? "flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-[#346872]/20 bg-[#346872]/5 px-4 text-sm font-semibold text-[#346872] transition-colors hover:bg-[#346872]/10 disabled:cursor-not-allowed disabled:opacity-50"
              : "inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-[#346872] transition-colors hover:border-[#346872]/30 hover:bg-[#346872]/10 disabled:cursor-not-allowed disabled:opacity-50"
          }
        >
          <Pencil className={mobile ? "size-4" : "size-3.5"} />

          {loading ? "Yükleniyor..." : mobile ? "Sayfayı Düzenle" : "Düzenle"}
        </button>

        {error && (
          <p role="alert" className="mt-2 text-xs text-red-600">
            {error}
          </p>
        )}
      </div>

      {initialData !== null && (
        <PageDialog
          mode="edit"
          initialData={initialData}
          onSubmit={handleUpdate}
          initialOpen
          hideTrigger
          onClose={handleClose}
        />
      )}
    </>
  );
}
