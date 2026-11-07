"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  SectionForm,
  type SectionLock,
} from "@/components/sections/SectionForm";

import {
  createSectionAction,
  updateSectionAction,
} from "@/app/actions/sections";
import type { SectionFormValues } from "@/lib/validations/section.schema";

type SectionDialogProps =
  | {
      mode: "create";
      pageId: string | null;
      mediaBaseUrl: string;
    }
  | {
      mode: "edit";
      sectionId: string;
      initialValues: SectionFormValues;
      mediaBaseUrl: string;
      lock?: SectionLock | null;
    };

export function SectionDialog(props: SectionDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  // Her açılışta formu sıfırdan oluştur (eski değerler kalmasın)
  const [formKey, setFormKey] = useState(0);

  async function handleSubmit(values: SectionFormValues) {
    const result =
      props.mode === "create"
        ? await createSectionAction(props.pageId, values)
        : await updateSectionAction(props.sectionId, values);

    if (!result.success) return result.error;

    setOpen(false);
    router.refresh();
    return null;
  }

  return (
    <>
      {props.mode === "create" ? (
        <Button
          type="button"
          onClick={() => {
            setFormKey((key) => key + 1);
            setOpen(true);
          }}
          className="min-h-11 gap-2 px-5 font-semibold"
        >
          <Plus className="size-4" />
          Yeni Bölüm
        </Button>
      ) : (
        <Button
          type="button"
          variant="outline"
          aria-label="Bölümü düzenle"
          onClick={() => {
            setFormKey((key) => key + 1);
            setOpen(true);
          }}
          className="size-9 p-0"
        >
          <Pencil className="size-4" />
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-3xl! p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {props.mode === "create"
                ? "Yeni Bölüm"
                : (props.lock?.label ?? "Bölümü Düzenle")}
            </DialogTitle>
            <DialogDescription>
              Bölümün tipini, içeriğini ve görünümünü ayarlayın.
            </DialogDescription>
          </DialogHeader>

          <SectionForm
            key={formKey}
            mode={props.mode}
            lock={props.mode === "edit" ? props.lock : null}
            initialValues={
              props.mode === "edit" ? props.initialValues : undefined
            }
            mediaBaseUrl={props.mediaBaseUrl}
            onSubmit={handleSubmit}
            onCancel={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
