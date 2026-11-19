import type { FieldConfig } from "@/brand/page-templates";

/**
 * Şablondaki alan ayarına göre etiketi döndürür.
 * null → alan gizli (formda hiç gösterilmez).
 */
export function fieldLabel<F extends string>(
  config: FieldConfig<F> | undefined,
  name: F,
  fallback: string,
): string | null {
  const value = config?.[name];
  if (value === false) return null;
  return typeof value === "string" && value.trim() ? value : fallback;
}

/**
 * İsteğe bağlı (opt-in) alanlar: yalnızca şablon açıkça etiket verirse görünür.
 * Böylece yeni alanlar eski bölüm türlerinin formlarını kalabalıklaştırmaz.
 */
export function optInLabel<F extends string>(config: FieldConfig<F> | undefined, name: F): string | null {
  const value = config?.[name];
  return typeof value === "string" && value.trim() ? value : null;
}
