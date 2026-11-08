import { notFound } from "next/navigation";

import { getFeatures } from "@/lib/features";

/** Mağaza ekranları yalnızca API'de COMMERCE_ENABLED=true ise açılır */
export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  if (!(await getFeatures()).commerce) notFound();
  return children;
}
