"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Save } from "lucide-react";

import { updateLanguagesAction } from "@/app/actions/languages";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  LOCALE_NAMES,
  SUPPORTED_LOCALES,
  type Locale,
  type LocaleConfig,
} from "@/lib/i18n";

/** Dil seçimi: ana dil her zaman açık; diğerleri açılıp kapanır */
export function LanguagesForm({ initial }: { initial: LocaleConfig }) {
  const router = useRouter();
  const [defaultLocale, setDefaultLocale] = useState<Locale>(
    initial.defaultLocale,
  );
  const [locales, setLocales] = useState<Locale[]>(initial.locales);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();
  const dirty =
    defaultLocale !== initial.defaultLocale ||
    locales.slice().sort().join() !== initial.locales.slice().sort().join();

  const toggle = (l: Locale, on: boolean) =>
    setLocales((cur) =>
      on ? [...new Set([...cur, l])] : cur.filter((x) => x !== l),
    );

  const save = () =>
    start(async () => {
      setError(null);
      setSaved(false);
      const r = await updateLanguagesAction({ defaultLocale, locales });
      if (!r.success) return setError(r.error);
      setSaved(true);
      router.refresh();
    });

  return (
    <div className="space-y-5">
      <ul className="divide-y divide-border rounded-2xl border border-border">
        {SUPPORTED_LOCALES.map((l) => {
          const isDefault = l === defaultLocale;
          return (
            <li key={l} className="flex flex-wrap items-center gap-3 p-4">
              <span className="flex size-9 items-center justify-center rounded-full bg-(--brand-primary)/8 text-xs font-bold text-(--brand-primary)">
                {l.toUpperCase()}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{LOCALE_NAMES[l]}</span>
                <span className="block text-xs text-muted-foreground">
                  {isDefault
                    ? "Ana dil: içerik bu dilde girilir, adresler önek almaz"
                    : `Sitede /${l} adresiyle açılır`}
                </span>
              </span>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="defaultLocale"
                  checked={isDefault}
                  onChange={() => {
                    setDefaultLocale(l);
                    toggle(l, true);
                  }}
                  className="size-4 accent-(--brand-primary)"
                />
                Ana dil
              </label>
              <Switch
                checked={isDefault || locales.includes(l)}
                disabled={isDefault}
                onCheckedChange={(on) => toggle(l, on)}
                aria-label={`${LOCALE_NAMES[l]} açık`}
              />
            </li>
          );
        })}
      </ul>

      {defaultLocale !== initial.defaultLocale && (
        <p
          role="note"
          className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-800"
        >
          Ana dili değiştirmek mevcut içeriğin dilini değiştirmez: şu an girili
          metinler {LOCALE_NAMES[defaultLocale]} kabul edilir. Genelde yalnızca
          kurulumda değiştirilir.
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {error}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-end gap-3">
        {saved && !dirty && (
          <span
            role="status"
            className="mr-auto flex items-center gap-1.5 text-sm text-emerald-700"
          >
            <CheckCircle2 className="size-4" /> Kaydedildi
          </span>
        )}
        <Button
          type="button"
          onClick={save}
          disabled={pending || !dirty}
          className="min-h-11 gap-2 rounded-full px-7"
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Dilleri Kaydet
        </Button>
      </div>
    </div>
  );
}
