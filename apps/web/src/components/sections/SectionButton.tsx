import Link from "next/link";

import { safeInternalHref } from "@/core/safe";

/** Metni ve doğrulanmış bağlantısı olan buton; biri eksikse hiç çizilmez */
export function SectionButton({
  text,
  href,
  variant = "secondary",
}: {
  text: string | null;
  href: string | null;
  variant?: "secondary" | "primary" | "outline";
}) {
  const safe = safeInternalHref(href);
  if (!text || !safe) return null;

  const styles = {
    secondary: "bg-secondary text-on-secondary",
    primary: "bg-primary text-on-primary",
    outline: "border border-current",
  }[variant];

  return (
    <Link
      href={safe}
      className={`inline-flex w-fit items-center rounded-xl px-6 py-3 font-semibold shadow-sm transition hover:opacity-90 ${styles}`}
    >
      {text}
    </Link>
  );
}
