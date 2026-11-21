import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type Icon = React.ComponentType<{ className?: string }>;

/** Amaca göre grup başlığı + kutucuk ızgarası (e-ticaret paneliyle aynı düzen) */
export function Section({
  icon: SectionIcon,
  title,
  note,
  action,
  children,
}: {
  icon: Icon;
  title: string;
  note?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-3">
        <h2 className="brand-heading flex flex-wrap items-baseline gap-2 text-2xl font-bold tracking-tight text-(--brand-primary)">
          <SectionIcon className="size-5 self-center" />
          {title}
          {note && <span className="text-sm font-medium text-muted-foreground">{note}</span>}
        </h2>
        {action}
      </header>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">{children}</div>
    </section>
  );
}

export function SectionLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1 text-xs font-semibold text-(--brand-accent) hover:underline">
      {children} <ChevronRight className="size-4" />
    </Link>
  );
}

/*
 * Fareyle yükselme efekti titremesin diye iki katman: bağlantı (HIT_AREA) yerinde durur,
 * içteki kutu (LIFT) yükselir. Bağlantının kendisi yükselince fare kenardayken kutu
 * kalkıp inerek titriyordu.
 */
const HIT_AREA =
  "group block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--brand-accent)";
const LIFT =
  "rounded-2xl border border-border bg-card shadow-sm transition group-hover:-translate-y-0.5 group-hover:border-(--brand-accent)/40 group-hover:shadow-md motion-reduce:transition-none motion-reduce:group-hover:translate-y-0";

export function Tile({
  href,
  icon: TileIcon,
  title,
  description,
  badge,
  number,
}: {
  href: string;
  icon: Icon;
  title: string;
  description?: string;
  badge?: React.ReactNode;
  /** Bölüm sırası: ikon yerine numara gösterilir */
  number?: number;
}) {
  return (
    <Link href={href} className={HIT_AREA}>
      <span className={`${LIFT} flex h-full min-h-28 items-start gap-4 p-5`}>
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-(--brand-primary)/10 text-(--brand-primary) transition group-hover:bg-(--brand-primary) group-hover:text-white">
          {number ? <span className="text-sm font-bold tabular-nums">{number}</span> : <TileIcon className="size-5" />}
        </span>
        <span className="min-w-0">
          <span className="flex flex-wrap items-center gap-1.5 text-base font-bold text-(--brand-primary)">
            <span className="truncate">{title}</span>
            {badge}
          </span>
          {description && <span className="mt-1 block text-sm leading-5 text-muted-foreground">{description}</span>}
        </span>
      </span>
    </Link>
  );
}

/** Sayı kartı: ilgili ekrana götürür */
export function Stat({ href, label, value, hint }: { href: string; label: string; value: string; hint?: string }) {
  return (
    <Link href={href} className={HIT_AREA}>
      <span className={`${LIFT} block h-full p-5`}>
        <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
        <span className="brand-heading mt-2 block text-3xl font-bold text-(--brand-primary) tabular-nums">{value}</span>
        {hint && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
      </span>
    </Link>
  );
}

const BADGE_TONE = {
  info: "bg-sky-600 text-white",
  warning: "bg-amber-500/15 text-amber-800",
  danger: "bg-red-600 text-white",
  muted: "bg-neutral-500/10 text-neutral-600",
} as const;

export function Badge({ tone, children }: { tone: keyof typeof BADGE_TONE; children: React.ReactNode }) {
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${BADGE_TONE[tone]}`}>{children}</span>;
}
