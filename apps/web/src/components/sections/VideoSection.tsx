import { videoEmbedSrc } from "@/core/embed";
import type { Section } from "@/core/types";

import { PlainText, SectionShell } from "./SectionShell";

// ✏️ MÜŞTERİYE ÖZEL: Video (YouTube / Vimeo)
export function VideoSection({ section }: { section: Section }) {
  const src = videoEmbedSrc(section.videoUrl);
  if (!src) return null;
  return (
    <SectionShell section={section}>
      <PlainText text={section.body} className="mb-8 max-w-3xl" />
      <div className="aspect-video w-full max-w-4xl overflow-hidden rounded-2xl bg-black shadow-lg">
        <iframe
          src={src}
          title={section.title || "Video"}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
          className="size-full"
        />
      </div>
    </SectionShell>
  );
}
