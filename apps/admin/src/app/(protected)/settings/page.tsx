import { Settings2 } from "lucide-react";

import { FooterForm } from "@/components/settings/FooterForm";
import { getFooterFormValues } from "@/lib/footer";
import { getAdminSocialLinks } from "@/lib/social-links";
import { SocialLinksEditor } from "@/components/settings/SocialLinksEditor";

export default async function SettingsPage() {
  const [initialValues, socialLinks] = await Promise.all([
    getFooterFormValues(),
    getAdminSocialLinks(),
  ]);

  return (
    <main className="min-w-0 max-w-4xl space-y-7 pb-10">
      <header className="flex items-center gap-4">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-[#183350]/10 text-[#183350]">
          <Settings2 className="size-6" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Ayarlar</h1>
          <p className="text-sm text-muted-foreground">
            Footer, iletişim bilgileri ve sosyal medya hesapları.
          </p>
        </div>
      </header>

      <FooterForm initialValues={initialValues} />

      <section className="rounded-2xl border border-border bg-card p-6">
        <SocialLinksEditor links={socialLinks} />
      </section>
    </main>
  );
}
