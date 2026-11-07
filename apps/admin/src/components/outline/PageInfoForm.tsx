"use client";

import { useRouter } from "next/navigation";

import { PageForm } from "@/components/pages/PageForm";
import { updatePageAction } from "@/app/actions/pages";
import type { PageFormValues } from "@/lib/validations/page.schema";

/** Sayfa başlığı, adresi, içerik, SEO ve yayın durumu — sayfa içinde */
export function PageInfoForm({ pageId, initialData }: { pageId: string; initialData: PageFormValues }) {
  const router = useRouter();

  return (
    <PageForm
      mode="edit"
      initialData={initialData}
      onSubmit={async (values) => {
        const result = await updatePageAction(pageId, values);
        if (!result.success) throw new Error(result.error);
        router.refresh();
      }}
    />
  );
}
