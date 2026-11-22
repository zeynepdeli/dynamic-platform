import Link from "next/link";
import {
  ArrowUpDown,
  BarChart3,
  Blocks,
  FilePlus2,
  FileText,
  Home,
  Images,
  Inbox,
  Languages,
  LayoutDashboard,
  Newspaper,
  PanelsTopLeft,
  PaintBucket,
  Palette,
  PanelBottom,
  PanelTop,
  PenSquare,
  Plus,
  Search,
  SearchCode,
  Shapes,
  UserCog,
  Users,
  Wallpaper,
} from "lucide-react";

import { MODULES, moduleBySlug } from "@/brand/modules";
import { AreaHeader } from "@/components/areas/AreaShell";
import { Badge, Section, SectionLink, Stat, Tile } from "@/components/dashboard/DashboardParts";
import { MODULE_ICONS } from "@/components/modules/module-icons";
import { getAdminUser } from "@/lib/auth";
import { getUnreadCount } from "@/lib/contact-messages";
import { getAdminPages } from "@/lib/pages";
import { getAdminPosts, postStatus } from "@/lib/posts";
import { getAdminHeroSlides } from "@/lib/hero-slides";
import { HOME_TEMPLATE_KEY, resolveTemplate } from "@/lib/page-templates";
import { sectionSummary } from "@/lib/section-summary";
import { getAdminSections } from "@/lib/sections";
import { SECTION_TYPE_LABELS } from "@/lib/validations/section.schema";

/**
 * Dashboard: ekranlar amaca göre gruplanır (e-ticaret paneliyle aynı düzen).
 * Sayfaların bölümleri burada değil, her sayfanın kendi "Sayfa Düzeni" ekranında
 * sıralanabilir liste olarak yönetilir.
 */
