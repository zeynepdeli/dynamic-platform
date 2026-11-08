import { Inbox } from "lucide-react";

import { AreaShell } from "@/components/areas/AreaShell";
import { MessageList } from "@/components/messages/MessageList";
import { getContactMessages } from "@/lib/contact-messages";
import { SettingsForm } from "@/components/areas/SettingsForm";
import { MailStatus } from "@/components/messages/MailStatus";
import { getMailConfigured } from "@/lib/admin-users";
import { getMediaBaseUrl } from "@/lib/media-base-url";
import { getSiteSettings } from "@/lib/site-settings";

const dateFormat = new Intl.DateTimeFormat("tr-TR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Istanbul",
});

export default async function MessagesPage() {
  const [messages, settings, mailConfigured] = await Promise.all([getContactMessages(), getSiteSettings(), getMailConfigured()]);
  const unread = messages.filter((m) => !m.read).length;

  return (
    <AreaShell
      icon={Inbox}
      title="Gelen Mesajlar"
      description={
        unread > 0
          ? `Sitedeki iletişim formundan gelen mesajlar. ${unread} okunmamış mesajınız var.`
          : "Sitedeki iletişim formundan gelen mesajlar."
      }
    >
      <MessageList
        messages={messages.map((m) => ({
          id: m.id,
          name: m.name,
          email: m.email,
          phone: m.phone,
          subject: m.subject,
          message: m.message,
          read: m.read,
          date: dateFormat.format(new Date(m.createdAt)),
        }))}
      />

      <MailStatus configured={mailConfigured} />
      <SettingsForm
        group="notify"
        submitLabel="Bildirim Ayarını Kaydet"
        mediaBaseUrl={getMediaBaseUrl()}
        initialValues={{ notifyEmail: settings.notifyEmail ?? "" }}
        panels={[
          {
            title: "E-posta Bildirimi",
            hint: mailConfigured
              ? "Yeni mesaj gelince bu adrese e-posta gider; e-postayı yanıtlayınca doğrudan gönderene ulaşır."
              : "E-posta (SMTP) ayarlanmadığı için şu an bildirim gönderilemez.",
            fields: [{ name: "notifyEmail", label: "Bildirim Adresi", kind: "text", placeholder: "satis@siteadi.com", description: "Boş bırakırsanız bildirim gönderilmez." }],
          },
        ]}
      />
    </AreaShell>
  );
}
