import { Page, expect } from "@playwright/test";

/** Unique per call so specs never collide on the shared database. */
export function uniqueSuffix() {
  const time = String(Date.now()).slice(-5);
  const rand = Math.random().toString(36).slice(2, 5);
  return `${time}${rand}`;
}

export function buildCredentials(suffix = uniqueSuffix()) {
  return {
    firstName: "Play",
    lastName: "Wright",
    email: `e2e${suffix}@test.com`,
    username: `e2e${suffix}`,
    password: "Test1234",
    age: "27",
    weight: "70",
  };
}

/** Registers through the real UI and lands on the dashboard. */
export async function registerViaUi(
  page: Page,
  creds = buildCredentials()
) {
  await page.goto("/register");

  await page.fill("#reg-firstName", creds.firstName);
  await page.fill("#reg-lastName", creds.lastName);
  await page.fill("#reg-email", creds.email);
  await page.fill("#reg-username", creds.username);
  await page.fill("#reg-password", creds.password);
  await page.fill("#reg-confirmPassword", creds.password);
  await page.fill("#reg-age", creds.age);
  await page.fill("#reg-weight", creds.weight);

  await page.getByRole("button", { name: /create account|register|sign up/i }).click();

  return creds;
}

export async function loginViaUi(
  page: Page,
  email: string,
  password: string
) {
  await page.goto("/login");
  await page.fill("#login-email", email);
  await page.fill("#login-password", password);
  await page.getByRole("button", { name: /sign in/i }).click();
}

/** Registers a fresh account and returns it already signed in on the dashboard. */
export async function signUpAndLogin(page: Page) {
  const creds = buildCredentials();
  await registerViaUi(page, creds);

  // Registration may drop the user on login rather than straight into the app,
  // so sign in explicitly and assert we ended up authenticated either way.
  if (!page.url().includes("/dashboard")) {
    await loginViaUi(page, creds.email, creds.password);
  }

  await expect(page).toHaveURL(/\/dashboard/, { timeout: 20_000 });
  return creds;
}
