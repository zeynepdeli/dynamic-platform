import Link from "next/link";
import {
  ArrowUpRight,
  FileText,
  Home,
  Palette,
  PanelBottom,
  PanelTop,
  Plus,
  Trash2,
} from "lucide-react";

import { pageTemplates } from "@/brand/page-templates";
import { getAdminPages } from "@/lib/pages";
import { HOME_TEMPLATE_KEY } from "@/lib/page-templates";

// Tüm sayfalarda ortak alanlar — her biri YALNIZCA burada düzenlenir
const sharedAreas = [
  { title: "Header", description: "Site adı, logo ve menü", href: "/areas/header", icon: PanelTop },
  { title: "Footer", description: "İletişim bilgileri, sosyal medya, telif", href: "/areas/footer", icon: PanelBottom },
  { title: "Genel Ayarlar", description: "Tema renkleri, varsayılan arka plan, favicon, SEO", href: "/areas/general", icon: Palette },
];

function templateDescription(key: string) {
  return Object.hasOwn(pageTemplates, key) ? pageTemplates[key].description : undefined;
}

function Tile({
  href,
  icon: Icon,
  title,
  description,
  badge,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  badge?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-32 flex-col justify-between gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#346872]/40 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-11 items-center justify-center rounded-xl bg-[#183350]/10 text-[#183350]">
          <Icon className="size-5" />
        </span>
        <ArrowUpRight className="size-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#346872]" />
      </div>
      <div>
        <p className="flex flex-wrap items-center gap-2 font-semibold text-foreground">
          {title}
          {badge}
        </p>
        {description && <p className="mt-1 text-sm leading-5 text-muted-foreground">{description}</p>}
      </div>
    </Link>
  );
}

export default async function DashboardPage() {
  const pages = await getAdminPages();

  return (
    <div className="mx-auto w-full min-w-0 max-w-6xl space-y-10 pb-10">
      <header className="border-b border-border pb-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Site Haritası</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Her şeyin tek bir yeri var: sayfaya ait içerik o sayfanın ekranında,
          her sayfada görünen Header, Footer ve renkler aşağıdaki ortak alanlarda.
        </p>
      </header>

      <section aria-labelledby="pages-heading" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="pages-heading" className="text-lg font-semibold">
            Sayfalar
          </h2>
          <Link href="/pages/trash" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-[#346872]">
            <Trash2 className="size-4" />
            Çöp kutusu
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Tile
            href="/pages/home"
            icon={Home}
            title="Ana Sayfa"
            description={templateDescription(HOME_TEMPLATE_KEY) ?? "Arka plan, slider ve ana sayfa bölümleri"}
          />

          {pages.map((page) => (
            <Tile
              key={page.id}
              href={`/pages/${page.id}`}
              icon={FileText}
              title={page.title}
              description={templateDescription(page.slug) ?? `/${page.slug}`}
              badge={
                !page.published && (
                  <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                    Taslak
                  </span>
                )
              }
            />
          ))}

          <Link
            href="/pages/new"
            className="flex min-h-32 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border p-5 text-sm font-semibold text-[#346872] transition hover:border-[#346872]/40 hover:bg-surface"
          >
            <Plus className="size-5" />
            Yeni Sayfa
          </Link>
        </div>
      </section>

      <section aria-labelledby="shared-heading" className="space-y-4">
        <div>
          <h2 id="shared-heading" className="text-lg font-semibold">
            Tüm sayfalarda ortak
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Bu alanlar her sayfada görünür ve yalnızca buradan düzenlenir.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ">
          {sharedAreas.map((area) => (
            <Tile key={area.href} {...area} />
          ))}
        </div>
      </section>
    </div>
  );
}
