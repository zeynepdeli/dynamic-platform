"use client";

import { useOptimistic, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";
import { OrderButtons } from "@/components/common/OrderButtons";
import { IconPicker } from "@/components/icons/IconPicker";
import { SOCIAL_ICONS } from "@/components/icons/registry";

import {
  createSocialLinkAction,
  deleteSocialLinkAction,
  reorderSocialLinksAction,
  updateSocialLinkAction,
} from "@/app/actions/social-links";
import {
  MAX_SOCIAL_LINKS,
  socialLinkSchema,
  type SocialLink,
  type SocialLinkFormValues,
} from "@/lib/validations/social-link.schema";

const EMPTY: SocialLinkFormValues = {
  icon: "instagram",
  url: "",
  label: "",
  visible: true,
};

/** Footer'daki sosyal medya listesi: ikon seç + adres yaz */
export function SocialLinksEditor({ links }: { links: SocialLink[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [ordered, setOptimistic] = useOptimistic(links);

  function move(index: number, direction: -1 | 1) {
    const next = [...ordered];
    const [item] = next.splice(index, 1);
    next.splice(index + direction, 0, item);
    setError(null);
    startTransition(async () => {
      setOptimistic(next);
      const result = await reorderSocialLinksAction(next.map((l) => l.id));
      if (!result.success) setError(result.error);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-semibold">
          Sosyal Medya{" "}
          <span className="font-normal text-muted-foreground">
            ({ordered.length}/{MAX_SOCIAL_LINKS})
          </span>
        </p>
        <p className="text-xs text-muted-foreground">
          İkonu seçin, profil adresini yapıştırın.
        </p>
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      {ordered.length > 0 && (
        <ul className="space-y-2">
          {ordered.map((link, index) => (
            <li key={link.id} className="flex items-start gap-2">
              <OrderButtons
                index={index}
                total={ordered.length}
                disabled={isPending}
                onMove={(d) => move(index, d)}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <SocialLinkRow
                  key={`${link.id}:${link.icon}:${link.url}:${link.label}:${link.visible}`}
                  initial={link}
                  onSave={(values) => updateSocialLinkAction(link.id, values)}
                  onSaved={() => router.refresh()}
                  remove={
                    <ConfirmDeleteDialog
                      title="Bağlantıyı sil"
                      description={
                        <>
                          <strong>{SOCIAL_ICONS[link.icon].label}</strong> bağlantısı
                          kaldırılacak.
                        </>
                      }
                      onConfirm={() => deleteSocialLinkAction(link.id)}
                    />
                  }
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      {ordered.length < MAX_SOCIAL_LINKS ? (
        <div className="rounded-xl border border-dashed border-border p-3">
          <SocialLinkRow
            key={ordered.length}
            initial={EMPTY}
            isNew
            onSave={createSocialLinkAction}
            onSaved={() => router.refresh()}
          />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          En fazla {MAX_SOCIAL_LINKS} bağlantı eklenebilir.
        </p>
      )}
    </div>
  );
}

function SocialLinkRow({
  initial,
  isNew = false,
  onSave,
  onSaved,
  remove,
}: {
  initial: SocialLinkFormValues;
  isNew?: boolean;
  onSave: (values: SocialLinkFormValues) => Promise<{ success: boolean; error?: string }>;
  onSaved: () => void;
  remove?: React.ReactNode;
}) {
  const [values, setValues] = useState<SocialLinkFormValues>(initial);
  const [error, setError] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();

  const dirty =
    values.icon !== initial.icon ||
    values.url.trim() !== initial.url ||
    values.label.trim() !== initial.label ||
    values.visible !== initial.visible;

  function save(next = values) {
    const parsed = socialLinkSchema.safeParse(next);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Bilgileri kontrol edin.");
      return;
    }
    setError(null);
    startSaving(async () => {
      const result = await onSave(parsed.data);
      if (!result.success) {
        setError(result.error ?? "Kaydedilemedi.");
        return;
      }
      if (isNew) setValues(initial);
      onSaved();
    });
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      className="space-y-1.5"
    >
      <div className="flex flex-wrap items-center gap-2">
        <IconPicker
          kind="social"
          label="Platform"
          value={values.icon}
          disabled={saving}
          onChange={(icon) =>
            setValues((v) => ({ ...v, icon: icon as SocialLinkFormValues["icon"] }))
          }
        />
        <Input
          value={values.url}
          onChange={(e) => setValues((v) => ({ ...v, url: e.target.value }))}
          placeholder="https://instagram.com/kullaniciadi"
          aria-label={`${SOCIAL_ICONS[values.icon].label} adresi`}
          aria-invalid={!!error}
          spellCheck={false}
          autoComplete="off"
          inputMode="url"
          className="h-10 min-w-48 flex-1"
        />
        {!isNew && (
          <Switch
            checked={values.visible}
            disabled={saving}
            aria-label="Sitede göster"
            title="Sitede göster"
            onCheckedChange={(visible) => {
              const next = { ...values, visible };
              setValues(next);
              save(next);
            }}
          />
        )}
        {isNew ? (
          <Button type="submit" disabled={saving || !values.url.trim()} className="h-10 gap-2">
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            Ekle
          </Button>
        ) : (
          dirty && (
            <Button type="submit" disabled={saving} className="h-10 gap-2">
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
              Kaydet
            </Button>
          )
        )}
        {remove}
      </div>
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </form>
  );
}
