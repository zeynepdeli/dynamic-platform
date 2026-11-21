import Link from "next/link";
import { FileText, Home, Pencil, Plus, Trash2 } from "lucide-react";

import { MODULES, moduleBySlug } from "@/brand/modules";
import { AreaCard, AreaShell } from "@/components/areas/AreaShell";
import { MODULE_ICONS } from "@/components/modules/module-icons";
import { getAdminPages } from "@/lib/pages";
import { getAdminSections } from "@/lib/sections";

/** Tüm Sayfalar: ana sayfa, serbest sayfalar ve kurulu modül sayfaları tek listede */
export default async function PagesListScreen() {
  const all = await getAdminPages();
  const pages = all.filter((p) => !moduleBySlug(p.slug));
  const installed = MODULES.filter((m) => all.some((p) => p.slug === m.slug));
  const [homeSections, ...pageSections] = await Promise.all([
    getAdminSections(null),
    ...pages.map((p) => getAdminSections(p.id)),
  ]);

  return (
    <AreaShell
      icon={FileText}
      title="Tüm Sayfalar"
      description="Sitedeki sayfalar. Bir sayfayı açınca bölümlerini sıralayabilir, gizleyebilir ve düzenleyebilirsiniz."
      actions={
        <Link
          href="/pages/new"
          className="inline-flex items-center gap-2 rounded-full bg-(--brand-primary) px-5 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-(--brand-primary)/90"
        >
          <Plus className="size-4" /> Yeni Sayfa
        </Link>
      }
    >
      <AreaCard title={`Sayfalar (${pages.length + 1})`}>
        <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
          <Row
            href="/pages/home"
            icon={Home}
            title="Ana Sayfa"
            meta={`/ · ${homeSections.length} bölüm`}
          />
          {pages.map((p, i) => (
            <Row
              key={p.id}
              href={`/pages/${p.id}`}
              icon={FileText}
              title={p.title}
              meta={`/${p.slug} · ${pageSections[i].length} bölüm`}
              draft={!p.published}
            />
          ))}
        </ul>
      </AreaCard>

      {installed.length > 0 && (
        <AreaCard title="Modül Sayfaları" hint="Kendi yönetim ekranı olan sayfalar">
          <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
            {installed.map((m) => (
              <Row key={m.key} href={`/modules/${m.key}`} icon={MODULE_ICONS[m.icon]} title={m.pageTitle} meta={`/${m.slug} · ${m.title}`} />
            ))}
          </ul>
        </AreaCard>
      )}

      <div className="flex justify-end">
        <Link href="/pages/trash" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-(--brand-accent)">
          <Trash2 className="size-4" /> Çöp kutusu
        </Link>
      </div>
    </AreaShell>
  );
}

function Row({
  href,
  icon: Icon,
  title,
  meta,
  draft,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  meta: string;
  draft?: boolean;
}) {
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-(--brand-primary)/10 text-(--brand-primary)">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold">
          {title}
          {draft && <span className="ml-2 rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-800">Taslak</span>}
        </p>
        <p className="truncate font-mono text-xs text-muted-foreground">{meta}</p>
      </div>
      <Link href={href} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-semibold hover:bg-surface-muted">
        <Pencil className="size-3.5" /> Düzenle
      </Link>
    </li>
  );
}
