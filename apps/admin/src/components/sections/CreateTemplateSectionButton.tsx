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
};

// Şablonda tanımlı ama henüz oluşturulmamış bölümü tek tıkla oluşturur
export function CreateTemplateSectionButton({
  pageId,
  entry,
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
            const result = await createSectionAction(pageId, {
              ...sectionDefaultValues,
              key: entry.key,
              type: entry.type,
              title: entry.label,
            });
            if (!result.success) {
              setError(result.error);
              return;
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
        Oluştur
      </Button>
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
