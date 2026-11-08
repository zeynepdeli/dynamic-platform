import { expect, test } from "@playwright/test";

test("Dashboard: tüm gruplar ve kutucuklar", async ({ page }) => {
  await page.goto("/dashboard");
  for (const name of ["Site Geneli", "Modüller", "Ana Sayfa Yönetimi"]) {
    await expect(page.getByRole("heading", { name, exact: false }).first()).toBeVisible();
  }
  for (const tile of ["Header Yönetimi", "Footer Yönetimi", "Site Arka Planı", "Tema Renkleri", "SEO Yönetimi", "Gelen Mesajlar", "SSS Yönetimi", "İletişim Yönetimi", "Galeri Yönetimi"]) {
    await expect(page.getByRole("link", { name: new RegExp(tile) }).first()).toBeVisible();
  }
});

test("Header: dış site bağlantısı reddedilir", async ({ page }) => {
  await page.goto("/areas/header");
  await page.waitForLoadState("networkidle");
  const text = page.locator("input[name=headerButtonText]");
  await text.fill((await text.inputValue()) === "Teklif Al" ? "Teklif İste" : "Teklif Al");
  await page.locator("input[name=headerButtonHref]").fill("https://evil.example.com");
  await page.getByRole("button", { name: "Header Ayarlarını Kaydet" }).click();
  await expect(page.getByText("/ ile başlayan site içi bir adres girin")).toBeVisible();
  await page.locator("input[name=headerButtonHref]").fill("/iletisim");
  await page.getByRole("button", { name: "Header Ayarlarını Kaydet" }).click();
  await expect(page.getByText("Kaydedildi")).toBeVisible();
});

test("SEO: Analytics alanına kod yazılamaz", async ({ page }) => {
  await page.goto("/areas/seo");
  await page.locator("input[name=gaMeasurementId]").fill("<script>alert(1)</script>");
  await page.getByRole("button", { name: "SEO Ayarlarını Kaydet" }).click();
  await expect(page.getByText("Ölçüm kimliği G-XXXXXXX biçiminde olmalı.")).toBeVisible();
});

test("Kaydedilmemiş değişiklik uyarısı", async ({ page }) => {
  await page.goto("/areas/theme");
  // Form hidrasyonu bitmeden yazılan değer React'e ulaşmaz (özellikle dev modunda ilk derleme)
  await page.waitForLoadState("networkidle");
  const field = page.getByRole("textbox").first();
  await field.fill((await field.inputValue()).toLowerCase() === "#123456" ? "#654321" : "#123456");
  await expect(page.getByRole("button", { name: "Renkleri Kaydet" })).toBeEnabled();
  let warned = false;
  page.once("dialog", async (d) => {
    warned = true;
    await d.dismiss();
  });
  await page.getByRole("link", { name: "Dashboard" }).first().click();
  await page.waitForTimeout(500);
  expect(warned).toBe(true);
  await expect(page).toHaveURL(/\/areas\/theme/);
});

test("Eski adresler yeni yerlerine yönlenir", async ({ page }) => {
  for (const [from, to] of [["/menu", "/areas/header"], ["/settings", "/areas/footer"], ["/hero-slides", "/pages/home/slider"]]) {
    await page.goto(from);
    await expect(page).toHaveURL(new RegExp(`${to}$`));
  }
});
