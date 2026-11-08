"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Inbox, Mail, MailOpen, Phone, Reply } from "lucide-react";

import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";
import { deleteMessageAction, setMessageReadAction } from "@/app/actions/contact-messages";

export type MessageView = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  read: boolean;
  date: string;
};

const FILTERS = [
  { key: "all", label: "Tümü" },
  { key: "unread", label: "Okunmamış" },
  { key: "read", label: "Okunmuş" },
] as const;

export function MessageList({ messages }: { messages: MessageView[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const visible = messages.filter((m) => (filter === "all" ? true : filter === "unread" ? !m.read : m.read));

  function toggle(message: MessageView) {
    const opening = openId !== message.id;
    setOpenId(opening ? message.id : null);
    // Açılınca okundu say
    if (opening && !message.read) {
      startTransition(async () => {
        const result = await setMessageReadAction(message.id, true);
        if (!result.success) setError(result.error);
        router.refresh();
      });
    }
  }

  function markUnread(message: MessageView) {
    startTransition(async () => {
      const result = await setMessageReadAction(message.id, false);
      if (!result.success) setError(result.error);
      setOpenId(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div role="tablist" aria-label="Mesaj filtresi" className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const count = f.key === "all" ? messages.length : messages.filter((m) => (f.key === "unread" ? !m.read : m.read)).length;
          return (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={filter === f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                filter === f.key ? "bg-(--brand-primary) text-white" : "bg-surface-muted text-foreground hover:bg-border"
              }`}
            >
              {f.label} ({count})
            </button>
          );
        })}
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      {visible.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
          <Inbox className="size-8" />
          <p>{messages.length === 0 ? "Henüz mesaj gelmedi. Sitedeki iletişim formundan gelen mesajlar burada listelenir." : "Bu filtrede mesaj yok."}</p>
        </div>
      ) : (
        <ul className="space-y-2" aria-busy={isPending}>
          {visible.map((m) => {
            const open = openId === m.id;
            return (
              <li key={m.id} className={`rounded-2xl border bg-card transition ${m.read ? "border-border" : "border-(--brand-accent)/40 shadow-sm"}`}>
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => toggle(m)}
                  className="flex w-full items-start gap-3 p-4 text-left"
                >
                  <span className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl ${m.read ? "bg-surface-muted text-muted-foreground" : "bg-(--brand-primary) text-white"}`}>
                    {m.read ? <MailOpen className="size-4" /> : <Mail className="size-4" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <span className={`truncate ${m.read ? "font-medium" : "font-bold"}`}>{m.name}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">{m.date}</span>
                    </span>
                    <span className="block truncate text-sm text-muted-foreground">
                      {m.subject ? <strong className="font-semibold text-foreground">{m.subject} · </strong> : null}
                      {m.message}
                    </span>
                  </span>
                </button>

                {open && (
                  <div className="space-y-4 border-t border-border px-4 pb-4 pt-4 sm:pl-16">
                    <dl className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                      <div className="flex gap-1.5">
                        <dt className="text-muted-foreground">E-posta:</dt>
                        <dd className="font-medium">{m.email}</dd>
                      </div>
                      {m.phone && (
                        <div className="flex gap-1.5">
                          <dt className="text-muted-foreground">Telefon:</dt>
                          <dd className="font-medium">{m.phone}</dd>
                        </div>
                      )}
                    </dl>
                    {/* Metin olarak basılır (HTML çalışmaz) */}
                    <p className="whitespace-pre-wrap break-words rounded-xl bg-surface-muted p-4 text-sm leading-6">{m.message}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <a
                        href={`mailto:${encodeURIComponent(m.email)}?subject=${encodeURIComponent(`Re: ${m.subject ?? "Mesajınız"}`)}`}
                        className="inline-flex items-center gap-2 rounded-full bg-(--brand-primary) px-4 py-2 text-sm font-semibold text-white hover:bg-(--brand-primary)/90"
                      >
                        <Reply className="size-4" />
                        E-posta ile yanıtla
                      </a>
                      {m.phone && (
                        <a href={`tel:${m.phone.replace(/[^0-9+]/g, "")}`} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-surface-muted">
                          <Phone className="size-4" />
                          Ara
                        </a>
                      )}
                      <button type="button" onClick={() => markUnread(m)} className="rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-surface-muted">
                        Okunmadı yap
                      </button>
                      <span className="ml-auto">
                        <ConfirmDeleteDialog
                          title="Mesajı sil"
                          description={<><strong>{m.name}</strong> kişisinin mesajı kalıcı olarak silinecek.</>}
                          onConfirm={() => deleteMessageAction(m.id)}
                        />
                      </span>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
