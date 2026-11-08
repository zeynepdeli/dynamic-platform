"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2 } from "lucide-react";

import { resetPasswordAction } from "@/app/actions/password-reset";

const input = "h-12 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-[#346872] focus:ring-2 focus:ring-[#346872]/20";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    const result = await resetPasswordAction({ token, newPassword, confirmPassword });
    setLoading(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    router.replace("/login?sifre=yenilendi");
  }

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <div>
        <label htmlFor="newPassword" className="mb-2 block text-sm font-medium">Yeni şifre</label>
        <input id="newPassword" type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={input} />
        <p className="mt-1.5 text-xs text-muted-foreground">En az 12 karakter.</p>
      </div>
      <div>
        <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium">Yeni şifre (tekrar)</label>
        <input id="confirmPassword" type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={input} />
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <button type="submit" disabled={loading} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#183350] text-sm font-semibold text-white transition hover:bg-[#183350]/90 disabled:opacity-60">
        {loading ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
        Şifreyi yenile
      </button>
    </form>
  );
}
