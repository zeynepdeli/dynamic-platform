import { Images } from "lucide-react";

import { AreaShell } from "@/components/areas/AreaShell";
import { MediaLibrary } from "@/components/media/MediaLibrary";
import { getAdminMedia } from "@/lib/media";
import { getMediaBaseUrl } from "@/lib/media-base-url";

export default async function MediaPage() {
  const files = await getAdminMedia();
  const unused = files.filter((file) => !file.inUse).length;

  return (
    <AreaShell
      icon={Images}
      title="Medya Kütüphanesi"
      description={`Sitede kullanılan tüm görseller. ${files.length} görsel · ${unused} tanesi kullanılmıyor. Kullanımdaki bir görsel silinemez.`}
    >
      <MediaLibrary files={files} mediaBaseUrl={getMediaBaseUrl()} />
    </AreaShell>
  );
}
