import Link from "next/link";
import { ChevronDown } from "lucide-react";

import { buildMenuTree } from "@/core/site";
import { safeImageSrc, safeInternalHref } from "@/core/safe";
import type { MenuItem, SiteSettings } from "@/core/types";

import { MobileMenu } from "./MobileMenu";
import { SmartLink } from "./SmartLink";

type HeaderProps = {
  settings: SiteSettings;
  menuItems: MenuItem[];
};

// ✏️ MÜŞTERİYE ÖZEL: Header tasarımını buradan değiştirin.
export function Header({ settings, menuItems }: HeaderProps) {
  const tree = buildMenuTree(menuItems);
  const logo = safeImageSrc(settings.logoUrl);

  return (
    <header className="sticky top-0 z-40 bg-primary text-on-primary shadow-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-3 font-semibold">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logo}
              alt={settings.siteName}
              className="h-9 w-auto max-w-40 object-contain"
            />
          ) : (
            <span className="truncate text-lg">{settings.siteName}</span>
          )}
        </Link>

        {/* Masaüstü menü */}
        <nav aria-label="Ana menü" className="ml-auto hidden md:block">
          <ul className="flex items-center gap-1">
            {tree.map((item) => (
              <li key={item.id} className="group relative">
                <SmartLink
                  href={item.href}
                  className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium opacity-90 transition hover:bg-white/10 hover:opacity-100"
                >
                  {item.label}
                  {item.children.length > 0 && <ChevronDown className="size-3.5" />}
                </SmartLink>

                {item.children.length > 0 && (
                  <ul className="invisible absolute right-0 top-full min-w-48 rounded-xl bg-white p-2 text-gray-800 opacity-0 shadow-lg transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                    {item.children.map((child) => (
                      <li key={child.id}>
                        <SmartLink
                          href={child.href}
                          className="block rounded-lg px-3 py-2 text-sm hover:bg-gray-100"
                        >
                          {child.label}
                        </SmartLink>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* İstemciye yalnızca doğrulanmış bağlantılar gönderilir */}
        <MobileMenu
          tree={tree
            .filter((item) => safeInternalHref(item.href))
            .map((item) => ({
              ...item,
              children: item.children.filter((c) => safeInternalHref(c.href)),
            }))}
        />
      </div>
    </header>
  );
}
