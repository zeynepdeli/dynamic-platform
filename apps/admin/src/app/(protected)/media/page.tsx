import { Images } from "lucide-react";

import { MediaLibrary } from "@/components/media/MediaLibrary";
import { getAdminMedia } from "@/lib/media";
import { getMediaBaseUrl } from "@/lib/media-base-url";

export default async function MediaPage() {
  const files = await getAdminMedia();
  const unused = files.filter((file) => !file.inUse).length;

  return (
    <main className="min-w-0 space-y-7 pb-10">
      <header className="flex items-center gap-4">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-[#183350]/10 text-[#183350]">
          <Images className="size-6" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Medya</h1>
          <p className="text-sm text-muted-foreground">
            {files.length} görsel · {unused} tanesi kullanılmıyor
          </p>
        </div>
      </header>

      <MediaLibrary files={files} mediaBaseUrl={getMediaBaseUrl()} />
    </main>
  );
}
