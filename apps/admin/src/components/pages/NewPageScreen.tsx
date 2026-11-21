"use client";

import { useRouter } from "next/navigation";

import { PageDialog } from "./PageDialog";

/** /pages/new: form doğrudan açık gelir; vazgeçilirse sayfa listesine dönülür */
export function NewPageScreen() {
  const router = useRouter();
  return <PageDialog mode="create" initialOpen hideTrigger onClose={() => router.push("/pages")} />;
}
