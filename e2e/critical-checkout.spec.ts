import { expect, test } from "@playwright/test";

test("flujo crítico: catálogo -> checkout -> pedido visible en admin", async ({ page }) => {
  const customerName = `Cliente E2E ${Date.now()}`;

  await page.goto("/");

  await page.getByRole("button", { name: "Agregar" }).first().click();
  await page.getByRole("link", { name: "Ir al checkout" }).click();

  await page.getByPlaceholder("Nombre").fill(customerName);
  await page.getByPlaceholder("Teléfono").fill("1122334455");
  await page.getByPlaceholder("Dirección").fill("Calle QA 123");
  await page.getByPlaceholder("Notas").fill("Pedido de prueba e2e");
  await page.getByRole("button", { name: "Enviar pedido por WhatsApp" }).click();

  await expect(page.getByRole("link", { name: "Abrir WhatsApp" })).toBeVisible();

  await page.goto("/admin/login");
  await page.getByPlaceholder("Email").fill("admin@local.dev");
  await page.getByPlaceholder("Contraseña").fill("admin123");
  await page.getByRole("button", { name: "Ingresar" }).click();
  await page.waitForURL("**/admin/dashboard");

  await page.goto("/admin/pedidos");

  const orderCustomer = page.getByText(customerName, { exact: false });
  await expect(orderCustomer).toBeVisible({ timeout: 30_000 });
});

