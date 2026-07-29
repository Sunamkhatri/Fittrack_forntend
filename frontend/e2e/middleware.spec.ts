import { test, expect } from "@playwright/test";
import { signUpAndLogin } from "./helpers";

// Exercises the edge middleware directly: these paths must be decided before
// any page component runs, so a signed-out visit should never render the shell.
test.describe("Route protection", () => {
  test("redirects an unauthenticated visitor from /dashboard to /login", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("preserves the intended destination as ?next", async ({ page }) => {
    await page.goto("/progress");
    await expect(page).toHaveURL(/\/login\?next=%2Fprogress|\/login\?next=\/progress/);
  });

  test("redirects an unauthenticated visitor from /admin to /login", async ({
    page,
  }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login/);
  });

  test("redirects an unauthenticated visitor from /profile to /login", async ({
    page,
  }) => {
    await page.goto("/profile");
    await expect(page).toHaveURL(/\/login/);
  });

  test("keeps a signed-in user away from /login", async ({ page }) => {
    await signUpAndLogin(page);

    await page.goto("/login");
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("keeps a signed-in user away from /register", async ({ page }) => {
    await signUpAndLogin(page);

    await page.goto("/register");
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("bounces a non-admin away from /admin", async ({ page }) => {
    await signUpAndLogin(page);

    await page.goto("/admin");
    // UX only — the API independently returns 403 for this user.
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
