"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";
import { OrderButtons } from "@/components/common/OrderButtons";
import { OutlineBlock } from "@/components/outline/OutlineBlock";
import { InlineItems } from "@/components/outline/InlineItems";
import { SectionForm } from "@/components/sections/SectionForm";

import {
  deleteSectionAction,
  setSectionActiveAction,
  updateSectionAction,
} from "@/app/actions/sections";
import type { TemplateSection } from "@/brand/page-templates";
import type { SectionListEntry } from "@/lib/sections-view";
import { SECTION_TYPE_LABELS } from "@/lib/validations/section.schema";

type InlineSectionProps = {
  number: number;
  section: SectionListEntry;
  template?: TemplateSection;
  mediaBaseUrl: string;
  index: number;
  total: number;
  onMove: (direction: -1 | 1) => void;
  moving: boolean;
};

export function InlineSection({
  number,
  section,
  template,
  mediaBaseUrl,
  index,
  total,
  onMove,
  moving,
}: InlineSectionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const locked = template?.locked ?? false;
  const isCards = section.type === "CARDS";

  const title = template?.label ?? (section.title || "(Başlıksız bölüm)");
  const hint = [
    SECTION_TYPE_LABELS[section.type],
    isCards ? `${section.items.length} ${(template?.itemLabel ?? "kart").toLocaleLowerCase("tr")}` : null,
    template?.hint,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <OutlineBlock
      number={number}
      title={title}
      hint={hint}
      muted={!section.active}
      badge={
        <>
          {locked && <Lock className="size-3.5 text-muted-foreground" aria-label="Tasarıma bağlı bölüm" />}
          {!section.active && (
            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-700">Gizli</span>
          )}
        </>
      }
      actions={
        <>
          <OrderButtons index={index} total={total} disabled={moving || isPending} size="sm" layout="row" onMove={onMove} />
          <Switch
            checked={section.active}
            disabled={isPending}
            aria-label={`${title} yayında`}
            onCheckedChange={(checked) => {
              setError(null);
              startTransition(async () => {
                const result = await setSectionActiveAction(section.id, checked);
                if (!result.success) setError(result.error);
                else router.refresh();
              });
            }}
          />
          {!locked && (
            <ConfirmDeleteDialog
              title="Bölümü sil"
              description={
                <>
                  <strong>{title}</strong>
                  {section.items.length > 0 && <> ve içindeki <strong>{section.items.length} kart</strong></>} kalıcı
                  olarak silinecek.
                </>
              }
              onConfirm={() => deleteSectionAction(section.id)}
            />
          )}
        </>
      }
    >
      {error && (
        <p role="alert" className="mb-4 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className={isCards ? "grid gap-8 xl:grid-cols-2" : ""}>
        <SectionForm
          mode="edit"
          lock={locked && template ? { label: template.label } : null}
          fields={template?.fields}
          initialValues={section.formValues}
          mediaBaseUrl={mediaBaseUrl}
          onSubmit={async (values) => {
            const result = await updateSectionAction(section.id, values);
            if (!result.success) return result.error;
            router.refresh();
            return null;
          }}
        />

        {isCards && (
          <div className="xl:border-l xl:border-border xl:pl-8">
            <InlineItems
              sectionId={section.id}
              items={section.items}
              mediaBaseUrl={mediaBaseUrl}
              itemLabel={template?.itemLabel ?? "Kart"}
              fields={template?.itemFields}
            />
          </div>
        )}
      </div>
    </OutlineBlock>
  );
}
