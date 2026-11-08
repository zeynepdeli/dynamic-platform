"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, ImagePlus, ListPlus, Loader2, Save, Trash2 } from "lucide-react";

import { AreaCard } from "@/components/areas/AreaShell";
import { OrderButtons } from "@/components/common/OrderButtons";
import { FormField } from "@/components/forms/FormField";
import { FormSwitch } from "@/components/forms/FormSwitch";
import { FormTextarea } from "@/components/forms/FormTextarea";
import { ImageUploadField } from "@/components/forms/ImageUploadField";
import { Button } from "@/components/ui/button";

import { createProductAction, updateProductAction } from "@/app/actions/shop";
import { useUnsavedChanges } from "@/lib/hooks/use-unsaved-changes";
import { slugify } from "@/lib/slugify";
import {
  MAX_PRODUCT_IMAGES,
  MAX_PRODUCT_TABS,
  productDefaultValues,
  productSchema,
  type ProductFormValues,
} from "@/lib/validations/shop.schema";

type Props = {
  productId?: string;
  initialValues?: ProductFormValues;
  categories: { id: string; name: string }[];
  mediaBaseUrl: string;
};

const selectClass = "min-h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm";

export function ProductForm({ productId, initialValues, categories, mediaBaseUrl }: Props) {
  const router = useRouter();
  const isNew = !productId;
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting, isDirty, dirtyFields },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: initialValues ?? productDefaultValues,
  });
  const images = useFieldArray({ control, name: "images" });
  const tabs = useFieldArray({ control, name: "tabs" });

  useUnsavedChanges(isDirty && !isSubmitting);

  // Yeni üründe adres, ad yazıldıkça oluşur (elle değiştirilene kadar)
  const name = useWatch({ control, name: "name" });
  const trackStock = useWatch({ control, name: "trackStock" });
  const slugTouched = !isNew || !!dirtyFields.slug;
  useEffect(() => {
    if (!slugTouched) setValue("slug", slugify(name));
  }, [name, slugTouched, setValue]);

  async function submit(values: ProductFormValues) {
    setSubmitError(null);
    setSaved(false);
    if (isNew) {
      const result = await createProductAction(values);
      if (!result.success) return setSubmitError(result.error);
      reset(values); // uyarı çıkmadan yönlensin
      router.replace(`/shop/products/${result.id}?yeni=1`);
      return;
    }
    const result = await updateProductAction(productId, values);
    if (!result.success) return setSubmitError(result.error);
    reset(values);
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-5">
      <AreaCard title="Temel Bilgiler" hint="Ürün kartında ve ürün sayfasında görünen bilgiler.">
        <div className="grid gap-5 @xl:grid-cols-2">
          <FormField name="name" label="Ürün Adı" register={register} error={errors.name} required />
          <FormField name="slug" label="Adres" description="Sitede /urun/<adres> olarak görünür." register={register} error={errors.slug} required />
          <label className="flex flex-col gap-2 text-sm font-medium">
            Kategori
            <select {...register("categoryId")} className={selectClass}>
              <option value="">— Kategorisiz —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <FormField name="unit" label="Satış Birimi" placeholder="ör. 500 g, 1 kg, Adet" register={register} error={errors.unit} />
        </div>
        <div className="mt-5 space-y-5">
          <FormTextarea name="summary" label="Kısa Açıklama" description="Ürün kartlarında görünür." rows={2} register={register} error={errors.summary} />
          <FormTextarea name="description" label="Ürün Açıklaması" description="Düz metin olarak gösterilir (HTML çalışmaz)." rows={6} register={register} error={errors.description} />
        </div>
      </AreaCard>

      <AreaCard title="Fiyat ve Stok" hint="Fiyatlar TL, KDV dahil girilir. Satış sırasında fiyat ve stok her zaman sunucuda kontrol edilir.">
        <div className="grid gap-5 @xl:grid-cols-3">
          <FormField name="price" label="Satış Fiyatı (₺)" placeholder="249,90" register={register} error={errors.price} required />
          <FormField
            name="compareAtPrice"
            label="Eski Fiyat (₺)"
            placeholder="299,90"
            description="Doluysa üstü çizili gösterilir (indirim)."
            register={register}
            error={errors.compareAtPrice}
          />
          <FormField name="sku" label="Stok Kodu (SKU)" register={register} error={errors.sku} />
        </div>
        <div className="mt-5 grid items-start gap-5 @xl:grid-cols-2">
          <FormSwitch name="trackStock" label="Stok takibi" description="Kapalıysa ürün stok adedine bakılmadan satılır." control={control} />
          {trackStock && <FormField name="stock" label="Stok Adedi" type="number" register={register} error={errors.stock} />}
        </div>
      </AreaCard>

      <AreaCard
        title="Ürün Görselleri"
        hint={`İlk görsel kapak olarak kullanılır. En fazla ${MAX_PRODUCT_IMAGES} görsel.`}
        action={
          <Button
            type="button"
            variant="outline"
            disabled={images.fields.length >= MAX_PRODUCT_IMAGES}
            onClick={() => images.append({ url: "", alt: "" })}
            className="gap-2"
          >
            <ImagePlus className="size-4" />
            Görsel Ekle
          </Button>
        }
      >
        {images.fields.length === 0 ? (
          <p className="text-sm text-muted-foreground">Henüz görsel yok.</p>
        ) : (
          <ol className="grid gap-4 @3xl:grid-cols-2">
            {images.fields.map((field, index) => (
              <li key={field.id} className="flex gap-3 rounded-2xl border border-border p-4">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground">{index === 0 ? "Kapak" : index + 1}</span>
                  <OrderButtons index={index} total={images.fields.length} size="sm" onMove={(d) => images.move(index, index + d)} />
                  <button
                    type="button"
                    aria-label="Görseli kaldır"
                    onClick={() => images.remove(index)}
                    className="inline-flex size-7 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
                <div className="min-w-0 flex-1 space-y-3">
                  <ImageUploadField name={`images.${index}.url`} label="Görsel" control={control} mediaBaseUrl={mediaBaseUrl} required />
                  <FormField
                    name={`images.${index}.alt`}
                    label="Görsel Açıklaması (alt)"
                    placeholder="ör. Dilimlenmiş tulum peyniri"
                    register={register}
                    error={errors.images?.[index]?.alt}
                  />
                  {errors.images?.[index]?.url && (
                    <p role="alert" className="text-sm text-destructive">{errors.images[index]?.url?.message}</p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </AreaCard>

      <AreaCard
        title="Ürün Detay Sekmeleri"
        hint="Ürün sayfasındaki sekmeler (ör. Hikaye, Özellikler, Nasıl Servis Edilir?)."
        action={
          <Button
            type="button"
            variant="outline"
            disabled={tabs.fields.length >= MAX_PRODUCT_TABS}
            onClick={() => tabs.append({ title: "", body: "" })}
            className="gap-2"
          >
            <ListPlus className="size-4" />
            Sekme Ekle
          </Button>
        }
      >
        {tabs.fields.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sekme yok. Ürün sayfasında yalnızca açıklama görünür.</p>
        ) : (
          <ol className="space-y-4">
            {tabs.fields.map((field, index) => (
              <li key={field.id} className="flex gap-3 rounded-2xl border border-border p-4">
                <div className="flex flex-col items-center gap-2">
                  <OrderButtons index={index} total={tabs.fields.length} size="sm" onMove={(d) => tabs.move(index, index + d)} />
                  <button
                    type="button"
                    aria-label="Sekmeyi kaldır"
                    onClick={() => tabs.remove(index)}
                    className="inline-flex size-7 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
                <div className="min-w-0 flex-1 space-y-3">
                  <FormField name={`tabs.${index}.title`} label="Sekme Başlığı" register={register} error={errors.tabs?.[index]?.title} required />
                  <FormTextarea name={`tabs.${index}.body`} label="İçerik" rows={4} register={register} error={errors.tabs?.[index]?.body} required />
                </div>
              </li>
            ))}
          </ol>
        )}
      </AreaCard>

      <AreaCard title="Yayın">
        <div className="grid gap-5 @xl:grid-cols-2">
          <FormSwitch name="active" label="Yayında" description="Kapalıysa ürün sitede görünmez ve satılamaz." control={control} />
          <FormSwitch name="featured" label="Öne çıkan ürün" description="Ana sayfa vitrini gibi alanlarda gösterilir." control={control} />
        </div>
      </AreaCard>

      <AreaCard title="Arama Motoru (SEO)" hint="Boş bırakılırsa ürün adı ve kısa açıklama kullanılır.">
        <div className="space-y-5">
          <FormField name="metaTitle" label="SEO Başlığı" register={register} error={errors.metaTitle} />
          <FormTextarea name="metaDescription" label="SEO Açıklaması" rows={2} register={register} error={errors.metaDescription} />
        </div>
      </AreaCard>

      {submitError && (
        <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {submitError}
        </div>
      )}
      {Object.keys(errors).length > 0 && !submitError && (
        <p role="alert" className="text-sm text-destructive">Kaydetmeden önce işaretli alanları düzeltin.</p>
      )}

      <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-end gap-3 rounded-2xl border border-border bg-card/95 p-4 shadow-sm backdrop-blur">
        {saved && !isDirty && (
          <span role="status" className="mr-auto flex items-center gap-1.5 text-sm text-emerald-700">
            <CheckCircle2 className="size-4" />
            Kaydedildi
          </span>
        )}
        <Button type="submit" disabled={isSubmitting || (!isNew && !isDirty)} className="min-h-11 gap-2 px-6">
          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {isSubmitting ? "Kaydediliyor..." : isNew ? "Ürünü Oluştur" : "Ürünü Kaydet"}
        </Button>
      </div>
    </form>
  );
}