export default async function DashboardPage() {
  const [user, allPages, unread, homeSections, posts, slides] = await Promise.all([
    getAdminUser(),
    getAdminPages(),
    getUnreadCount(),
    getAdminSections(null),
    getAdminPosts().catch(() => []),
    getAdminHeroSlides().catch(() => []),
  ]);
  const homeTemplate = resolveTemplate(HOME_TEMPLATE_KEY, homeSections);
  const sectionLabel = (key: string | null, title: string | null) =>
    (key && homeTemplate.byKey[key]?.label) || title || "(Başlıksız bölüm)";
  const activeSlides = slides.filter((s) => s.active).length;

  const pages = allPages.filter((p) => !moduleBySlug(p.slug));
  const installed = MODULES.filter((m) => allPages.some((p) => p.slug === m.slug));
  const notInstalled = MODULES.filter((m) => !installed.includes(m));
  const livePosts = posts.filter((p) => postStatus(p) === "live").length;
  const livePages = allPages.filter((p) => p.published).length + 1; // + ana sayfa

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1800px] space-y-9 pb-12">
      <AreaHeader
        icon={LayoutDashboard}
        eyebrow="Yönetim Paneli"
        title="Dashboard"
        description={`Hoş geldiniz${user ? `, ${user.email}` : ""}. Düzenlemek istediğiniz bölüme tıklayın; her biri kendi ekranında açılır.`}
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

      <Section icon={BarChart3} title="Özet">
        <Stat href="/messages" label="Okunmamış mesaj" value={unread.toLocaleString("tr-TR")} hint="İletişim formundan" />
        <Stat href="/pages" label="Yayındaki sayfa" value={livePages.toLocaleString("tr-TR")} hint="Ana sayfa dahil" />
        <Stat href="/pages/home" label="Ana sayfa bölümü" value={homeSections.filter((s) => s.active).length.toLocaleString("tr-TR")} hint="Yayında olanlar" />
        <Stat href="/blog" label="Blog yazısı" value={livePosts.toLocaleString("tr-TR")} hint={`${posts.length} yazının yayında olanları`} />
      </Section>

      <Section
        icon={Home}
        title="Ana Sayfa"
        note="Bölümler sitede bu sırayla görünür"
        action={<SectionLink href="/pages/home">Sıralama ve düzen</SectionLink>}
      >
        <Tile
          href="/pages/home/slider"
          icon={PanelsTopLeft}
          title="Hero Slider"
          description={slides.length ? `En üstteki kayan görseller · ${activeSlides} slayt yayında` : "En üstteki kayan görseller · henüz slayt yok"}
        />
        {homeSections.map((section, i) => (
          <Tile
            key={section.id}
            href={`/pages/home/bolum/${section.id}`}
            icon={Home}
            number={i + 1}
            title={sectionLabel(section.key, section.title)}
            description={[
              // Şablon bölümünde teknik tip adı gösterilmez
              section.key && homeTemplate.byKey[section.key] ? undefined : SECTION_TYPE_LABELS[section.type],
              sectionSummary(section),
            ]
              .filter(Boolean)
              .join(" · ")}
            badge={!section.active && <Badge tone="muted">Gizli</Badge>}
          />
        ))}
        {homeTemplate.missing.map((entry) => (
          <Tile
            key={entry.key}
            href="/pages/home"
            icon={Plus}
            title={entry.label}
            description="Bu bölüm henüz oluşturulmadı · oluşturmak için tıklayın"
            badge={<Badge tone="warning">Eksik</Badge>}
          />
        ))}
        <Tile href="/pages/home" icon={ArrowUpDown} title="Sıralama ve Düzen" description="Bölümleri sırala, gizle ya da sil" />
        <Tile href="/pages/home/arka-plan" icon={PaintBucket} title="Ana Sayfa Arka Planı" description="Yalnızca ana sayfanın rengi ve fotoğrafı" />
        {homeTemplate.allowExtraSections && (
          <Tile href="/pages/home/yeni-bolum" icon={Plus} title="Yeni Bölüm" description="Kart, metin, görsel+metin, video…" />
        )}
      </Section>

      <Section icon={FileText} title="Sayfalar" action={<SectionLink href="/pages">Tüm sayfalar</SectionLink>}>
        <Tile href="/areas/header" icon={PanelTop} title="Header" description="Site adı, logo, menü linkleri, buton" />
        {pages.map((p) => (
          <Tile
            key={p.id}
            href={`/pages/${p.id}`}
            icon={FileText}
            title={p.title}
            description={`/${p.slug}`}
            badge={!p.published && <Badge tone="warning">Taslak</Badge>}
          />
        ))}
        {installed.map((m) => {
          const ModuleIcon = MODULE_ICONS[m.icon];
          return <Tile key={m.key} href={`/modules/${m.key}`} icon={ModuleIcon} title={m.pageTitle} description={`${m.description} · /${m.slug}`} />;
        })}
        <Tile href="/areas/footer" icon={PanelBottom} title="Footer" description="İletişim, linkler, sosyal medya" />
        <Tile href="/pages/new" icon={FilePlus2} title="Yeni Sayfa" description="Hizmet, bilgi ya da kampanya sayfası ekle" />
      </Section>

      <Section icon={PenSquare} title="İçerik">
        <Tile href="/blog" icon={Newspaper} title="Blog / Haberler" description="Yazılar, duyurular, zamanlanmış yayın" />
        <Tile
          href="/messages"
          icon={Inbox}
          title="Gelen Mesajlar"
          description="İletişim formundan gelenler"
          badge={unread > 0 && <Badge tone="danger">{unread > 99 ? "99+" : unread}</Badge>}
        />
        <Tile href="/media" icon={Images} title="Medya Kütüphanesi" description="Yüklenen tüm görseller ve açıklamaları" />
      </Section>

      {notInstalled.length > 0 && (
        <Section icon={Blocks} title="Hazır Modüller" note="Kurulana kadar sitede hiçbir şey oluşturmaz">
          {notInstalled.map((m) => {
            const ModuleIcon = MODULE_ICONS[m.icon];
            return (
              <Tile
                key={m.key}
                href={`/modules/${m.key}`}
                icon={ModuleIcon}
                title={m.title}
                description={m.description}
                badge={<Badge tone="muted">Kurulmadı</Badge>}
              />
            );
          })}
        </Section>
      )}

      <Section icon={Shapes} title="Görünüm">
        <Tile href="/areas/theme" icon={Palette} title="Tema Renkleri" description="Ana renk ve ikincil renk" />
        <Tile href="/areas/background" icon={Wallpaper} title="Site Arka Planı" description="Tüm sayfaların varsayılan rengi ve fotoğrafı" />
        <Tile href="/areas/languages" icon={Languages} title="Diller" description="TR / EN: sitede açık diller" />
      </Section>

      <Section icon={Search} title="Google'da Görünürlük" note="Arama sonuçları ve sosyal medya paylaşımları">
        <Tile href="/areas/seo" icon={SearchCode} title="SEO Ayarları" description="Başlık, açıklama, favicon, paylaşım görseli" />
      </Section>

      <Section icon={Users} title="Hesaplar">
        <Tile href="/users" icon={Users} title="Yöneticiler" description="Panel kullanıcıları" />
        <Tile href="/account" icon={UserCog} title="Hesabım" description="Şifre ve oturumlar" />
      </Section>
    </div>
  );
}
