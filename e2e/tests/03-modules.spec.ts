import { expect, test } from "@playwright/test";

import { adminApi } from "../api";
import { RUN, WEB_URL } from "../env";

/** Modül kurulu değilse kurar (menüye eklemeden) */
async function ensureModule(page: import("@playwright/test").Page, key: string) {
  await page.goto(`/modules/${key}`);
  const setup = page.getByRole("button", { name: "Modülü Kur" });
  if (await setup.isVisible().catch(() => false)) {
    await page.getByRole("checkbox").uncheck();
    await setup.click();
    await expect(setup).toBeHidden();
  }
}

test("SSS: soru eklenir ve sitede görünür", async ({ page }) => {
  await ensureModule(page, "sss");
  const card = page.locator("section", { has: page.getByRole("heading", { name: "Soru Listesi" }) });
  const question = `Test sorusu ${RUN}?`;
  await card.getByRole("button", { name: "Soru Ekle" }).click();
  const form = card.locator("form").last();
  await form.locator("input[name=title]").fill(question);
  await form.locator("textarea[name=description]").fill("Test cevabı.");
  await form.getByRole("button", { name: "Soru Ekle" }).click();
  await expect(card.getByText(question)).toBeVisible();

  await expect(async () => {
    const html = await (await fetch(`${WEB_URL}/sss`)).text();
    expect(html).toContain(question);
  }).toPass({ timeout: 30_000 });
});

test("Galeri: alt yazısız görsel eklenebilir, görselsiz öğe eklenemez", async ({ page }) => {
  await ensureModule(page, "galeri");
  const api = await adminApi();
  const url = await api.uploadPng();
  const pages = await api.get<{ id: string; slug: string }[]>("/admin/pages");
  const galeri = pages.data.find((p) => p.slug === "galeri")!;
  const sections = await api.get<{ id: string; key: string }[]>(`/admin/sections?pageId=${galeri.id}`);
  const section = sections.data.find((s) => s.key === "fotograflar")!;

  // API kuralı
  expect((await api.post(`/admin/sections/${section.id}/items`, { title: "" })).status).toBe(400);
  expect((await api.post(`/admin/sections/${section.id}/items`, { imageUrl: url })).status).toBe(201);

  // Admin formu: görsel seçmeden eklenemez
  await page.reload();
  const card = page.locator("section", { has: page.getByRole("heading", { name: "Görsel Listesi" }) });
  await expect(card.getByText("(alt yazı yok)").first()).toBeVisible();
  await card.getByRole("button", { name: "Görsel Ekle" }).click();
  await card.locator("form").last().getByRole("button", { name: "Görsel Ekle" }).click();
  await expect(card.getByText("Bir görsel seçin.")).toBeVisible();
});

test("Yeni bölüm seçicisinde modül türleri yok", async ({ page }) => {
  await page.goto("/pages/home/yeni-bolum");
  const types = await page.getByRole("radiogroup", { name: "Bölüm tipi" }).getByRole("radio").allInnerTexts();
  expect(types.map((t) => t.split("\n")[0])).toEqual(["Kart Izgarası", "Metin", "Görsel + Metin", "Çağrı Alanı", "Video", "Sayılar"]);
});
