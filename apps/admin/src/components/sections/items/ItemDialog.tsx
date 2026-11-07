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
import { ItemForm } from "@/components/sections/items/ItemForm";

import { createItemAction, updateItemAction } from "@/app/actions/sections";
import type { SectionItemFormValues } from "@/lib/validations/section.schema";

type ItemDialogProps =
  | { mode: "create"; sectionId: string; mediaBaseUrl: string }
  | {
      mode: "edit";
      sectionId: string;
      itemId: string;
      initialValues: SectionItemFormValues;
      mediaBaseUrl: string;
    };

export function ItemDialog(props: ItemDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);

  function openDialog() {
    setFormKey((key) => key + 1);
    setOpen(true);
  }

  async function handleSubmit(values: SectionItemFormValues) {
    const result =
      props.mode === "create"
        ? await createItemAction(props.sectionId, values)
        : await updateItemAction(props.sectionId, props.itemId, values);

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
          variant="outline"
          onClick={openDialog}
          className="gap-2"
        >
          <Plus className="size-4" />
          Kart Ekle
        </Button>
      ) : (
        <Button
          type="button"
          variant="outline"
          aria-label="Kartı düzenle"
          onClick={openDialog}
          className="size-9 p-0"
        >
          <Pencil className="size-4" />
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92dvh] overflow-y-auto p-6 sm:max-w-2xl! sm:p-8">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {props.mode === "create" ? "Yeni Kart" : "Kartı Düzenle"}
            </DialogTitle>
            <DialogDescription>
              Kartın başlığını, görselini ve bağlantısını ayarlayın.
            </DialogDescription>
          </DialogHeader>

          <ItemForm
            key={formKey}
            mode={props.mode}
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
