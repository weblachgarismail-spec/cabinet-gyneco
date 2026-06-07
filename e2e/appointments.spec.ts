import { test, expect } from "@playwright/test";

test.describe("Appointments (walk-in)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/gestion");
    await page.getByPlaceholder("Nom d'utilisateur").fill("secretaire");
    await page.getByPlaceholder("Mot de passe").fill("secretary123");
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(page.getByText("Gestion des rendez-vous")).toBeVisible({ timeout: 10000 });
  });

  test("creates a walk-in appointment", async ({ page }) => {
    await page.getByRole("button", { name: "Ajouter un patient sans RDV" }).click();
    await expect(page.getByRole("heading", { name: "Nouveau patient" })).toBeVisible();

    const modalContent = page.locator(".w-full.max-w-md");
    await modalContent.getByPlaceholder("Nom complet").fill("Test Patient E2E");
    await modalContent.getByPlaceholder(/T.l.phone/).fill("0611223344");
    await modalContent.getByPlaceholder("Email").fill("test@patient.e2e");
    await modalContent.getByPlaceholder("Ville").fill("Casablanca");
    await modalContent.getByPlaceholder("CNIE / Passeport").fill("AB123456");

    await modalContent.locator("select").selectOption("CONSULTATION");
    await modalContent.getByRole("button", { name: "Ajouter" }).click();

    await expect(page.getByRole("cell", { name: "Test Patient E2E" }).first()).toBeVisible({ timeout: 10000 });
  });
});
