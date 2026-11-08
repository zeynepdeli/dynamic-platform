import Link from "next/link";
import {
  EyeOff,
  FileText,
  Inbox,
  LayoutDashboard,
  SearchCode,
  Wallpaper,
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
import { AreaHeader } from "@/components/areas/AreaShell";
import { getUnreadCount } from "@/lib/contact-messages";
import { getAdminPages, type Page } from "@/lib/pages";
import { HOME_TEMPLATE_KEY, resolveTemplate } from "@/lib/page-templates";
import { getAdminSections, type Section } from "@/lib/sections";
import { SECTION_TYPE_LABELS } from "@/lib/validations/section.schema";

type Icon = React.ComponentType<{ className?: string }>;

/** Site Haritası: sitenin her parçası ayrı bir kutucuk; her biri kendi ekranında düzenlenir */
export default async function DashboardPage() {
  const [pages, unread] = await Promise.all([getAdminPages(), getUnreadCount()]);
  const [homeSections, ...pageSections] = await Promise.all([
    getAdminSections(null),
    ...pages.map((p) => getAdminSections(p.id)),
  ]);

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1800px] space-y-7 pb-12">
      <AreaHeader
        icon={LayoutDashboard}
        eyebrow="Yönetim Paneli"
        title="Dashboard"
        description="Sitenin her parçası ayrı bir kutucuk. Düzenlemek istediğinize tıklayın; her biri kendi ekranında açılır."
        actions={
          <Link
            href="/pages/new"
            className="inline-flex items-center gap-2 rounded-full bg-(--brand-primary) px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-(--brand-primary)/90"
          >
            <Plus className="size-4" />
            Yeni Sayfa
          </Link>
        }
      />

      <Group eyebrow="Tüm sayfalarda ortak" title="Site Geneli">
        <Tile href="/areas/header" icon={PanelTop} title="Header Yönetimi" description="Site adı, logo, arka plan, buton, menü linkleri" />
        <Tile href="/areas/footer" icon={PanelBottom} title="Footer Yönetimi" description="Marka, iletişim, linkler, sosyal medya, telif" />
        <Tile href="/areas/background" icon={Wallpaper} title="Site Arka Planı" description="Tüm sayfaların varsayılan rengi ve fotoğrafı" />
        <Tile href="/areas/theme" icon={Palette} title="Tema Renkleri" description="Ana renk ve ikincil renk" />
        <Tile href="/areas/seo" icon={SearchCode} title="SEO Yönetimi" description="Başlık, açıklama, favicon, paylaşım görseli" />
        <Tile
          href="/messages"
          icon={Inbox}
          title="Gelen Mesajlar"
          description="İletişim formundan gelenler"
          badge={unread > 0 && <span className="rounded-full bg-red-600 px-2 py-0.5 text-[11px] font-bold text-white">{unread} yeni</span>}
        />
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

      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-6">
        <Link href="/pages/trash" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-(--brand-accent)">
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
      eyebrow={page ? `Sayfa · /${page.slug}` : "Sayfa · /"}
      title={`${title} Yönetimi`}
      icon={icon}
      badge={
        page &&
        !page.published && (
          <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-700">Taslak</span>
        )
      }
      action={page && <DeletePageDialog pageId={page.id} pageTitle={page.title} />}
    >
      {page && <Tile href={`${basePath}/bilgiler`} icon={Info} title="Sayfa Bilgileri" description="Başlık, adres, yayın durumu, sayfa SEO'su" />}
      <Tile href={`${basePath}/arka-plan`} icon={PaintBucket} title="Sayfa Arka Planı" description="Yalnızca bu sayfanın rengi ve fotoğrafı" />
      {!page && <Tile href={`${basePath}/slider`} icon={PanelsTopLeft} title="Hero Slider" description="En üstteki kayan görseller (en fazla 5)" />}

      {sections.map((section, i) => (
        <Tile
          key={section.id}
          href={`${basePath}/bolum/${section.id}`}
          icon={LayoutGrid}
          number={i + 1}
          title={label(section)}
          description={`${SECTION_TYPE_LABELS[section.type]} bölümü`}
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
        <div key={entry.key} className="flex min-h-28 flex-col justify-between gap-3 rounded-2xl border border-dashed border-amber-400/60 bg-amber-50 p-4 text-sm text-amber-900">
          <p>
            <span className="font-semibold">{entry.label}</span> bölümü henüz yok
          </p>
          <CreateTemplateSectionButton pageId={pageId} entry={entry} />
        </div>
      ))}

      {template.allowExtraSections && (
        <Link
          href={`${basePath}/yeni-bolum`}
          className="flex min-h-28 items-center justify-center gap-2 rounded-2xl border border-dashed border-border p-4 text-sm font-semibold text-(--brand-accent) transition hover:border-(--brand-accent)/50 hover:bg-surface"
        >
          <Plus className="size-4" />
          Yeni bölüm
        </Link>
      )}
    </Group>
  );
}

function Group({
  eyebrow,
  title,
  icon: GroupIcon,
  badge,
  action,
  children,
}: {
  eyebrow?: string;
  title: string;
  icon?: Icon;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-3">
        <div>
          {eyebrow && <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-(--brand-accent)">{eyebrow}</p>}
          <h2 className="brand-heading mt-1 flex flex-wrap items-center gap-2 text-2xl font-bold tracking-tight text-(--brand-primary)">
            {GroupIcon && <GroupIcon className="size-5" />}
            {title}
            {badge}
          </h2>
        </div>
        {action}
      </header>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">{children}</div>
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
      className="group flex min-h-28 items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-(--brand-accent)/40 hover:shadow-md"
    >
      <span className="relative flex size-12 shrink-0 items-center justify-center rounded-full bg-(--brand-primary)/10 text-(--brand-primary) transition group-hover:bg-(--brand-primary) group-hover:text-white">
        {number ? <span className="text-sm font-bold">{number}</span> : <TileIcon className="size-5" />}
      </span>
      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-1.5 text-base font-bold text-(--brand-primary)">
          <span className="truncate">{title}</span>
          {badge}
        </span>
        {description && <span className="mt-1 block text-sm leading-5 text-muted-foreground">{description}</span>}
      </span>
    </Link>
  );
}
