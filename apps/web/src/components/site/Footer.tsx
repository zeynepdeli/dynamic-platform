import { Mail, MapPin, Phone } from "lucide-react";

import { safeHttpsUrl, safeMailto, safeTel } from "@/core/safe";
import type { FooterSettings, SiteSettings, SocialLink } from "@/core/types";
import { getIcon } from "./icons";

// ✏️ MÜŞTERİYE ÖZEL: Footer tasarımı
export function Footer({
  footer,
  settings,
  socialLinks,
}: {
  footer: FooterSettings;
  settings: SiteSettings;
  socialLinks: SocialLink[];
}) {
  if (!footer.enabled) return null;

  const email = safeMailto(footer.email);
  const tel = safeTel(footer.phone);
  // Yalnızca whitelist'teki ikonlar + doğrulanmış https adresleri
  const socials = socialLinks.flatMap((link) => {
    const entry = getIcon("social", link.icon);
    const href = safeHttpsUrl(link.url);
    return entry && href
      ? [{ id: link.id, href, label: link.label || entry.label, Icon: entry.Icon }]
      : [];
  });

  return (
    <footer className="mt-auto bg-primary text-on-primary">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div className="space-y-3">
          <p className="text-lg font-semibold">{settings.siteName}</p>
          {footer.description && (
            <p className="text-sm leading-6 opacity-80">{footer.description}</p>
          )}
        </div>

        <ul className="space-y-3 text-sm">
          {footer.email && (
            <li className="flex items-center gap-2">
              <Mail className="size-4 shrink-0 opacity-70" />
              {email ? <a href={email} className="hover:underline">{footer.email}</a> : footer.email}
            </li>
          )}
          {footer.phone && (
            <li className="flex items-center gap-2">
              <Phone className="size-4 shrink-0 opacity-70" />
              {tel ? <a href={tel} className="hover:underline">{footer.phone}</a> : footer.phone}
            </li>
          )}
          {footer.address && (
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 opacity-70" />
              <span className="whitespace-pre-line">{footer.address}</span>
            </li>
          )}
        </ul>

        {socials.length > 0 && (
          <ul className="flex flex-wrap gap-3 md:justify-end">
            {socials.map((social) => (
              <li key={social.id}>
                {/* Harici bağlantı: noopener + noreferrer (tabnabbing koruması) */}
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  title={social.label}
                  className="inline-flex size-10 items-center justify-center rounded-full border border-white/20 transition hover:bg-white/10"
                >
                  <social.Icon className="size-[18px]" />
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      {footer.copyright && (
        <p className="border-t border-white/10 px-4 py-5 text-center text-xs opacity-70">
          {footer.copyright}
        </p>
      )}
    </footer>
  );
}
