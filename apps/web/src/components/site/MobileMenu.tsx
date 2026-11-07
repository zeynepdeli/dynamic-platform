"use client";

import { MenuIcon } from "./icons";
import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import type { MenuNode } from "@/core/types";

// Bağlantılar sunucuda (Header) doğrulandıktan sonra buraya gelir;
// yine de "/" ile başlamayanları çizme.
const isInternal = (href: string) => href.startsWith("/") && !href.startsWith("//");

// ✏️ MÜŞTERİYE ÖZEL: Mobil menü tasarımı
export function MobileMenu({ tree }: { tree: MenuNode[] }) {
  const [open, setOpen] = useState(false);
  // Bir bağlantıya tıklanınca menüyü kapat
  const close = () => setOpen(false);

  return (
    <div className="ml-auto md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex size-10 items-center justify-center rounded-lg hover:bg-white/10"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {open && (
        <nav
          id="mobile-menu"
          aria-label="Mobil menü"
          className="absolute inset-x-0 top-16 border-t border-white/10 bg-primary px-4 pb-6 pt-2 shadow-lg"
        >
          <ul className="space-y-1">
            {tree.map((item) => (
              <li key={item.id}>
                {isInternal(item.href) ? (
                  <Link href={item.href} onClick={close} className="flex items-center gap-2 rounded-lg px-3 py-3 font-medium hover:bg-white/10">
                    <MenuIcon icon={item.icon} className="size-4" />
                    {item.label}
                  </Link>
                ) : (
                  <span className="block px-3 py-3 font-medium">{item.label}</span>
                )}
                {item.children.length > 0 && (
                  <ul className="ml-4 border-l border-white/20 pl-2">
                    {item.children.filter((c) => isInternal(c.href)).map((child) => (
                      <li key={child.id}>
                        <Link href={child.href} onClick={close} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm opacity-90 hover:bg-white/10">
                          <MenuIcon icon={child.icon} className="size-4" />
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
