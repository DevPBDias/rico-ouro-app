import { test, expect } from "@playwright/test";

test.describe("Animal Management", () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    await page.locator("#email").fill("devpbdias@gmail.com");
    await page.locator("#password").fill("basket123");
    await page.getByRole("button", { name: /entrar/i }).click();

    await expect(page).toHaveURL(/\/home/, { timeout: 15000 });
  });

  test("should register a new animal and find it in search", async ({
    page,
  }) => {
    const rgn = `E2E-${Date.now()}`;

    // 1. Go to Registration page
    await page.goto("/cadastro");
    await page.waitForLoadState("networkidle");

    // 2. Fill form
    await page.locator('input[name="rgn"]').fill(rgn);

    // Select Sexo using text-based clicking for shadcn/ui Select
    await page.click("text=Selecione o sexo");
    await page.waitForSelector("text=Macho");
    await page.click("text=Macho");

    // 3. Submit
    await page.getByRole("button", { name: /Cadastrar/i }).click();

    // 4. Should redirect to Consulta
    await expect(page).toHaveURL(/\/consulta/, { timeout: 20000 });

    // 5. Search for the animal
    const searchInput = page.locator("#search-animal");
    await searchInput.fill(rgn);

    // Wait for search result debounce (300ms) + local DB
    await page.waitForTimeout(1500);

    await expect(page.getByText(/Animal encontrado:/i)).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText(rgn)).toBeVisible();

    // 6. Click on animal to view details
    await page.getByText(rgn).first().click();

    // 7. Verify we are in details view
    await expect(page.getByText(/Voltar para busca/i)).toBeVisible({
      timeout: 5000,
    });
    // Check for the RGN in the details header
    await expect(page.locator("p", { hasText: rgn })).toBeVisible();
  });
});
