import { notFound } from "next/navigation";
import { Newspaper } from "lucide-react";
import { z } from "zod";

import { AreaCard, AreaShell } from "@/components/areas/AreaShell";
import { PostForm } from "@/components/blog/PostForm";
import { getMediaBaseUrl } from "@/lib/media-base-url";
import { getAdminPost, toPostFormValues } from "@/lib/posts";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const post = await getAdminPost(id);
  if (!post) notFound();

  return (
    <AreaShell
      icon={Newspaper}
      title={post.title}
      description={`Sitede: /blog/${post.slug}`}
      back={{ href: "/blog", label: "Blog / Haberler" }}
    >
      <AreaCard title="Yazı">
        <PostForm mode="edit" postId={post.id} initialValues={toPostFormValues(post)} mediaBaseUrl={getMediaBaseUrl()} />
      </AreaCard>
    </AreaShell>
  );
}
