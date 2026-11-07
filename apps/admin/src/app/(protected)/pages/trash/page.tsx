import { FileText, Trash2 } from "lucide-react";
import { AreaShell } from "@/components/areas/AreaShell";
import { getDeletedPages } from "@/lib/pages";
import { RestorePageButton } from "@/components/pages/RestorePageButton";

export default async function TrashPage() {
  const pages = await getDeletedPages();

  return (
    <AreaShell
      icon={Trash2}
      title="Çöp Kutusu"
      description="Çöp kutusuna taşınan sayfalar sitede görünmez ama kaybolmaz. “Geri Yükle” ile sayfa tüm bölümleriyle birlikte eski haline döner."
    >
      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="mb-5 flex items-center gap-3">
          <Trash2 className="size-5 text-muted-foreground" />
          <h2 className="font-semibold text-foreground">
            Silinen Sayfalar ({pages.length})
          </h2>
        </div>

        {pages.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <FileText className="size-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Çöp kutusunda henüz sayfa bulunmuyor.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {pages.map((page) => (
              <div
                key={page.id}
                className="flex flex-wrap items-center justify-between gap-4 py-4"
              >
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{page.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    /{page.slug}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="rounded-md border border-border px-3 py-1 text-xs text-muted-foreground">
                    Silindi
                  </span>

                  <RestorePageButton pageId={page.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AreaShell>
  );
}
