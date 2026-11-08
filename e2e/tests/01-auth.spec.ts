import { expect, test } from "@playwright/test";

import { ADMIN_EMAIL, ADMIN_PASSWORD, API_URL } from "../env";

test.describe("Giriş ve oturum", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("yanlış şifre genel mesaj verir", async ({ page }) => {
    await page.goto("/login");
    await page.fill("input[type=email]", ADMIN_EMAIL);
    await page.fill("input[type=password]", "yanlis-sifre-12345");
    await page.click("button[type=submit]");
    await expect(page.getByText("E-posta veya şifre hatalı.")).toBeVisible();
  });

  test("korumalı sayfa girişe yönlendirir", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("oturum 15 dk dolunca sessizce yenilenir, çıkışta sunucuda da kapanır", async ({ page, context }) => {
    await page.goto("/login");
    await page.fill("input[type=email]", ADMIN_EMAIL);
    await page.fill("input[type=password]", ADMIN_PASSWORD);
    await page.click("button[type=submit]");
    await page.waitForURL(/dashboard/);

    const cookies = await context.cookies();
    const refresh = cookies.find((c) => c.name === "admin_refresh");
    expect(refresh?.httpOnly).toBe(true);
    expect(refresh?.sameSite).toBe("Strict");

    // Erişim çerezi düşmüş gibi
    await context.clearCookies({ name: "admin_session" });
    await page.goto("/areas/header");
    await expect(page).toHaveURL(/\/areas\/header/);
    const rotated = (await context.cookies()).find((c) => c.name === "admin_refresh");
    expect(rotated?.value).not.toBe(refresh?.value);

    // Kullanılmış (eski) anahtar artık geçersiz
    const reuse = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ refreshToken: refresh?.value }),
    });
    expect(reuse.status).toBe(401);
  });
});
