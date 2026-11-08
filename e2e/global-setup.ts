import { chromium, type FullConfig } from "@playwright/test";
import { mkdir } from "node:fs/promises";

import { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_URL, API_URL, WEB_URL } from "./env";

/** Servisler ayakta mı, sonra bir kez giriş yap ve oturumu kaydet */
export default async function globalSetup(config: FullConfig) {
  for (const [name, url] of [["API", `${API_URL}/auth/health`], ["Admin", `${ADMIN_URL}/login`], ["Web", WEB_URL]]) {
    const ok = await fetch(url).then((r) => r.status < 500).catch(() => false);
    if (!ok) throw new Error(`${name} çalışmıyor: ${url} — önce servisleri başlatın (e2e/README.md).`);
  }

  await mkdir("e2e/.auth", { recursive: true });
  const executablePath = config.projects[0]?.use.launchOptions?.executablePath;
  const browser = await chromium.launch(executablePath ? { executablePath } : {});
  const page = await browser.newPage();
  await page.goto(`${ADMIN_URL}/login`);
  await page.fill("input[type=email]", ADMIN_EMAIL);
  await page.fill("input[type=password]", ADMIN_PASSWORD);
  await page.click("button[type=submit]");
  await page.waitForURL(/dashboard/);
  await page.context().storageState({ path: "e2e/.auth/admin.json" });
  await browser.close();
}
