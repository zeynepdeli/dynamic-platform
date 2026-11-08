"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ShieldCheck, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { FormField } from "@/components/forms/FormField";
import { createAdminAction, setAdminActiveAction } from "@/app/actions/users";
import { newAdminSchema, type NewAdminValues } from "@/lib/validations/users.schema";

export type AdminRow = { id: string; email: string; active: boolean; createdAt: string; isMe: boolean };

export function UsersList({ users }: { users: AdminRow[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="space-y-3">
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <ul className="divide-y divide-border rounded-2xl border border-border" aria-busy={pending}>
        {users.map((u) => (
          <li key={u.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
            <span className={`flex size-9 items-center justify-center rounded-full ${u.active ? "bg-[#183350]/10 text-[#183350]" : "bg-neutral-200 text-neutral-500"}`}>
              <ShieldCheck className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className={`truncate font-medium ${u.active ? "" : "text-muted-foreground line-through"}`}>
                {u.email} {u.isMe && <span className="ml-1 rounded-full bg-[#346872]/10 px-2 py-0.5 text-[11px] font-semibold text-[#346872] no-underline">Siz</span>}
              </p>
              <p className="text-xs text-muted-foreground">Eklenme: {u.createdAt}</p>
            </div>
            <label className="flex items-center gap-2 text-sm">
              {u.active ? "Aktif" : "Pasif"}
              <Switch
                checked={u.active}
                disabled={pending || u.isMe}
                aria-label={`${u.email} hesabı ${u.active ? "aktif" : "pasif"}`}
                title={u.isMe ? "Kendi hesabınızı pasif yapamazsınız" : undefined}
                onCheckedChange={(active) =>
                  start(async () => {
                    setError(null);
                    const result = await setAdminActiveAction(u.id, active);
                    if (!result.success) setError(result.error);
                    router.refresh();
                  })
                }
              />
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function NewAdminForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewAdminValues>({ resolver: zodResolver(newAdminSchema), defaultValues: { email: "", password: "", confirmPassword: "" } });

  async function submit(values: NewAdminValues) {
    setError(null);
    setDone(null);
    const result = await createAdminAction(values);
    if (!result.success) {
      setError(result.error);
      return;
    }
    reset();
    setDone(values.email);
    router.refresh();
  }

  return (
    <form noValidate onSubmit={handleSubmit(submit)} className="grid items-start gap-5 @xl:grid-cols-3">
      <FormField name="email" type="email" label="E-posta" register={register} error={errors.email} autoComplete="off" required />
      <FormField name="password" type="password" label="Geçici Şifre" description="En az 12 karakter. Kişi ilk girişte Hesap Ayarları'ndan değiştirmeli." register={register} error={errors.password} autoComplete="new-password" required />
      <FormField name="confirmPassword" type="password" label="Şifre (Tekrar)" register={register} error={errors.confirmPassword} autoComplete="new-password" required />
      <div className="flex flex-wrap items-center gap-3 @xl:col-span-3">
        <Button type="submit" disabled={isSubmitting} className="min-h-11 gap-2 rounded-full px-6">
          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
          Yönetici Ekle
        </Button>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        {done && <p role="status" className="text-sm text-emerald-700">{done} eklendi. Geçici şifreyi kendisine güvenli bir yoldan iletin.</p>}
      </div>
    </form>
  );
}
