"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/FormField";
import { FormTextarea } from "@/components/forms/FormTextarea";
import { FormSwitch } from "@/components/forms/FormSwitch";
import { ImageUploadField } from "@/components/forms/ImageUploadField";
import { TranslationPanel } from "@/components/i18n/TranslationPanel";
import { createPostAction, updatePostAction } from "@/app/actions/posts";
import { slugify } from "@/lib/datetime";
import { useUnsavedChanges } from "@/lib/hooks/use-unsaved-changes";
import { postDefaultValues, postSchema, type PostFormValues } from "@/lib/validations/post.schema";

type PostFormProps = {
  mode: "create" | "edit";
  postId?: string;
  initialValues?: PostFormValues;
  mediaBaseUrl: string;
};

export function PostForm({ mode, postId, initialValues, mediaBaseUrl }: PostFormProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  // Yeni yazıda adres, kullanıcı elle değiştirene kadar başlıktan üretilir
  const slugTouched = useRef(mode === "edit");

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: initialValues ?? postDefaultValues,
  });

  useUnsavedChanges(isDirty && !isSubmitting);

  const published = useWatch({ control, name: "published" });
  const slug = useWatch({ control, name: "slug" });
  const title = useWatch({ control, name: "title" });

  useEffect(() => {
    if (!slugTouched.current) setValue("slug", slugify(title ?? ""), { shouldDirty: true });
  }, [title, setValue]);

  async function submit(values: PostFormValues) {
    setSubmitError(null);
    setSaved(false);
    if (mode === "create") {
      const result = await createPostAction(values);
      if (!result.success) return setSubmitError(result.error);
      reset(values); // çıkış uyarısı tetiklenmesin
      router.replace(`/blog/${result.id}`);
      return;
    }
    if (!postId) return;
    const result = await updatePostAction(postId, values);
    if (!result.success) return setSubmitError(result.error);
    reset(values);
    setSaved(true);
    router.refresh();
  }

  const canSubmit = !isSubmitting && (mode === "create" || isDirty);

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="@container space-y-6">
      <div className="grid gap-6 @4xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <FormField name="title" label="Başlık" required register={register} error={errors.title} />
          {/* Adres elle yazılınca başlıktan otomatik üretim durur */}
          <div
            onInput={() => {
              slugTouched.current = true;
            }}
          >
            <FormField
              name="slug"
              label="Adres (URL)"
              required
              description={`Sitede: /blog/${slug?.trim() || "yazi-adresi"}`}
              register={register}
              error={errors.slug}
            />
          </div>
          <FormTextarea
            name="excerpt"
            label="Özet"
            description="Listede ve paylaşımlarda görünen kısa tanıtım (en fazla 500 karakter)."
            rows={3}
            register={register}
            error={errors.excerpt}
          />
          <FormTextarea
            name="content"
            label="İçerik"
            description="Paragrafları boş bir satırla ayırın. Düz metin olarak gösterilir (HTML çalışmaz)."
            rows={18}
            register={register}
            error={errors.content}
          />
        </div>

        <aside className="space-y-5">
          <div className="space-y-4 rounded-2xl border border-border bg-surface p-4">
            <p className="text-sm font-semibold">Yayın</p>
            <FormSwitch
              name="published"
              label="Yayında"
              description={published ? "Yayın tarihi geldiğinde sitede görünür." : "Taslak: sitede görünmez."}
              control={control}
            />
            <FormField
              name="publishedAt"
              label="Yayın Tarihi (Türkiye saati)"
              type="datetime-local"
              description="Boşsa yayına alındığı an. İleri bir tarih seçerseniz o ana kadar gizli kalır."
              register={register}
              error={errors.publishedAt}
            />
            <FormField
              name="category"
              label="Kategori (isteğe bağlı)"
              placeholder="ör. Duyurular"
              register={register}
              error={errors.category}
            />
          </div>

          <ImageUploadField
            name="coverImageUrl"
            label="Kapak Görseli"
            control={control}
            mediaBaseUrl={mediaBaseUrl}
            description="Liste kartında ve paylaşımlarda kullanılır (ör. 1200×630)."
          />

          <div className="space-y-4 rounded-2xl border border-border bg-surface p-4">
            <p className="text-sm font-semibold">SEO (isteğe bağlı)</p>
            <FormField name="seoTitle" label="SEO Başlığı" description="Boşsa yazı başlığı." register={register} error={errors.seoTitle} />
            <FormTextarea
              name="seoDescription"
              label="SEO Açıklaması"
              description="Boşsa özet kullanılır."
              rows={3}
              register={register}
              error={errors.seoDescription}
            />
          </div>
        </aside>
      </div>

      <TranslationPanel
        control={control}
        register={register}
        fields={[
          { name: "title", label: "Başlık" },
          { name: "slug", label: "Adres (URL)", placeholder: "my-first-post" },
          { name: "excerpt", label: "Özet", multiline: true, rows: 3 },
          { name: "content", label: "İçerik", multiline: true, rows: 12 },
          { name: "category", label: "Kategori" },
          { name: "seoTitle", label: "SEO Başlığı" },
          { name: "seoDescription", label: "SEO Açıklaması", multiline: true, rows: 2 },
        ]}
      />

      {submitError && (
        <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {submitError}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-4">
        {saved && !isDirty && (
          <span role="status" className="mr-auto flex items-center gap-1.5 text-sm text-emerald-700">
            <CheckCircle2 className="size-4" />
            Kaydedildi
          </span>
        )}
        <Button type="submit" disabled={!canSubmit} className="min-h-10 gap-2 px-5">
          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {isSubmitting ? "Kaydediliyor..." : mode === "create" ? "Yazıyı Oluştur" : "Kaydet"}
        </Button>
      </div>
    </form>
  );
}
