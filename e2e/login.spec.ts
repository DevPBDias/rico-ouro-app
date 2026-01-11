import { test, expect } from "@playwright/test";

test.describe("Login Page", () => {
  test("should display the login form", async ({ page }) => {
    await page.goto("/login");

    // Wait for page to fully load
    await page.waitForLoadState("networkidle");

    // Check for login form elements using ID selectors
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
    await expect(page.getByRole("button", { name: /entrar/i })).toBeVisible();
  });

  test("should show validation error for empty submission", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    // Try to submit without filling fields - HTML5 validation should prevent
    await page.getByRole("button", { name: /entrar/i }).click();

    // Should still be on login page (form validation prevents navigation)
    await expect(page).toHaveURL(/\/login/);
  });

  test("should redirect to home after successful login", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    // Fill login form with test credentials
    await page.locator("#email").fill("devpbdias@gmail.com");
    await page.locator("#password").fill("basket123");

    await page.getByRole("button", { name: /entrar/i }).click();

    // Wait for navigation to home page
    await expect(page).toHaveURL(/\/home/, { timeout: 15000 });
  });
});
