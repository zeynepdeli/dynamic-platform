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
import { FormSwitch } from "@/components/forms/FormSwitch";

import {
  createMenuItemAction,
  updateMenuItemAction,
} from "@/app/actions/menu";
import {
  menuItemDefaultValues,
  menuItemSchema,
  type MenuItemFormValues,
} from "@/lib/validations/menu.schema";

type ParentOption = { id: string; label: string };

type MenuItemDialogProps =
  | {
      mode: "create";
      parents: ParentOption[];
      defaultParentId?: string;
      triggerLabel?: string;
    }
  | {
      mode: "edit";
      itemId: string;
      initialValues: MenuItemFormValues;
      parents: ParentOption[];
      /** Alt menüsü olan öğe başka öğenin altına taşınamaz */
      hasChildren: boolean;
    };

function MenuItemForm({
  props,
  onDone,
  onCancel,
}: {
  props: MenuItemDialogProps;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues:
      props.mode === "edit"
        ? props.initialValues
        : { ...menuItemDefaultValues, parentId: props.defaultParentId ?? "" },
  });

  async function submit(values: MenuItemFormValues) {
    setSubmitError(null);
    const result =
      props.mode === "create"
        ? await createMenuItemAction(values)
        : await updateMenuItemAction(props.itemId, values);

    if (!result.success) {
      setSubmitError(result.error);
      return;
    }
    onDone();
  }

  // Kendisi üst menü olarak seçilemez
  const parentOptions = props.parents.filter(
    (p) => props.mode === "create" || p.id !== props.itemId,
  );
  const parentLocked = props.mode === "edit" && props.hasChildren;

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-5">
      <FormField
        name="label"
        label="Menü Başlığı"
        placeholder="ör. Hakkımızda"
        register={register}
        error={errors.label}
        required
      />

      <FormField
        name="href"
        label="Bağlantı"
        placeholder="/hakkimizda"
        description="Site içi adres, / ile başlamalı."
        register={register}
        error={errors.href}
        required
      />

      <label className="flex flex-col gap-2 text-sm font-medium">
        Üst Menü
        <select
          {...register("parentId")}
          disabled={parentLocked}
          className="min-h-11 rounded-xl border border-border bg-surface px-3 text-sm disabled:opacity-60"
        >
          <option value="">— Üst seviye —</option>
          {parentOptions.map((parent) => (
            <option key={parent.id} value={parent.id}>
              {parent.label}
            </option>
          ))}
        </select>
        {parentLocked && (
          <span className="text-xs font-normal text-muted-foreground">
            Alt menüsü olan bir öğe başka bir menünün altına taşınamaz.
          </span>
        )}
      </label>

      <FormSwitch
        name="visible"
        label="Görünür"
        description="Kapalıysa menüde gösterilmez (alt menüleri de gizlenir)."
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

export function MenuItemDialog(props: MenuItemDialogProps) {
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
          variant={props.defaultParentId ? "outline" : "default"}
          onClick={openDialog}
          className={props.defaultParentId ? "h-8 gap-1.5 px-3 text-xs" : "min-h-11 gap-2 px-5 font-semibold"}
        >
          <Plus className={props.defaultParentId ? "size-3.5" : "size-4"} />
          {props.triggerLabel ?? "Yeni Menü Öğesi"}
        </Button>
      ) : (
        <Button
          type="button"
          variant="outline"
          aria-label="Menü öğesini düzenle"
          onClick={openDialog}
          className="size-9 p-0"
        >
          <Pencil className="size-4" />
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-6 sm:max-w-lg sm:p-8">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {props.mode === "create" ? "Yeni Menü Öğesi" : "Menü Öğesini Düzenle"}
            </DialogTitle>
            <DialogDescription>
              Menüde görünecek başlığı ve bağlantıyı girin.
            </DialogDescription>
          </DialogHeader>

          <MenuItemForm
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
