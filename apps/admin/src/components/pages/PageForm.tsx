"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, Globe2, Loader2, Save, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { FormField } from "@/components/forms/FormField";
import { FormTextarea } from "@/components/forms/FormTextarea";
import { FormSwitch } from "@/components/forms/FormSwitch";

import {
  pageSchema,
  pageDefaultValues,
  type PageFormValues,
} from "@/lib/validations/page.schema";

type FormTab = "content" | "seo" | "publish";

type PageFormProps = {
  mode: "create" | "edit";
  initialData?: Partial<PageFormValues>;
  onSubmit?: (values: PageFormValues) => Promise<void>;
  onCancel?: () => void;
};

export function PageForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
}: PageFormProps) {
  const [activeTab, setActiveTab] = useState<FormTab>("content");

  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<PageFormValues>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      ...pageDefaultValues,
      ...initialData,
    },
    shouldUnregister: false,
  });

  const title = useWatch({ control, name: "title" });
  const slug = useWatch({ control, name: "slug" });
  const seoTitle = useWatch({ control, name: "seoTitle" });
  const seoDescription = useWatch({
    control,
    name: "seoDescription",
  });
  const published = useWatch({
    control,
    name: "published",
  });

  const previewTitle = seoTitle?.trim() || title?.trim() || "Sayfa Başlığı";

  const previewDescription =
    seoDescription?.trim() ||
    "Sayfanızın arama sonuçlarında görünecek açıklaması burada yer alacak.";

  const previewSlug = slug?.trim() || "sayfa-adresi";

  async function submitForm(values: PageFormValues) {
    setSubmitError(null);

    if (!onSubmit) {
      setSubmitError("Kaydetme işlemi henüz API'ye bağlanmadı.");
      return;
    }

    try {
      await onSubmit(values);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Sayfa kaydedilirken bir hata oluştu.",
      );
    }
  }

  function handleInvalid() {
    if (errors.title || errors.slug || errors.content) {
      setActiveTab("content");
    } else if (
      errors.seoTitle ||
      errors.seoDescription ||
      errors.seoKeywords ||
      errors.ogImageUrl
    ) {
      setActiveTab("seo");
    }
  }

  const canSubmit = !isSubmitting && (mode === "create" || isDirty);

  return (
    <form
      onSubmit={handleSubmit(submitForm, handleInvalid)}
      noValidate
      className="flex min-h-0 flex-col"
    >
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as FormTab)}
        className="w-full"
      >
        <TabsList
          className="
            mb-6
            grid
            h-15!
            min-h-15
            w-full
            grid-cols-3
            items-center
            gap-1
            rounded-xl
            bg-surface-muted
            p-2
        "
        >
          <TabsTrigger value="content" className="gap-2 py-3">
            <FileText className="size-4" />
            İçerik
          </TabsTrigger>

          <TabsTrigger value="seo" className="gap-2 py-3">
            <Search className="size-4" />
            SEO
          </TabsTrigger>

          <TabsTrigger value="publish" className="gap-2 py-3">
            <Globe2 className="size-4" />
            Yayın
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-5">
          <FormField
            name="title"
            label="Sayfa Başlığı"
            placeholder="Örneğin: Hakkımızda"
            register={register}
            error={errors.title}
            required
          />

          <FormField
            name="slug"
            label="URL Adresi"
            placeholder="hakkimizda"
            description="Küçük harf, rakam ve tire kullanın."
            register={register}
            error={errors.slug}
            required
          />

          <FormTextarea
            name="content"
            label="Sayfa İçeriği"
            placeholder="Sayfanızın içeriğini yazın..."
            rows={10}
            register={register}
            error={errors.content}
          />
        </TabsContent>

        <TabsContent value="seo" className="space-y-5">
          <FormField
            name="seoTitle"
            label="SEO Başlığı"
            placeholder="Arama sonuçlarında görünecek başlık"
            register={register}
            error={errors.seoTitle}
          />

          <FormTextarea
            name="seoDescription"
            label="SEO Açıklaması"
            placeholder="Sayfanızın kısa açıklaması..."
            rows={3}
            register={register}
            error={errors.seoDescription}
          />

          <FormField
            name="seoKeywords"
            label="Anahtar Kelimeler"
            placeholder="kurumsal, hakkımızda, hizmetler"
            register={register}
            error={errors.seoKeywords}
          />

          <FormField
            name="ogImageUrl"
            label="Sosyal Medya Görsel URL'si"
            placeholder="https://example.com/image.jpg"
            register={register}
            error={errors.ogImageUrl}
          />

          <div className="rounded-xl border border-border bg-surface-muted/50 p-4">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Arama Sonucu Önizlemesi
            </p>

            <p className="break-all text-xs text-muted-foreground">
              /{previewSlug}
            </p>

            <p className="mt-2 break-words text-base font-medium text-[#1a0dab] dark:text-[#a8c7fa]">
              {previewTitle}
            </p>

            <p className="mt-1 break-words text-sm text-muted-foreground">
              {previewDescription}
            </p>
          </div>
        </TabsContent>

        <TabsContent value="publish" className="space-y-5">
          <FormSwitch
            name="published"
            label="Sayfayı Yayınla"
            description="Sayfayı yayında olarak işaretle."
            control={control}
          />

          <FormSwitch
            name="noIndex"
            label="Arama Motorlarından Gizle"
            description="Sayfanın indekslenmesini engellemek için noindex ayarını etkinleştir."
            control={control}
          />

          <div className="rounded-xl bg-surface-muted p-4 text-sm text-muted-foreground">
            Yayın durumu:{" "}
            <span className="font-semibold text-foreground">
              {published ? "Yayında" : "Taslak"}
            </span>
          </div>
        </TabsContent>
      </Tabs>

      {submitError && (
        <div
          role="alert"
          className="mt-5 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
        >
          {submitError}
        </div>
      )}

      <div className="mt-7 flex flex-wrap items-center justify-end gap-3 border-t border-border pt-5">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            İptal
          </Button>
        )}

        <Button
          type="submit"
          disabled={!canSubmit}
          className="min-h-11 gap-2 px-5"
        >
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}

          {isSubmitting ? "Kaydediliyor..." : "Sayfayı Kaydet"}
        </Button>
      </div>
    </form>
  );
}
