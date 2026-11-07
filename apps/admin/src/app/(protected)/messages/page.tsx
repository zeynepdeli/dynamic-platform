import { Inbox } from "lucide-react";

import { AreaShell } from "@/components/areas/AreaShell";
import { MessageList } from "@/components/messages/MessageList";
import { getContactMessages } from "@/lib/contact-messages";

const dateFormat = new Intl.DateTimeFormat("tr-TR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Istanbul",
});

export default async function MessagesPage() {
  const messages = await getContactMessages();
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
    </AreaShell>
  );
}
