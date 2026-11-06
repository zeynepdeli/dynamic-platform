import Link from "next/link";
import {
  CheckCircle2,
  Clock3,
  FileText,
  LayoutTemplate,
  Trash2,
} from "lucide-react";

import { PageDialog } from "@/components/pages/PageDialog";
import { EditPageDialog } from "@/components/pages/EditPageDialog";
import { DeletePageDialog } from "@/components/pages/DeletePageDialog";
import { getAdminPages } from "@/lib/pages";

export default async function PagesPage() {
  const pages = await getAdminPages();

  const totalPages = pages.length;

  const publishedPages = pages.filter((page) => page.published).length;

  const draftPages = totalPages - publishedPages;

  const stats = [
    {
      label: "Toplam Sayfa",
      value: totalPages,
      icon: FileText,
      iconColor: "text-[#183350]",
      iconBackground: "bg-[#183350]/10",
    },
    {
      label: "Yayındaki Sayfalar",
      value: publishedPages,
      icon: CheckCircle2,
      iconColor: "text-emerald-600",
      iconBackground: "bg-emerald-500/10",
    },
    {
      label: "Taslak Sayfalar",
      value: draftPages,
      icon: Clock3,
      iconColor: "text-amber-600",
      iconBackground: "bg-amber-500/10",
    },
  ];

  function formatDate(value: string | Date) {
    return new Intl.DateTimeFormat("tr-TR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  }

  return (
    <main className="min-w-0 space-y-7 pb-10">
      {/* Breadcrumb */}
      <nav
        aria-label="Sayfa yolu"
        className="flex items-center gap-2 text-sm text-muted-foreground"
      >
        <Link
          href="/dashboard"
          className="transition-colors hover:text-[#346872]"
        >
          Kontrol Merkezi
        </Link>

        <span className="text-muted-foreground/50">/</span>

        <span className="font-medium text-foreground">Sayfa Yönetimi</span>
      </nav>

      {/* Üst başlık */}
      <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2">
            <span className="size-2 rounded-full bg-[#346872]" />

            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#346872]">
              İçerik Yönetimi
            </span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Sayfa Yönetimi
          </h1>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Web sitenizin sayfalarını oluşturun, düzenleyin ve yayın durumlarını
            yönetin.
          </p>
        </div>

        {/* Sayfa işlemleri */}
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <Link
            href="/pages/trash"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted"
          >
            <Trash2 className="size-4" />
            Çöp Kutusu
          </Link>

          <PageDialog mode="create" />
        </div>
      </header>

      {/* İstatistikler */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface p-5"
            >
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>

                <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                  {stat.value}
                </p>
              </div>

              <div
                className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${stat.iconBackground} ${stat.iconColor}`}
              >
                <Icon className="size-5" />
              </div>
            </div>
          );
        })}
      </section>

      {/* Sayfa listesi */}
      <section className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="flex flex-col gap-3 border-b border-border px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Tüm Sayfalar
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              Toplam {totalPages} sayfa bulunuyor.
            </p>
          </div>

          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-surface-muted px-3 py-1.5 text-xs font-medium text-[#346872]">
            <LayoutTemplate className="size-3.5" />
            Sayfa Listesi
          </span>
        </div>

        {totalPages === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
            <div className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-[#346872]/10 text-[#346872]">
              <FileText className="size-8" />
            </div>

            <h3 className="text-lg font-semibold text-foreground">
              Henüz sayfa oluşturulmamış
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Web sitenizin içeriklerini yönetmek için ilk sayfanızı
              oluşturabilirsiniz.
            </p>

            <div className="mt-6">
              <PageDialog mode="create" />
            </div>
          </div>
        ) : (
          <>
            {/* Masaüstü tablo */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[700px] text-left">
                <thead className="bg-surface-muted/60">
                  <tr className="border-b border-border">
                    <th className="px-6 py-4 text-xs font-semibold text-muted-foreground">
                      Sayfa
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold text-muted-foreground">
                      Durum
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold text-muted-foreground">
                      Oluşturulma
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground">
                      İşlem
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {pages.map((page) => (
                    <tr
                      key={page.id}
                      className="border-b border-border/70 transition-colors last:border-b-0 hover:bg-surface-muted/40"
                    >
                      {/* Sayfa bilgileri */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#346872]/10 text-[#346872]">
                            <FileText className="size-4" />
                          </div>

                          <div className="min-w-0">
                            <p className="font-medium text-foreground">
                              {page.title}
                            </p>

                            <p className="mt-1 break-all text-xs text-muted-foreground">
                              /{page.slug}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Yayın durumu */}
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                            page.published
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                              : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                          }`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${
                              page.published ? "bg-emerald-500" : "bg-amber-500"
                            }`}
                          />

                          {page.published ? "Yayında" : "Taslak"}
                        </span>
                      </td>

                      {/* Oluşturulma tarihi */}
                      <td className="px-6 py-5 text-sm text-muted-foreground">
                        {formatDate(page.createdAt)}
                      </td>

                      {/* Düzenleme ve silme işlemleri */}
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <EditPageDialog pageId={page.id} />

                          <DeletePageDialog
                            pageId={page.id}
                            pageTitle={page.title}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobil kartlar */}
            <div className="divide-y divide-border md:hidden">
              {pages.map((page) => (
                <div key={page.id} className="space-y-4 p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#346872]/10 text-[#346872]">
                      <FileText className="size-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="break-words font-semibold text-foreground">
                        {page.title}
                      </h3>

                      <p className="mt-1 break-all text-xs text-muted-foreground">
                        /{page.slug}
                      </p>
                    </div>
                  </div>

                  {/* Durum ve tarih */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                        page.published
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                          : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                      }`}
                    >
                      {page.published ? "Yayında" : "Taslak"}
                    </span>

                    <span className="text-xs text-muted-foreground">
                      {formatDate(page.createdAt)}
                    </span>
                  </div>

                  {/* Düzenleme ve silme işlemleri */}
                  <div className="flex flex-col gap-2">
                    <EditPageDialog pageId={page.id} mobile />

                    <DeletePageDialog pageId={page.id} pageTitle={page.title} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
