import { notFound } from "next/navigation";

import { BlockScreen } from "@/components/pages/BlockScreen";
import type { Selection } from "@/components/visual/VisualPageEditor";

// Adres → blok (yalnızca bu dört değer kabul edilir)
const BLOCKS: Record<string, Selection> = {
  slider: "hero",
  bilgiler: "page",
  "arka-plan": "background",
  "yeni-bolum": "new",
};

export default async function BlockPage({ params }: { params: Promise<{ id: string; block: string }> }) {
  const { id, block } = await params;
  if (!Object.hasOwn(BLOCKS, block)) notFound();
  return <BlockScreen id={id} block={BLOCKS[block]} />;
}
