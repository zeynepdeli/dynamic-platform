"use server";

import { headers } from "next/headers";
import { isIP } from "node:net";
import { z } from "zod";

import { getApiUrl } from "@/core/config";

export type ContactState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
  /** Hata olunca yazılanlar kaybolmasın (React form sonrası alanları sıfırlar) */
  values?: Record<string, string>;
};

const singleLine = (max: number) =>
  z.string().trim().max(max).refine((v) => !/[\u0000-\u001f\u007f]/.test(v), "Bu alan tek satır olmalı.");

const schema = z.object({
  name: singleLine(100).pipe(z.string().min(2, "Adınızı girin.")),
  email: z.email("Geçerli bir e-posta girin.").max(254),
  phone: z.string().trim().max(30).regex(/^[0-9+()\-\s]*$/, "Geçerli bir telefon girin."),
  subject: singleLine(150),
  message: z.string().trim().min(10, "Mesajınız en az 10 karakter olmalı.").max(5000),
  website: z.string().max(200), // bal küpü
});

// Formu geri doldururken bal küpü alanı hariç, uzunluk sınırlı
function keep(raw: Record<string, string>) {
  const { website: _honeypot, ...rest } = raw;
  void _honeypot;
  return Object.fromEntries(Object.entries(rest).map(([k, v]) => [k, v.slice(0, 5000)]));
}

/** Ziyaretçinin IP'si (reverse proxy'nin eklediği ilk adres) */
async function clientIp(): Promise<string | undefined> {
  const h = await headers();
  const candidate = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip")?.trim();
  return candidate && isIP(candidate) ? candidate : undefined;
}

export async function sendContactMessage(_: ContactState, formData: FormData): Promise<ContactState> {
  const raw = Object.fromEntries(
    ["name", "email", "phone", "subject", "message", "website"].map((k) => [k, String(formData.get(k) ?? "")]),
  );
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    return { status: "error", message: "Lütfen işaretli alanları kontrol edin.", fieldErrors, values: keep(raw) };
  }

  const { website, phone, subject, ...rest } = parsed.data;
  const ip = await clientIp();
  const secret = process.env.WEB_API_SECRET;

  try {
    const response = await fetch(`${getApiUrl()}/contact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(secret && ip ? { "X-Web-Secret": secret, "X-Client-IP": ip } : {}),
      },
      body: JSON.stringify({ ...rest, ...(phone ? { phone } : {}), ...(subject ? { subject } : {}), ...(website ? { website } : {}) }),
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(10_000),
    });
    if (response.status === 429) return { status: "error", message: "Çok fazla mesaj gönderildi. Lütfen biraz sonra tekrar deneyin.", values: keep(raw) };
    if (!response.ok) return { status: "error", message: "Mesajınız gönderilemedi. Lütfen bilgileri kontrol edip tekrar deneyin.", values: keep(raw) };
    return { status: "success", message: "Teşekkürler! Mesajınız bize ulaştı, en kısa sürede dönüş yapacağız." };
  } catch {
    return { status: "error", message: "Şu anda mesaj gönderilemiyor. Lütfen daha sonra tekrar deneyin.", values: keep(raw) };
  }
}
