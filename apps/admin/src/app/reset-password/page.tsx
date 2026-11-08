import Link from "next/link";

import { AuthCard } from "@/components/auth/AuthCard";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata = { title: "Şifre yenile", referrer: "no-referrer" };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string | string[] }> }) {
  const { token } = await searchParams;
  const valid = typeof token === "string" && /^[A-Za-z0-9_-]{43}$/.test(token);

  return (
    <AuthCard title="Yeni şifre belirleyin" description="Bağlantı 30 dakika geçerlidir ve yalnızca bir kez kullanılabilir.">
      {valid ? (
        <ResetPasswordForm token={token} />
      ) : (
        <div className="space-y-4 text-sm">
          <p role="alert" className="text-destructive">Bağlantı geçersiz.</p>
          <Link href="/forgot-password" className="font-medium text-[#346872] hover:underline">Yeni bağlantı iste</Link>
        </div>
      )}
    </AuthCard>
  );
}
