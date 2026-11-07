import Link from "next/link";
import { ArrowLeft, Link2 } from "lucide-react";

/** Ortak alan ekranlarının (Header, Footer, Genel Ayarlar) ortak başlığı */
export function AreaShell({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto w-full min-w-0 max-w-6xl space-y-6 pb-16">
      <nav aria-label="Sayfa yolu" className="text-sm text-muted-foreground">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 hover:text-[#346872]">
          <ArrowLeft className="size-3.5" />
          Site Haritası
        </Link>
      </nav>

      <header className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-xl bg-[#183350]/10 text-[#183350]">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <h1 className="flex flex-wrap items-center gap-2 text-2xl font-semibold tracking-tight">
            {title}
            <span className="inline-flex items-center gap-1 rounded-full bg-[#346872]/10 px-2.5 py-0.5 text-xs font-semibold text-[#346872]">
              <Link2 className="size-3" />
              Tüm sayfalarda ortak
            </span>
          </h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </header>

      {children}
    </main>
  );
}

/** Ekran içindeki başlıklı kart */
export function AreaCard({
  title,
  hint,
  action,
  children,
}: {
  title: string;
  hint?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card shadow-sm">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4 sm:px-8">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          {hint && <p className="mt-0.5 text-sm text-muted-foreground">{hint}</p>}
        </div>
        {action}
      </header>
      <div className="@container p-5 sm:p-8">{children}</div>
    </section>
  );
}
