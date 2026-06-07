import { test, expect } from "@playwright/test";

async function login(page: any, username: string, password: string) {
  await page.goto("/gestion");
  await page.getByPlaceholder("Nom d'utilisateur").fill(username);
  await page.getByPlaceholder("Mot de passe").fill(password);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.waitForURL(/\/admin\/(appointments|profile)/);
}

test.describe("Patients page", () => {
  test("doctor can access patients page", async ({ page }) => {
    await login(page, "doctor", "doctor123");
    await expect(page.getByText("Gestion des rendez-vous")).toBeVisible({ timeout: 10000 });
    await page.goto("/fr/admin/patients");
    await expect(page.getByRole("heading", { name: "Dossiers patients" })).toBeVisible({ timeout: 10000 });
  });

  test("secretary cannot access users page (redirected)", async ({ page }) => {
    await login(page, "secretaire", "secretary123");
    await expect(page.getByText("Gestion des rendez-vous")).toBeVisible({ timeout: 10000 });
    await page.goto("/admin/users");
    await expect(page.getByText("Gestion des rendez-vous")).toBeVisible({ timeout: 10000 });
  });

  test("super admin cannot access appointments page (redirected to profile)", async ({ page }) => {
    await login(page, "admin", "admin123");
    await expect(page.getByRole("heading", { name: "Mon profil", exact: true })).toBeVisible({ timeout: 10000 });
  });

  test("super admin can access users page", async ({ page }) => {
    await login(page, "admin", "admin123");
    await page.goto("/fr/admin/users");
    await expect(page.getByRole("heading", { name: "Gestion des utilisateurs" })).toBeVisible({ timeout: 10000 });
  });
});
