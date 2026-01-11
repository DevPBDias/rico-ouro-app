import { test, expect } from "@playwright/test";

test.describe("Nascimentos Page (Births Registration)", () => {
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

  test("should display the births registration page with sex selector", async ({
    page,
  }) => {
    await page.goto("/nascimentos");
    await page.waitForLoadState("networkidle");

    // Check page header
    await expect(page.getByText(/nascimentos/i).first()).toBeVisible();

    // Check for sex selector - the initial required field
    await expect(page.locator("#sexo")).toBeVisible();

    // Other fields should NOT be visible before sex selection
    await expect(page.locator("#rgn")).not.toBeVisible();
    await expect(page.locator("#data")).not.toBeVisible();
    await expect(page.locator("#peso")).not.toBeVisible();
    await expect(page.locator("#mae")).not.toBeVisible();
  });

  test("should show additional form fields after sex selection", async ({
    page,
  }) => {
    await page.goto("/nascimentos");
    await page.waitForLoadState("networkidle");

    // Click on sex selector
    await page.locator("#sexo").click();

    // Wait for dropdown options to appear
    await page.waitForSelector('[role="listbox"]', { timeout: 5000 });

    // Select "Macho"
    await page.getByRole("option", { name: "Macho" }).click();

    // Now additional fields should appear
    await expect(page.locator("#rgn")).toBeVisible({ timeout: 5000 });
    await expect(page.locator("#data")).toBeVisible();
    await expect(page.locator("#peso")).toBeVisible();
    await expect(page.locator("#mae")).toBeVisible();
    await expect(page.locator("#cor")).toBeVisible();

    // Submit button should also be visible
    await expect(
      page.getByRole("button", { name: /Cadastrar Nascimento/i })
    ).toBeVisible();
  });

  test("should prevent form submission with empty fields", async ({ page }) => {
    await page.goto("/nascimentos");
    await page.waitForLoadState("networkidle");

    // Select sex to show the form
    await page.locator("#sexo").click();
    await page.waitForSelector('[role="listbox"]', { timeout: 5000 });
    await page.getByRole("option", { name: "Macho" }).click();

    // Wait for form fields to appear
    await expect(page.locator("#rgn")).toBeVisible({ timeout: 5000 });

    // Try to submit without filling required fields
    await page.getByRole("button", { name: /Cadastrar Nascimento/i }).click();

    // Should still be on the same page (no success modal should appear)
    await expect(page.getByText(/Sucesso/i)).not.toBeVisible();
  });

  test("should register a new birth successfully", async ({ page }) => {
    await page.goto("/nascimentos");
    await page.waitForLoadState("networkidle");

    // 1. Select sex
    await page.locator("#sexo").click();
    await page.waitForSelector('[role="listbox"]', { timeout: 5000 });
    await page.getByRole("option", { name: "Macho" }).click();

    // 2. Wait for form fields
    await expect(page.locator("#rgn")).toBeVisible({ timeout: 5000 });

    // 3. Fill the form
    const uniqueRgn = `B-${Date.now().toString().slice(-6)}`;
    const today = new Date().toISOString().split("T")[0];

    await page.locator("#rgn").fill(uniqueRgn);
    await page.locator("#data").fill(today);
    await page.locator("#peso").fill("38");
    await page.locator("#mae").fill("MAE-001");

    // 4. Submit the form
    await page.getByRole("button", { name: /Cadastrar Nascimento/i }).click();

    // 5. Wait for success modal
    await expect(page.getByText(/Sucesso/i)).toBeVisible({
      timeout: 15000,
    });

    // 6. Verify success modal buttons
    await expect(
      page.getByRole("button", { name: /Cadastrar outro/i })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Página Inicial/i })
    ).toBeVisible();
  });

  test("should reset form for another registration", async ({ page }) => {
    await page.goto("/nascimentos");
    await page.waitForLoadState("networkidle");

    // Register an animal
    await page.locator("#sexo").click();
    await page.waitForSelector('[role="listbox"]', { timeout: 5000 });
    await page.getByRole("option", { name: "Macho" }).click();

    const uniqueRgn = `B-${Date.now().toString().slice(-6)}`;
    await page.locator("#rgn").fill(uniqueRgn);
    await page.locator("#data").fill(new Date().toISOString().split("T")[0]);
    await page.locator("#peso").fill("35");
    await page.locator("#mae").fill("MAE-001");

    await page.getByRole("button", { name: /Cadastrar Nascimento/i }).click();

    // Wait for Success
    await expect(page.getByText(/Sucesso/i)).toBeVisible({ timeout: 15000 });

    // Click "Cadastrar outro"
    await page.getByRole("button", { name: /Cadastrar outro/i }).click();

    // Success modal should be gone
    await expect(page.getByText(/Sucesso/i)).not.toBeVisible();

    // Form should be reset (rgn field hidden again since sex is reset)
    await expect(page.locator("#rgn")).not.toBeVisible();
    await expect(page.locator("#sexo")).toBeVisible();
  });

  test("should navigate back to home from success modal", async ({ page }) => {
    await page.goto("/nascimentos");
    await page.waitForLoadState("networkidle");

    // Register an animal
    await page.locator("#sexo").click();
    await page.waitForSelector('[role="listbox"]', { timeout: 5000 });
    await page.getByRole("option", { name: "Macho" }).click();

    const uniqueRgn = `H-${Date.now().toString().slice(-6)}`;
    await page.locator("#rgn").fill(uniqueRgn);
    await page.locator("#data").fill(new Date().toISOString().split("T")[0]);
    await page.locator("#peso").fill("40");
    await page.locator("#mae").fill("MAE-001");

    await page.getByRole("button", { name: /Cadastrar Nascimento/i }).click();

    // Wait for Success
    await expect(page.getByText(/Sucesso/i)).toBeVisible({ timeout: 15000 });

    // Click "Página Inicial"
    await page.getByRole("button", { name: /Página Inicial/i }).click();

    // Should be on home page
    await expect(page).toHaveURL(/\/home/);
  });
});
