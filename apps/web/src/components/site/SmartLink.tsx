import Link from "next/link";

import { safeInternalHref } from "@/core/safe";

type SmartLinkProps = {
  href: string | null | undefined;
  className?: string;
  children: React.ReactNode;
};

/**
 * Admin'den gelen site içi bağlantı. Doğrulamadan geçmezse link çizilmez,
 * yalnızca içerik (span) gösterilir — açık yönlendirme / javascript: imkânsız.
 */
export function SmartLink({ href, className, children }: SmartLinkProps) {
  const safe = safeInternalHref(href);
  if (!safe) return <span className={className}>{children}</span>;

  return (
    <Link href={safe} className={className}>
      {children}
    </Link>
  );
}
