import { notFound } from "next/navigation";
import { z } from "zod";

import { BlockScreen } from "@/components/pages/BlockScreen";

export default async function SectionPage({ params }: { params: Promise<{ id: string; sectionId: string }> }) {
  const { id, sectionId } = await params;
  if (!z.uuid().safeParse(sectionId).success) notFound();
  return <BlockScreen id={id} block={`s:${sectionId}`} />;
}
