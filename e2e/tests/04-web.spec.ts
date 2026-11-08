import { expect, test } from "@playwright/test";

import { adminApi } from "../api";
import { API_URL, RUN, WEB_URL } from "../env";

test.describe("Web sitesi", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("ana sayfa açılır, header ve footer var", async ({ page }) => {
    const res = await page.goto(WEB_URL);
    expect(res?.status()).toBe(200);
    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
  });

  test("iletişim formu: hata olunca yazılanlar kaybolmaz, mesaj admin'e düşer", async ({ page }) => {
    await page.goto(`${WEB_URL}/iletisim`);
    test.skip(!(await page.locator("#cf-message").count()), "İletişim modülü kurulu değil");
    const name = `E2E Ziyaretçi ${RUN}`;
    await page.fill("#cf-name", name);
    await page.fill("#cf-email", "gecersiz");
    await page.fill("#cf-message", "Merhaba, bu bir uçtan uca test mesajıdır.");
    await page.getByRole("button", { name: "Gönder" }).click();
    await expect(page.getByText("Geçerli bir e-posta girin.")).toBeVisible();
    await expect(page.locator("#cf-name")).toHaveValue(name);

    await page.fill("#cf-email", "e2e@example.com");
    await page.getByRole("button", { name: "Gönder" }).click();
    await expect(page.getByText("Mesajınız bize ulaştı")).toBeVisible();

    const api = await adminApi();
    const messages = await api.get<{ name: string }[]>("/admin/contact-messages");
    expect(messages.data.some((m) => m.name === name)).toBe(true);
  });

  test("bölüm başlığındaki HTML çalışmaz (XSS)", async ({ page }) => {
    const api = await adminApi();
    const payload = `<img src=x onerror="window.__xss=1">${RUN}`;
    const created = await api.post<{ id: string }>("/admin/sections", { type: "TEXT", title: payload, body: "<script>window.__xss=2</script>", active: true });
    expect(created.status).toBe(201);
    try {
      await expect(async () => {
        await page.goto(WEB_URL);
        await expect(page.getByText(payload)).toBeVisible({ timeout: 2_000 });
      }).toPass({ timeout: 30_000 });
      expect(await page.evaluate(() => (window as unknown as { __xss?: number }).__xss)).toBeUndefined();
    } finally {
      await api.del(`/admin/sections/${created.data.id}`);
    }
  });
});

test.describe("API güvenliği", () => {
  test("yetkisiz istek 401, fazladan alan 400, javascript: bağlantısı 400", async () => {
    expect((await fetch(`${API_URL}/admin/pages`)).status).toBe(401);
    const api = await adminApi();
    expect((await api.patch("/admin/site-settings", { siteName: "X", isAdmin: true })).status).toBe(400);
    expect((await api.post("/admin/menu-items", { label: "x", href: "javascript:alert(1)" })).status).toBe(400);
    expect((await api.post("/admin/social-links", { icon: "x", url: "javascript:alert(1)" })).status).toBe(400);
    expect((await api.post("/admin/sections", { type: "VIDEO", title: "v", videoUrl: "https://www.youtube.com.evil.com/watch?v=dQw4w9WgXcQ" })).status).toBe(400);
  });
});
