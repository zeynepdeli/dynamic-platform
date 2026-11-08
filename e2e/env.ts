export const ADMIN_URL = process.env.ADMIN_URL ?? "http://localhost:3001";
export const WEB_URL = process.env.WEB_URL ?? "http://localhost:3000";
export const API_URL = process.env.API_URL ?? "http://localhost:4000";

export const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? process.env.ADMIN_EMAIL ?? "";
export const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? process.env.ADMIN_PASSWORD ?? "";

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  throw new Error("E2E_ADMIN_EMAIL ve E2E_ADMIN_PASSWORD (veya ADMIN_EMAIL/ADMIN_PASSWORD) tanımlı olmalı.");
}

/** Her çalıştırmada benzersiz isimler (testler tekrar tekrar çalışabilsin) */
export const RUN = Date.now().toString(36);
