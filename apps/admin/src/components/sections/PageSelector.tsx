"use client";

import { useRouter } from "next/navigation";

type PageSelectorProps = {
  pages: { id: string; title: string }[];
  selectedPageId: string | null;
};

// Hangi sayfanın bölümleri düzenlenecek? (boş = ana sayfa)
export function PageSelector({ pages, selectedPageId }: PageSelectorProps) {
  const router = useRouter();

  return (
    <label className="flex flex-col gap-2 text-sm font-medium sm:flex-row sm:items-center">
      Sayfa:
      <select
        value={selectedPageId ?? ""}
        onChange={(event) => {
          const id = event.target.value;
          router.push(id ? `/sections?page=${encodeURIComponent(id)}` : "/sections");
        }}
        className="min-h-11 rounded-xl border border-border bg-surface px-3 text-sm"
      >
        <option value="">Ana Sayfa</option>
        {pages.map((page) => (
          <option key={page.id} value={page.id}>
            {page.title}
          </option>
        ))}
      </select>
    </label>
  );
}
