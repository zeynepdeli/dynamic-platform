"use client";

import Link from "next/link";
import { ImageIcon } from "lucide-react";

import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";
import { deletePostAction } from "@/app/actions/posts";

export type PostRow = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  thumb: string | null;
  status: "draft" | "scheduled" | "live";
  date: string | null;
};

const STATUS: Record<PostRow["status"], { label: string; className: string }> = {
  live: { label: "Yayında", className: "bg-emerald-500/10 text-emerald-700" },
  scheduled: { label: "Zamanlandı", className: "bg-sky-500/10 text-sky-700" },
  draft: { label: "Taslak", className: "bg-amber-500/10 text-amber-700" },
};

export function PostList({ posts }: { posts: PostRow[] }) {
  if (posts.length === 0) {
    return (
      <p className="rounded-2xl border-2 border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        Henüz yazı yok. &ldquo;Yeni Yazı&rdquo; ile ilk yazınızı ekleyin.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border rounded-2xl border border-border">
      {posts.map((post) => {
        const status = STATUS[post.status];
        return (
          <li key={post.id} className="flex items-center gap-4 p-3 sm:p-4">
            <Link href={`/blog/${post.id}`} className="flex min-w-0 flex-1 items-center gap-4 hover:text-(--brand-accent)">
              {post.thumb ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.thumb} alt="" className="size-14 shrink-0 rounded-lg object-cover" />
              ) : (
                <span className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-surface-muted">
                  <ImageIcon className="size-5 text-muted-foreground" />
                </span>
              )}
              <span className="min-w-0">
                <span className="block truncate font-semibold">{post.title}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  /blog/{post.slug}
                  {post.category && ` · ${post.category}`}
                  {post.date && ` · ${post.date}`}
                </span>
              </span>
            </Link>
            <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${status.className}`}>
              {status.label}
            </span>
            <ConfirmDeleteDialog
              title="Yazıyı sil"
              description={
                <>
                  <strong>{post.title}</strong> kalıcı olarak silinecek.
                </>
              }
              onConfirm={() => deletePostAction(post.id)}
            />
          </li>
        );
      })}
    </ul>
  );
}
