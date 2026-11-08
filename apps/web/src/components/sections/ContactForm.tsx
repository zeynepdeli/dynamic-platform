"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";

import { sendContactMessage, type ContactState } from "@/app/actions/contact";

const input =
  "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/20 aria-[invalid=true]:border-red-500";

// ✏️ MÜŞTERİYE ÖZEL: İletişim formu görünümü
export function ContactForm() {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendContactMessage, { status: "idle" });

  if (state.status === "success") {
    return (
      <p role="status" className="flex items-start gap-3 rounded-2xl bg-emerald-50 p-6 text-emerald-900 ring-1 ring-emerald-200">
        <CheckCircle2 className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
        {state.message}
      </p>
    );
  }

  const err = (name: string) => state.fieldErrors?.[name];
  const field = (name: string, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div className="space-y-1.5">
      <label htmlFor={`cf-${name}`} className="text-sm font-medium">{label}</label>
      <input id={`cf-${name}`} name={name} defaultValue={state.values?.[name] ?? ""} className={input} aria-invalid={!!err(name)} aria-describedby={err(name) ? `cf-${name}-err` : undefined} {...props} />
      {err(name) && <p id={`cf-${name}-err`} className="text-sm text-red-600">{err(name)}</p>}
    </div>
  );

  return (
    <form action={action} noValidate className="grid gap-5 rounded-2xl bg-white/80 p-6 text-gray-900 shadow-sm ring-1 ring-black/5 sm:grid-cols-2 sm:p-8">
      {field("name", "Adınız Soyadınız", { required: true, maxLength: 100, autoComplete: "name" })}
      {field("email", "E-posta", { type: "email", required: true, maxLength: 254, autoComplete: "email" })}
      {field("phone", "Telefon (isteğe bağlı)", { type: "tel", maxLength: 30, autoComplete: "tel" })}
      {field("subject", "Konu (isteğe bağlı)", { maxLength: 150 })}
      <div className="space-y-1.5 sm:col-span-2">
        <label htmlFor="cf-message" className="text-sm font-medium">Mesajınız</label>
        <textarea id="cf-message" name="message" defaultValue={state.values?.message ?? ""} rows={5} required maxLength={5000} className={input} aria-invalid={!!err("message")} />
        {err("message") && <p className="text-sm text-red-600">{err("message")}</p>}
      </div>
      {/* Bal küpü: insanlar görmez, botlar doldurur */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="cf-website">Web siteniz</label>
        <input id="cf-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      {state.status === "error" && state.message && (
        <p role="alert" className="text-sm text-red-600 sm:col-span-2">{state.message}</p>
      )}
      <div className="sm:col-span-2">
        <button type="submit" disabled={pending} className="inline-flex items-center gap-2 rounded-xl bg-secondary px-6 py-3 font-semibold text-on-secondary transition hover:opacity-90 disabled:opacity-60">
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Send className="size-4" aria-hidden="true" />}
          Gönder
        </button>
      </div>
    </form>
  );
}
