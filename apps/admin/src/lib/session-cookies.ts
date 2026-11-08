/**
 * Oturum çerezleri (tek yerde tanımlı).
 * - admin_session: 15 dk'lık erişim anahtarı (bitmeden 1 dk önce düşer)
 * - admin_refresh: yenileme anahtarı; proxy.ts bununla oturumu sessizce yeniler
 * İkisi de httpOnly (JS okuyamaz) + SameSite=Strict (CSRF).
 */
export const ACCESS_COOKIE = "admin_session";
export const REFRESH_COOKIE = "admin_refresh";
// API tarafındaki üst sınırla aynı (7 gün); boşta kalma süresini API uygular
export const REFRESH_MAX_AGE = 7 * 24 * 60 * 60;

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

export function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge,
  };
}

export const accessMaxAge = (expiresIn: number) => Math.max(60, expiresIn - 60);

export function isTokenPair(value: unknown): value is TokenPair {
  const v = value as Partial<TokenPair> | null;
  return (
    !!v &&
    typeof v.accessToken === "string" &&
    typeof v.refreshToken === "string" &&
    /^[A-Za-z0-9_-]{43}$/.test(v.refreshToken) &&
    typeof v.expiresIn === "number"
  );
}
