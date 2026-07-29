import { test, expect } from "@playwright/test";
import {
  buildCredentials,
  registerViaUi,
  loginViaUi,
  signUpAndLogin,
} from "./helpers";

test.describe("Authentication Flow", () => {
  test("splash page navigates to login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator("#login-email")).toBeVisible();
  });

  test("login page links through to register", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: /register/i }).click();

    await expect(page).toHaveURL(/\/register/);
    await expect(page.locator("#reg-email")).toBeVisible();
  });

  test("register shows validation errors", async ({ page }) => {
    await page.goto("/register");

    // Submitting empty must not navigate — the form is client-validated.
    await page
      .getByRole("button", { name: /create account|register|sign up/i })
      .click();

    await expect(page).toHaveURL(/\/register/);
    await expect(page.locator("p.text-red-400").first()).toBeVisible();
  });

  test("register a new user", async ({ page }) => {
    const creds = buildCredentials();
    await registerViaUi(page, creds);

    // Either straight into the app or back to login — both count as success,
    // what matters is that no error surfaced.
    await expect(page).toHaveURL(/\/dashboard|\/login/, { timeout: 20_000 });
  });

  test("login validation errors", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator("p.text-red-400").first()).toBeVisible();
  });

  test("login with invalid credentials shows error", async ({ page }) => {
    await loginViaUi(page, "definitely-not-real@nowhere.com", "WrongPass123");

    // The API answers 400; the form surfaces it rather than navigating.
    await expect(page.locator("div.text-red-400")).toBeVisible({
      timeout: 15_000,
    });
    await expect(page).toHaveURL(/\/login/);
  });

  test("login with valid credentials and redirect to dashboard", async ({
    page,
  }) => {
    await signUpAndLogin(page);
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("forgot password flow", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page.locator("input[type='email']").first()).toBeVisible();

    await page.locator("input[type='email']").first().fill("nobody@nowhere.com");
    await page.getByRole("button", { name: /send|reset|submit/i }).first().click();

    // Must not reveal whether the address exists, so an unknown email still
    // reports success rather than "no such user".
    await expect(page.locator("body")).not.toContainText(
      /there is no user with that email/i
    );
  });

  test("logout", async ({ page }) => {
    await signUpAndLogin(page);

    const logout = page.getByRole("button", { name: /log ?out|sign ?out/i });
    await logout.first().click();

    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
  });

  test("session survives a page reload", async ({ page }) => {
    await signUpAndLogin(page);

    await page.reload();

    // The httpOnly cookie should keep the user in, not bounce them to login.
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
