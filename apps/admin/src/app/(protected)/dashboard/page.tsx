import Link from "next/link";
import {
  EyeOff,
  FileText,
  Home,
  Info,
  LayoutGrid,
  PaintBucket,
  Palette,
  PanelBottom,
  PanelTop,
  PanelsTopLeft,
  Plus,
  Trash2,
} from "lucide-react";

import { CreateTemplateSectionButton } from "@/components/sections/CreateTemplateSectionButton";
import { DeletePageDialog } from "@/components/pages/DeletePageDialog";
import { getAdminPages, type Page } from "@/lib/pages";
import { HOME_TEMPLATE_KEY, resolveTemplate } from "@/lib/page-templates";
import { getAdminSections, type Section } from "@/lib/sections";
import { SECTION_TYPE_LABELS } from "@/lib/validations/section.schema";

type Icon = React.ComponentType<{ className?: string }>;

/** Site Haritası: sitenin her parçası ayrı bir kutucuk; her biri kendi ekranında düzenlenir */
export default async function DashboardPage() {
  const pages = await getAdminPages();
  const [homeSections, ...pageSections] = await Promise.all([
    getAdminSections(null),
    ...pages.map((p) => getAdminSections(p.id)),
  ]);

  return (
    <div className="mx-auto w-full min-w-0 max-w-6xl space-y-8 pb-16">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Site Haritası</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Sitenin her parçası ayrı bir kutucuk. Düzenlemek istediğinize tıklayın; her biri kendi ekranında açılır.
        </p>
      </header>

      <Group title="Tüm sayfalarda ortak" hint="Her sayfada görünür">
        <Tile href="/areas/header" icon={PanelTop} title="Header" description="Site adı, logo, menü" />
        <Tile href="/areas/footer" icon={PanelBottom} title="Footer" description="İletişim, sosyal medya, telif" />
        <Tile href="/areas/general" icon={Palette} title="Genel Ayarlar" description="Renkler, varsayılan arka plan, SEO" />
      </Group>

      <PageGroup title="Ana Sayfa" icon={Home} basePath={`/pages/${HOME_TEMPLATE_KEY}`} sections={homeSections} templateKey={HOME_TEMPLATE_KEY} pageId={null} />

      {pages.map((page, i) => (
        <PageGroup
          key={page.id}
          title={page.title}
          icon={FileText}
          basePath={`/pages/${page.id}`}
          sections={pageSections[i]}
          templateKey={page.slug}
          pageId={page.id}
          page={page}
        />
      ))}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
        <Link
          href="/pages/new"
          className="inline-flex items-center gap-2 rounded-xl bg-[#183350] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#183350]/90"
        >
          <Plus className="size-4" />
          Yeni Sayfa
        </Link>
        <Link href="/pages/trash" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-[#346872]">
          <Trash2 className="size-4" />
          Çöp kutusu
        </Link>
      </div>
    </div>
  );
}

function PageGroup({
  title,
  icon,
  basePath,
  sections,
  templateKey,
  pageId,
  page,
}: {
  title: string;
  icon: Icon;
  basePath: string;
  sections: Section[];
  templateKey: string;
  pageId: string | null;
  page?: Page;
}) {
  const template = resolveTemplate(templateKey, sections);
  const label = (s: Section) => (s.key && template.byKey[s.key]?.label) || s.title || "(Başlıksız bölüm)";

  return (
    <Group
      title={title}
      icon={icon}
      hint={page ? `/${page.slug}` : "/"}
      badge={
        page &&
        !page.published && (
          <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-700">Taslak</span>
        )
      }
      action={page && <DeletePageDialog pageId={page.id} pageTitle={page.title} />}
    >
      {page && <Tile href={`${basePath}/bilgiler`} icon={Info} title="Sayfa Bilgileri" description="Başlık, adres, yayın, SEO" />}
      <Tile href={`${basePath}/arka-plan`} icon={PaintBucket} title="Arka Plan" description="Bu sayfanın rengi ve fotoğrafı" />
      {!page && <Tile href={`${basePath}/slider`} icon={PanelsTopLeft} title="Slider" description="En üstteki kayan görseller (en fazla 5)" />}

      {sections.map((section, i) => (
        <Tile
          key={section.id}
          href={`${basePath}/bolum/${section.id}`}
          icon={LayoutGrid}
          number={i + 1}
          title={label(section)}
          description={SECTION_TYPE_LABELS[section.type]}
          badge={
            !section.active && (
              <span className="inline-flex items-center gap-1 rounded-full bg-neutral-500/10 px-2 py-0.5 text-[11px] font-semibold text-neutral-600">
                <EyeOff className="size-3" />
                Gizli
              </span>
            )
          }
        />
      ))}

      {template.missing.map((entry) => (
        <div key={entry.key} className="flex min-h-24 flex-col justify-between gap-3 rounded-2xl border border-dashed border-amber-400/60 bg-amber-50 p-4 text-sm text-amber-900">
          <p>
            <span className="font-semibold">{entry.label}</span> bölümü henüz yok
          </p>
          <CreateTemplateSectionButton pageId={pageId} entry={entry} />
        </div>
      ))}

      {template.allowExtraSections && (
        <Link
          href={`${basePath}/yeni-bolum`}
          className="flex min-h-24 items-center justify-center gap-2 rounded-2xl border border-dashed border-border p-4 text-sm font-semibold text-[#346872] transition hover:border-[#346872]/50 hover:bg-surface"
        >
          <Plus className="size-4" />
          Yeni bölüm
        </Link>
      )}
    </Group>
  );
}

function Group({
  title,
  hint,
  icon: GroupIcon,
  badge,
  action,
  children,
}: {
  title: string;
  hint?: string;
  icon?: Icon;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex flex-wrap items-center gap-2 text-lg font-semibold">
          {GroupIcon && <GroupIcon className="size-5 text-[#183350]" />}
          {title}
          {hint && <span className="font-mono text-xs font-normal text-muted-foreground">{hint}</span>}
          {badge}
        </h2>
        {action}
      </header>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
    </section>
  );
}

function Tile({
  href,
  icon: TileIcon,
  title,
  description,
  number,
  badge,
}: {
  href: string;
  icon: Icon;
  title: string;
  description?: string;
  number?: number;
  badge?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-24 items-start gap-3 rounded-2xl border border-border bg-surface p-4 transition hover:-translate-y-0.5 hover:border-[#346872]/40 hover:shadow-md"
    >
      <span className="relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#183350]/10 text-[#183350]">
        {number ? <span className="text-sm font-bold">{number}</span> : <TileIcon className="size-5" />}
      </span>
      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-1.5 font-semibold text-foreground">
          <span className="truncate">{title}</span>
          {badge}
        </span>
        {description && <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">{description}</span>}
      </span>
    </Link>
  );
}
