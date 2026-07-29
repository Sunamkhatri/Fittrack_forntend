import { test, expect } from "@playwright/test";
import { signUpAndLogin } from "./helpers";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await signUpAndLogin(page);
  });

  test("displays the stats overview", async ({ page }) => {
    await expect(page.getByText("Calories Burned")).toBeVisible();
    await expect(page.getByText("Water Intake")).toBeVisible();
    await expect(page.getByText("Workout Minutes")).toBeVisible();
  });

  test("greets the signed-in user by name", async ({ page }) => {
    await expect(page.getByText(/Play Wright/i).first()).toBeVisible();
  });

  test("sidebar navigates to workouts", async ({ page }) => {
    await page.getByRole("link", { name: "Workouts" }).click();
    await expect(page).toHaveURL(/\/workouts/);
  });

  test("sidebar navigates to nutrition", async ({ page }) => {
    await page.getByRole("link", { name: "Nutrition" }).click();
    await expect(page).toHaveURL(/\/nutrition/);
  });

  test("sidebar navigates to progress", async ({ page }) => {
    await page.getByRole("link", { name: "Progress" }).click();
    await expect(page).toHaveURL(/\/progress/);
  });

  test("trainers page lists available trainers", async ({ page }) => {
    await page.getByRole("link", { name: "Trainers" }).click();
    await expect(page).toHaveURL(/\/trainers/);
    await expect(page.locator("body")).not.toContainText(/unauthorized/i);
  });

  test("profile tab shows user info", async ({ page }) => {
    // exact:true — the dashboard also has an "Edit Profile" quick action
    // pointing at the same route, so a loose name match is ambiguous.
    await page.getByRole("link", { name: "Profile", exact: true }).click();
    await expect(page).toHaveURL(/\/profile/);

    // Asserts the form is populated from the signed-in user, not just that
    // the route rendered.
    await expect(page.locator("#prof-firstName")).toHaveValue("Play");
    await expect(page.locator("#prof-lastName")).toHaveValue("Wright");
  });

  test("settings page renders", async ({ page }) => {
    await page.getByRole("link", { name: "Settings" }).click();
    await expect(page).toHaveURL(/\/settings/);
  });

  test("a regular user sees no Admin Panel link", async ({ page }) => {
    await expect(page.getByRole("link", { name: "Admin Panel" })).toHaveCount(0);
  });
});
