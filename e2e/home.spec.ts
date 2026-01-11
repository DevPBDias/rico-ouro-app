import { test, expect } from "@playwright/test";

// These tests require authentication - they use a logged-in state
test.describe("Home Page (Authenticated)", () => {
  // Before each test, log in first
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    // Login with valid credentials
    await page.locator("#email").fill("devpbdias@gmail.com");
    await page.locator("#password").fill("basket123");
    await page.getByRole("button", { name: /entrar/i }).click();

    // Wait for redirect to home
    await expect(page).toHaveURL(/\/home/, { timeout: 15000 });
  });

  test("should display the home page with navigation buttons", async ({
    page,
  }) => {
    // Check for main navigation buttons (use text content since they might not be <a> links)
    await expect(page.getByText(/consulta/i).first()).toBeVisible();
    await expect(page.getByText(/matrizes/i).first()).toBeVisible();
    await expect(page.getByText(/vacinas/i).first()).toBeVisible();
  });

  test("should display animal statistics", async ({ page }) => {
    // Check for statistics section
    await expect(page.getByText(/total animais/i)).toBeVisible();
    await expect(page.getByText(/machos/i).first()).toBeVisible();
    await expect(page.getByText(/fêmeas/i).first()).toBeVisible();
  });

  test("should navigate to consulta page", async ({ page }) => {
    // Click on Consulta navigation
    await page
      .getByText(/consulta/i)
      .first()
      .click();

    await expect(page).toHaveURL(/\/consulta/);
  });
});
