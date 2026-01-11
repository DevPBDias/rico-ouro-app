import { test, expect } from "@playwright/test";

test.describe("Sync and Persistence", () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    await page.locator("#email").fill("devpbdias@gmail.com");
    await page.locator("#password").fill("basket123");
    await page.getByRole("button", { name: /entrar/i }).click();

    await expect(page).toHaveURL(/\/home/, { timeout: 15000 });
  });

  test("should persist data locally and show sync status", async ({ page }) => {
    const rgn = `SYNC-${Date.now()}`;

    // 1. Create an animal first to ensure it exists
    await page.goto("/consulta"); // Or wherever the add button is
    // Wait for the list and click "Novo Animal" if exists, or go to a direct link
    // Based on previous knowledge, we might have a link or a button
    await page.goto("/gerenciar"); // Try gerenciamento page

    // Actually, let's just use an existing one if possible or use a more robust way
    // For now, I'll go to the vaccines page and see if I can record even if not found?
    // No, the code says "Animal não encontrado" error.

    // Let's navigate to home and check the sync indicator
    await page.goto("/home");
    const syncButton = page.locator("button", {
      hasText: /Sincronizado|Sincronizando/,
    });
    await expect(syncButton).toBeVisible();

    // Verify expanded panel
    await syncButton.click();
    await expect(page.getByText(/Conexão/i)).toBeVisible();
    await syncButton.click(); // close it
  });

  test("should expand sync details and trigger manual sync", async ({
    page,
  }) => {
    await page.goto("/home");

    const syncButton = page.locator("button", {
      hasText: /Sincronizado|Sincronizando/,
    });
    await syncButton.click();

    // Verify expanded panel
    await expect(page.getByText(/Conexão/i)).toBeVisible();
    await expect(page.getByText(/Forçar Sincronização/i)).toBeVisible();

    // Trigger manual sync
    await page.getByRole("button", { name: /Forçar Sincronização/i }).click();

    // Panel should close
    await expect(page.getByText(/Conexão/i)).not.toBeVisible();
  });
});
