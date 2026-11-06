import Link from "next/link";

import {
  ArrowUpRight,
  FileText,
  Images,
  Menu,
  Palette,
  Settings2,
  LayoutGrid,
  LayoutDashboard,
} from "lucide-react";

const modules = [
  {
    title: "Sayfa Yönetimi",
    description: "Sayfaları oluşturun, düzenleyin ve SEO ayarlarını yönetin.",
    href: "/pages",
    icon: FileText,
  },
  {
    title: "Menü Yönetimi",
    description: "Navigasyon menülerini ve bağlantıları düzenleyin.",
    href: "/menu",
    icon: Menu,
  },
  {
    title: "Slider Yönetimi",
    description: "Ana sayfa slider görsellerini ve içeriklerini yönetin.",
    href: "/hero-slides",
    icon: Images,
  },
  {
    title: "Tema ve Görünüm",
    description: "Site renklerini, logoyu ve arka planı özelleştirin.",
    href: "/appearance",
    icon: Palette,
  },
  {
    title: "Medya Kütüphanesi",
    description: "Görselleri yükleyin ve medya dosyalarını yönetin.",
    href: "/media",
    icon: LayoutGrid,
  },
  {
    title: "Site Ayarları",
    description: "Genel bilgileri, footer ve site yapılandırmasını yönetin.",
    href: "/settings",
    icon: Settings2,
  },
];

export default function DashboardPage() {
  return (
    <div className="w-full min-w-0 space-y-7 pb-8 sm:space-y-8">
      {/* Sayfa başlığı */}
      <section className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
            <LayoutDashboard size={15} />
            Dynamic Platform
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            Kontrol Merkezi
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Web sitenizin içeriklerini, görünümünü ve ayarlarını tek bir
            merkezden yönetin.
          </p>
        </div>

        {/* Yönetim alanı etiketi */}
        <div className="flex shrink-0 items-center gap-2 self-start rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs font-medium text-muted-foreground sm:self-auto">
          <span className="size-2 rounded-full bg-accent" />
          Yönetim Alanı
        </div>
      </section>

      {/* Yönetim modülleri */}
      <section aria-labelledby="modules-heading">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2
              id="modules-heading"
              className="text-lg font-semibold tracking-tight text-foreground"
            >
              Yönetim Modülleri
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Yönetmek istediğiniz alanı seçin.
            </p>
          </div>

          <span className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted-foreground">
            {modules.length} Modül
          </span>
        </div>

        {/* Modül kartları */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {modules.map((module) => {
            const Icon = module.icon;

            return (
              <Link
                key={module.href}
                href={module.href}
                className="group flex min-w-0 flex-col justify-between rounded-2xl border border-border bg-surface p-5 shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-lg hover:shadow-primary/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:p-6"
              >
                <div className="min-w-0">
                  {/* Modül ikonu */}
                  <div className="mb-5 flex size-11 items-center justify-center rounded-xl bg-surface-muted text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                    <Icon size={21} strokeWidth={1.8} />
                  </div>

                  {/* Modül başlığı */}
                  <h3 className="text-base font-semibold tracking-tight text-foreground">
                    {module.title}
                  </h3>

                  {/* Modül açıklaması */}
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {module.description}
                  </p>
                </div>

                {/* Kart alt işlemi */}
                <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                  <span className="text-xs font-semibold text-accent transition-colors group-hover:text-foreground">
                    Yönet
                  </span>

                  <ArrowUpRight
                    size={18}
                    className="text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
