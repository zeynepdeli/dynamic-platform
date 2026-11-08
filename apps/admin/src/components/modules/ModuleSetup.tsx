"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { setupModuleAction } from "@/app/actions/modules";

export function ModuleSetup({
  moduleKey,
  slug,
  pageTitle,
}: {
  moduleKey: string;
  slug: string;
  pageTitle: string;
}) {
  const router = useRouter();
  const [addToMenu, setAddToMenu] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="space-y-5">
      <p className="text-sm leading-6 text-muted-foreground">
        Bu modül henüz kurulmadı. Kurunca sitede{" "}
        <code className="rounded bg-surface-muted px-1.5 py-0.5">/{slug}</code>{" "}
        adresinde &ldquo;{pageTitle}&rdquo; sayfası oluşur ve içeriğini bu
        ekrandan yönetirsiniz.
      </p>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={addToMenu}
          onChange={(e) => setAddToMenu(e.target.checked)}
          className="size-4 accent-(--brand-primary)"
        />
        Header menüsüne &ldquo;{pageTitle}&rdquo; linki ekle
      </label>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Button
        type="button"
        disabled={pending}
        className="min-h-11 gap-2 rounded-full px-6"
        onClick={() =>
          start(async () => {
            setError(null);
            const result = await setupModuleAction(moduleKey, addToMenu);
            if (!result.success) setError(result.error);
            else router.refresh();
          })
        }
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Wand2 className="size-4" />
        )}
        Modülü Kur
      </Button>
    </div>
  );
}
