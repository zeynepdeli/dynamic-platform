import { readableTextColor, safeColor, safeImageSrc } from "@/core/safe";

/**
 * Sayfaya özel arka plan (admin → sayfa → "Sayfa arka planı").
 * Boşsa sitenin genel arka planı (body) görünür.
 * Renk doğrulanır, fotoğraf CSS url() yerine <img> ile verilir.
 */
export function PageBackground({
  color,
  image,
  children,
}: {
  color: string | null | undefined;
  image: string | null | undefined;
  children: React.ReactNode;
}) {
  const bg = safeColor(color);
  const img = safeImageSrc(image);

  if (!bg && !img) return <>{children}</>;

  return (
    <div className="relative isolate" style={{ backgroundColor: bg, color: readableTextColor(bg) }}>
      {img && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={img} alt="" aria-hidden="true" className="absolute inset-0 -z-10 size-full object-cover" />
      )}
      {children}
    </div>
  );
}
