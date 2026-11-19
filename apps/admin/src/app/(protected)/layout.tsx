import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth";
import CommandHeader from "@/components/layout/CommandHeader";
import { getUnreadCount } from "@/lib/contact-messages";
import { LocaleProvider } from "@/components/i18n/LocaleProvider";
import { normalizeLocaleConfig } from "@/lib/i18n";
import { getSiteSettings } from "@/lib/site-settings";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getAdminUser();

  if (!user) {
    redirect("/login");
  }

  // Dil ayarı tüm formlarda gerekli (çeviri kutuları). Okunamazsa yalnızca ana dil.
  const [unread, settings] = await Promise.all([getUnreadCount(), getSiteSettings().catch(() => null)]);
  const localeConfig = normalizeLocaleConfig(settings?.defaultLocale, settings?.locales);

  return (
    <LocaleProvider value={localeConfig}>
      <div className="min-h-screen bg-background text-foreground">
        <CommandHeader unread={unread} />

        <main className="w-full px-3 py-4 sm:px-4 lg:px-6 lg:py-5">
          {children}
        </main>
      </div>
    </LocaleProvider>
  );
}
