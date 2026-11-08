import { expect, test } from "@playwright/test";

import { adminApi } from "../api";
import { API_URL, RUN } from "../env";

// Mağaza modülü kapalıysa (COMMERCE_ENABLED=false) bu testler atlanır
test.beforeAll(async () => {
  const features = (await (await fetch(`${API_URL}/features`)).json()) as { commerce: boolean };
  test.skip(!features.commerce, "Mağaza modülü kapalı");
});

const categoryName = `E2E Peynirler ${RUN}`;
const categorySlug = `e2e-peynirler-${RUN}`;
const productName = `E2E Tulum Peyniri ${RUN}`;
const productSlug = `e2e-tulum-peyniri-${RUN}`;

test.afterAll(async () => {
  const api = await adminApi();
  const products = await api.get<{ items: { id: string; slug: string }[] }>(`/admin/shop/products?q=${RUN}`);
  for (const p of products.data.items) await api.del(`/admin/shop/products/${p.id}`);
  const categories = await api.get<{ id: string; slug: string }[]>("/admin/shop/categories");
  for (const c of categories.data.filter((c) => c.slug.endsWith(RUN))) await api.del(`/admin/shop/categories/${c.id}`);
});

test("Dashboard'da Mağaza grubu görünür", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Mağaza" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Ürün Yönetimi/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Kategori Yönetimi/ })).toBeVisible();
});

test("Kategori eklenir, adres otomatik oluşur", async ({ page }) => {
  await page.goto("/shop/categories");
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Kategori Ekle" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.locator("input[name=name]").fill(categoryName);
  await expect(dialog.locator("input[name=slug]")).toHaveValue(categorySlug);
  await dialog.getByRole("button", { name: "Kategoriyi Kaydet" }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByText(`/${categorySlug} · 0 ürün`)).toBeVisible();

  const shop = (await (await fetch(`${API_URL}/shop/categories`)).json()) as { slug: string }[];
  expect(shop.some((c) => c.slug === categorySlug)).toBe(true);
});

test("Ürün oluşturulur, düzenlenir, gizlenince sitede görünmez", async ({ page }) => {
  await page.goto("/shop/products/new");
  await page.waitForLoadState("networkidle");
  await page.locator("input[name=name]").fill(productName);
  await expect(page.locator("input[name=slug]")).toHaveValue(productSlug);
  await page.locator("select[name=categoryId]").selectOption({ label: categoryName });
  await page.locator("input[name=unit]").fill("500 g");
  await page.locator("input[name=price]").fill("249,90");

  // Eski fiyat satış fiyatından düşük olamaz
  await page.locator("input[name=compareAtPrice]").fill("199");
  await page.getByRole("button", { name: "Ürünü Oluştur" }).click();
  await expect(page.getByText("Eski fiyat, satış fiyatından yüksek olmalıdır.")).toBeVisible();
  await page.locator("input[name=compareAtPrice]").fill("299,90");

  await page.locator("input[name=stock]").fill("3");
  await page.getByRole("button", { name: "Sekme Ekle" }).click();
  await page.locator("input[name='tabs.0.title']").fill("Hikaye");
  await page.locator("textarea[name='tabs.0.body']").fill("Geleneksel yöntemlerle.");
  await page.getByRole("button", { name: "Ürünü Oluştur" }).click();

  await expect(page).toHaveURL(/\/shop\/products\/[0-9a-f-]{36}\?yeni=1/);
  await expect(page.getByText("Ürün oluşturuldu.")).toBeVisible();

  let product = (await (await fetch(`${API_URL}/shop/products/${productSlug}`)).json()) as Record<string, unknown>;
  expect(product).toMatchObject({ price: "249.90", compareAtPrice: "299.90", unit: "500 g", inStock: true, tabs: [{ title: "Hikaye", body: "Geleneksel yöntemlerle." }] });
  expect(product).not.toHaveProperty("stock");

  // Fiyat güncelle
  await page.waitForLoadState("networkidle");
  await page.locator("input[name=price]").fill("199,90");
  await page.getByRole("button", { name: "Ürünü Kaydet" }).click();
  await expect(page.getByText("Kaydedildi")).toBeVisible();
  product = (await (await fetch(`${API_URL}/shop/products/${productSlug}`)).json()) as Record<string, unknown>;
  expect(product.price).toBe("199.90");

  // Listede stoğu azalan olarak görünür
  await page.goto(`/shop/products?durum=low-stock&q=${RUN}`);
  await expect(page.getByRole("link", { name: new RegExp(productName) })).toBeVisible();

  // Gizle → sitede 404
  await page.getByRole("link", { name: new RegExp(productName) }).click();
  await page.waitForLoadState("networkidle");
  await page.getByRole("switch", { name: "Yayında" }).first().click();
  await page.getByRole("button", { name: "Ürünü Kaydet" }).click();
  await expect(page.getByText("Kaydedildi")).toBeVisible();
  expect((await fetch(`${API_URL}/shop/products/${productSlug}`)).status).toBe(404);
});

test("Mağaza API'si: yetkisiz yazma 401, aşırı limit 400, bilinmeyen alan 400", async () => {
  expect((await fetch(`${API_URL}/admin/shop/products`, { method: "POST" })).status).toBe(401);
  expect((await fetch(`${API_URL}/shop/products?limit=1000`)).status).toBe(400);
  const api = await adminApi();
  const res = await api.post("/admin/shop/products", { name: "X", slug: `x-${RUN}`, price: 1, isAdmin: true });
  expect(res.status).toBe(400);
});
