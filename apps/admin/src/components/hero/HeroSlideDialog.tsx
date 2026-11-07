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
import { HeroSlideForm } from "@/components/hero/HeroSlideForm";

import {
  createHeroSlideAction,
  updateHeroSlideAction,
} from "@/app/actions/hero-slides";
import type { HeroSlideFormValues } from "@/lib/validations/hero-slide.schema";

type HeroSlideDialogProps =
  | { mode: "create"; mediaBaseUrl: string }
  | {
      mode: "edit";
      slideId: string;
      initialValues: HeroSlideFormValues;
      mediaBaseUrl: string;
    };

export function HeroSlideDialog(props: HeroSlideDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);

  function openDialog() {
    setFormKey((key) => key + 1);
    setOpen(true);
  }

  return (
    <>
      {props.mode === "create" ? (
        <Button
          type="button"
          onClick={openDialog}
          className="min-h-11 gap-2 px-5 font-semibold"
        >
          <Plus className="size-4" />
          Yeni Slider
        </Button>
      ) : (
        <Button
          type="button"
          variant="outline"
          aria-label="Slider'ı düzenle"
          onClick={openDialog}
          className="size-9 p-0"
        >
          <Pencil className="size-4" />
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92dvh] overflow-y-auto p-6 sm:max-w-3xl! sm:p-8">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {props.mode === "create" ? "Yeni Slider" : "Slider'ı Düzenle"}
            </DialogTitle>
            <DialogDescription>
              Ana sayfanın en üstünde görünen kayan alan.
            </DialogDescription>
          </DialogHeader>

          <HeroSlideForm
            key={formKey}
            mode={props.mode}
            initialValues={props.mode === "edit" ? props.initialValues : undefined}
            mediaBaseUrl={props.mediaBaseUrl}
            onCancel={() => setOpen(false)}
            onSubmit={async (values) => {
              const result =
                props.mode === "create"
                  ? await createHeroSlideAction(values)
                  : await updateHeroSlideAction(props.slideId, values);
              if (!result.success) return result.error;
              setOpen(false);
              router.refresh();
              return null;
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
