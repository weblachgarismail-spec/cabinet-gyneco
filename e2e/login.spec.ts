import { test, expect } from "@playwright/test";

test.describe("Admin login", () => {
  test("redirects to gestion page when accessing admin without auth", async ({ page }) => {
    await page.goto("/fr/admin/appointments");
    await expect(page).toHaveURL(/\/gestion/);
  });

  test("logs in with valid credentials and sees admin nav", async ({ page }) => {
    await page.goto("/gestion");
    await page.fill('input[placeholder="Nom d\'utilisateur"]', "secretaire");
    await page.fill('input[placeholder="Mot de passe"]', "secretary123");
    await page.click('button:has-text("Se connecter")');
    await expect(page.locator("text=Gestion des rendez-vous")).toBeVisible({ timeout: 10000 });
  });

  test("shows error on wrong password", async ({ page }) => {
    await page.goto("/gestion");
    await page.fill('input[placeholder="Nom d\'utilisateur"]', "secretaire");
    await page.fill('input[placeholder="Mot de passe"]', "wrongpass");
    await page.click('button:has-text("Se connecter")');
    await expect(page.locator("text=Identifiants incorrects")).toBeVisible();
  });
});
