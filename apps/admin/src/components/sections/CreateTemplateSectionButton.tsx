"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createSectionAction } from "@/app/actions/sections";
import type { TemplateSection } from "@/brand/page-templates";
import { sectionDefaultValues } from "@/lib/validations/section.schema";

type CreateTemplateSectionButtonProps = {
  pageId: string | null;
  entry: TemplateSection;
  /** Bu bölüme bağlı bölümler (ör. Hakkımızda → Yuvarlak Görseller): birlikte oluşturulur */
  attached?: TemplateSection[];
  /** Buton yazısı (varsayılan: Oluştur) */
  label?: string;
};

// Şablonda tanımlı ama henüz oluşturulmamış bölümü tek tıkla oluşturur
export function CreateTemplateSectionButton({
  pageId,
  entry,
  attached = [],
  label = "Oluştur",
}: CreateTemplateSectionButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="outline"
        disabled={isPending}
        className="gap-2"
        onClick={() => {
          setError(null);
          startTransition(async () => {
            for (const target of [entry, ...attached]) {
              const result = await createSectionAction(pageId, {
                ...sectionDefaultValues,
                key: target.key,
                type: target.type,
                title: target.label,
              });
              if (!result.success) {
                setError(result.error);
                break;
              }
            }
            router.refresh();
          });
        }}
      >
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Plus className="size-4" />
        )}
        {label}
      </Button>
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
