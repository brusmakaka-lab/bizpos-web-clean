import { expect, test } from "@playwright/test";

test("admin login mantiene sesión y no vuelve a /admin/login tras refresh", async ({ page }) => {
  await page.goto("/admin/login");

  await page.getByPlaceholder("Email").fill("admin@local.dev");
  await page.getByPlaceholder("Contraseña").fill("admin123");
  await page.getByRole("button", { name: "Ingresar" }).click();

  await page.waitForURL("**/admin/dashboard");

  await page.reload();

  await page.waitForURL("**/admin/dashboard");
  await expect(page).toHaveURL(/\/admin\/dashboard/);
});

