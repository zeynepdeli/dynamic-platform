"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, Plus, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormField } from "@/components/forms/FormField";
import { FormTextarea } from "@/components/forms/FormTextarea";
import { FormSwitch } from "@/components/forms/FormSwitch";
import { ImageUploadField } from "@/components/forms/ImageUploadField";

import {
  createHeroSlideAction,
  updateHeroSlideAction,
} from "@/app/actions/hero-slides";
import {
  heroSlideDefaultValues,
  heroSlideSchema,
  type HeroSlideFormValues,
} from "@/lib/validations/hero-slide.schema";

type HeroSlideDialogProps =
  | { mode: "create"; mediaBaseUrl: string }
  | {
      mode: "edit";
      slideId: string;
      initialValues: HeroSlideFormValues;
      mediaBaseUrl: string;
    };

function HeroSlideForm({
  props,
  onDone,
  onCancel,
}: {
  props: HeroSlideDialogProps;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<HeroSlideFormValues>({
    resolver: zodResolver(heroSlideSchema),
    defaultValues:
      props.mode === "edit" ? props.initialValues : heroSlideDefaultValues,
  });

  async function submit(values: HeroSlideFormValues) {
    setSubmitError(null);
    const result =
      props.mode === "create"
        ? await createHeroSlideAction(values)
        : await updateHeroSlideAction(props.slideId, values);

    if (!result.success) {
      setSubmitError(result.error);
      return;
    }
    onDone();
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2">
        <FormField
          name="title"
          label="Başlık"
          register={register}
          error={errors.title}
          required
        />
        <FormField
          name="subtitle"
          label="Üst Başlık"
          placeholder="ör. Hoş Geldiniz"
          register={register}
          error={errors.subtitle}
        />
      </div>

      <FormTextarea
        name="description"
        label="Açıklama"
        description="Düz metin olarak gösterilir (HTML çalışmaz)."
        rows={3}
        register={register}
        error={errors.description}
      />

      <ImageUploadField
        name="imageUrl"
        label="Görsel (masaüstü)"
        control={control}
        mediaBaseUrl={props.mediaBaseUrl}
        description="Geniş görsel önerilir (ör. 1920×800) — en fazla 5 MB."
      />

      <ImageUploadField
        name="mobileImageUrl"
        label="Görsel (mobil, isteğe bağlı)"
        control={control}
        mediaBaseUrl={props.mediaBaseUrl}
        description="Boşsa masaüstü görseli kullanılır. Dikey görsel önerilir."
        previewClassName="aspect-[3/4] @md:w-32"
      />

      <div className="grid gap-5 md:grid-cols-2">
        <FormField
          name="buttonText"
          label="Buton Metni"
          placeholder="ör. Keşfet"
          register={register}
          error={errors.buttonText}
        />
        <FormField
          name="buttonHref"
          label="Buton Bağlantısı"
          placeholder="/hakkimizda"
          description="Site içi adres, / ile başlamalı."
          register={register}
          error={errors.buttonHref}
        />
      </div>

      <FormSwitch
        name="active"
        label="Yayında"
        description="Kapalıysa slider sitede gösterilmez."
        control={control}
      />

      {submitError && (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
        >
          {submitError}
        </div>
      )}

      <div className="flex justify-end gap-3 border-t border-border pt-5">
        <Button type="button" variant="outline" onClick={onCancel}>
          İptal
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || (props.mode === "edit" && !isDirty)}
          className="min-h-11 gap-2 px-5"
        >
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
        </Button>
      </div>
    </form>
  );
}

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
            props={props}
            onCancel={() => setOpen(false)}
            onDone={() => {
              setOpen(false);
              router.refresh();
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
