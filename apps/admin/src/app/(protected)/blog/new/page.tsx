import { Newspaper } from "lucide-react";

import { AreaCard, AreaShell } from "@/components/areas/AreaShell";
import { PostForm } from "@/components/blog/PostForm";
import { getMediaBaseUrl } from "@/lib/media-base-url";

export default function NewPostPage() {
  return (
    <AreaShell
      icon={Newspaper}
      title="Yeni Yazı"
      description="Taslak olarak kaydedip daha sonra yayına alabilirsiniz."
      back={{ href: "/blog", label: "Blog / Haberler" }}
    >
      <AreaCard title="Yazı">
        <PostForm mode="create" mediaBaseUrl={getMediaBaseUrl()} />
      </AreaCard>
    </AreaShell>
  );
}
