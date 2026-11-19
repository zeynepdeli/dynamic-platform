import Link from "next/link";
import { Newspaper, Plus } from "lucide-react";

import { AreaCard, AreaShell } from "@/components/areas/AreaShell";
import { PostList } from "@/components/blog/PostList";
import { image } from "@/components/visual/preview/safe";
import { getMediaBaseUrl } from "@/lib/media-base-url";
import { getAdminPosts, postStatus } from "@/lib/posts";

const dateFormat = new Intl.DateTimeFormat("tr-TR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Istanbul",
});

export default async function BlogPage() {
  const posts = await getAdminPosts();
  const mediaBaseUrl = getMediaBaseUrl();

  return (
    <AreaShell
      icon={Newspaper}
      title="Blog / Haberler"
      description="Yazılar sitede /blog adresinde listelenir. Menüye eklemek için Header Yönetimi'nden /blog linki verin."
      actions={
        <Link
          href="/blog/new"
          className="inline-flex items-center gap-2 rounded-full bg-(--brand-primary) px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-(--brand-primary)/90"
        >
          <Plus className="size-4" />
          Yeni Yazı
        </Link>
      }
    >
      <AreaCard title="Yazılar" hint={`${posts.length} yazı · en yeni üstte`}>
        <PostList
          posts={posts.map((p) => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            category: p.category,
            thumb: image(p.coverImageUrl, mediaBaseUrl) ?? null,
            status: postStatus(p),
            date: p.publishedAt ? dateFormat.format(new Date(p.publishedAt)) : null,
          }))}
        />
      </AreaCard>
    </AreaShell>
  );
}
