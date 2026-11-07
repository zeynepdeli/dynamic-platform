import { Mail, MapPin, Phone } from "lucide-react";

import { safeHttpsUrl, safeMailto, safeTel } from "@/core/safe";
import type { FooterSettings, SiteSettings } from "@/core/types";

const SOCIALS = [
  ["instagramUrl", "Instagram"],
  ["facebookUrl", "Facebook"],
  ["linkedinUrl", "LinkedIn"],
  ["youtubeUrl", "YouTube"],
  ["githubUrl", "GitHub"],
] as const;

// ✏️ MÜŞTERİYE ÖZEL: Footer tasarımı
export function Footer({
  footer,
  settings,
}: {
  footer: FooterSettings;
  settings: SiteSettings;
}) {
  if (!footer.enabled) return null;

  const email = safeMailto(footer.email);
  const tel = safeTel(footer.phone);
  const socials = SOCIALS.map(([key, label]) => ({
    label,
    href: safeHttpsUrl(footer[key]),
  })).filter((s) => s.href);

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
              <li key={social.label}>
                {/* Harici bağlantı: noopener + noreferrer (tabnabbing koruması) */}
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex rounded-lg border border-white/20 px-3 py-2 text-sm hover:bg-white/10"
                >
                  {social.label}
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
