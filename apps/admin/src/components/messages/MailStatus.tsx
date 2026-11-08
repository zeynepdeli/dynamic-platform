"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2, MailWarning, Send } from "lucide-react";

import { sendTestMailAction } from "@/app/actions/users";

/** E-posta (SMTP) durumu + deneme e-postası */
export function MailStatus({ configured }: { configured: boolean }) {
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  if (!configured) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-amber-400/50 bg-amber-50 p-4 text-sm text-amber-900">
        <MailWarning className="mt-0.5 size-5 shrink-0" />
        <p>
          <strong>E-posta ayarlanmamış.</strong> Yeni mesaj bildirimi ve &ldquo;şifremi unuttum&rdquo; için API&apos;nin
          <code className="mx-1 rounded bg-white/70 px-1">.env</code> dosyasına SMTP bilgileri girilmeli
          (SMTP_HOST, SMTP_USER, SMTP_PASS, MAIL_FROM).
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm">
      <CheckCircle2 className="size-5 text-emerald-600" />
      <span className="font-medium">E-posta gönderimi açık.</span>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await sendTestMailAction();
            setResult(r.success ? { ok: true, text: `Deneme e-postası gönderildi: ${r.to}` } : { ok: false, text: r.error });
          })
        }
        className="ml-auto inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 font-semibold hover:bg-surface-muted disabled:opacity-60"
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        Deneme e-postası gönder
      </button>
      {result && (
        <p role={result.ok ? "status" : "alert"} className={`w-full ${result.ok ? "text-emerald-700" : "text-destructive"}`}>
          {result.text}
        </p>
      )}
    </div>
  );
}
