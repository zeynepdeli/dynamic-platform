import { NextResponse, type NextRequest } from "next/server";

import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  REFRESH_MAX_AGE,
  accessMaxAge,
  cookieOptions,
  isTokenPair,
} from "@/lib/session-cookies";

/**
 * Kayan oturum: erişim çerezi düştüyse (15 dk) ama yenileme çerezi varsa,
 * istek sayfaya ulaşmadan oturum sessizce yenilenir. Admin çalışırken
 * oturum kapanmaz; 8 saat hiç kullanılmazsa kapanır (API kuralı).
 */
export async function proxy(request: NextRequest) {
  const hasAccess = request.cookies.has(ACCESS_COOKIE);
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  const apiUrl = process.env.API_URL;

  if (hasAccess || !refreshToken || !apiUrl) return NextResponse.next();

  try {
    const response = await fetch(`${apiUrl}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(5000),
    });
    const data: unknown = response.ok ? await response.json() : null;

    if (!isTokenPair(data)) {
      // Geçersiz/çalınmış/süresi dolmuş: çerezi temizle, sayfa girişe yönlendirir
      const res = NextResponse.next();
      res.cookies.delete(REFRESH_COOKIE);
      return res;
    }

    // Bu isteği işleyen sayfa da yeni anahtarı görsün
    request.cookies.set(ACCESS_COOKIE, data.accessToken);
    request.cookies.set(REFRESH_COOKIE, data.refreshToken);
    const res = NextResponse.next({ request: { headers: request.headers } });
    res.cookies.set(
      ACCESS_COOKIE,
      data.accessToken,
      cookieOptions(accessMaxAge(data.expiresIn)),
    );
    res.cookies.set(
      REFRESH_COOKIE,
      data.refreshToken,
      cookieOptions(REFRESH_MAX_AGE),
    );
    return res;
  } catch {
    // API'ye ulaşılamadı: çerezlere dokunma, bir sonraki istekte tekrar dene
    return NextResponse.next();
  }
}

export const config = {
  // Statik dosyalar, giriş ve şifre sıfırlama sayfaları hariç
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|login|forgot-password|reset-password|.*\\.(?:png|jpg|svg|webp|ico)$).*)",
  ],
};
