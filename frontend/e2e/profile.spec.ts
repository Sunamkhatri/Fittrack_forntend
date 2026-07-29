import { test, expect } from "@playwright/test";
import { signUpAndLogin } from "./helpers";

test.describe("Profile", () => {
  test.beforeEach(async ({ page }) => {
    await signUpAndLogin(page);
    await page.goto("/profile");
  });

  test("form is populated from the signed-in user", async ({ page }) => {
    await expect(page.locator("#prof-firstName")).toHaveValue("Play");
    await expect(page.locator("#prof-lastName")).toHaveValue("Wright");
  });

  test("saves a profile change and it survives a reload", async ({ page }) => {
    await page.fill("#prof-firstName", "Renamed");
    await page.fill("#prof-weight", "81");
    await page.getByRole("button", { name: /save changes/i }).click();

    // Re-reads from the API rather than trusting the optimistic UI.
    await page.reload();
    await expect(page.locator("#prof-firstName")).toHaveValue("Renamed");
    await expect(page.locator("#prof-weight")).toHaveValue("81");
  });

  test("the renamed user is reflected on the dashboard", async ({ page }) => {
    await page.fill("#prof-firstName", "Renamed");
    await page.getByRole("button", { name: /save changes/i }).click();

    await page.goto("/dashboard");
    await expect(page.getByText(/Renamed/).first()).toBeVisible();
  });

  test("rejects a password change with the wrong current password", async ({
    page,
  }) => {
    await page.fill("#prof-currentPassword", "DefinitelyWrong1");
    await page.fill("#prof-newPassword", "BrandNewPass1");
    await page.fill("#prof-confirmPassword", "BrandNewPass1");
    await page.getByRole("button", { name: /update password/i }).click();

    // Must stay put and say something, not silently no-op.
    await expect(page).toHaveURL(/\/profile/);
    await expect(page.locator("body")).not.toContainText(/internal server error/i);
  });

  test("rejects a password change when confirmation does not match", async ({
    page,
  }) => {
    await page.fill("#prof-currentPassword", "Test1234");
    await page.fill("#prof-newPassword", "BrandNewPass1");
    await page.fill("#prof-confirmPassword", "SomethingElse1");
    await page.getByRole("button", { name: /update password/i }).click();

    await expect(page).toHaveURL(/\/profile/);
  });

  test("never surfaces a raw node error code to the user", async ({ page }) => {
    // Guards the fix in af6cc8e — transport failures used to render
    // "read ECONNRESET" straight into the form.
    await page.fill("#prof-firstName", "Renamed");
    await page.getByRole("button", { name: /save changes/i }).click();

    await expect(page.locator("body")).not.toContainText(/ECONNRESET|ECONNREFUSED/);
  });
});
