import { expect, test } from "@playwright/test";
import { pathToFileURL } from "node:url";

test("served app shows the Ninefold Daily scaffold", async ({ page }) => {
  await page.goto("/app.html");

  await expect(page.getByRole("heading", { name: "Choose a starter puzzle." })).toBeVisible();
  await expect(page.getByRole("button", { name: "Easy" })).toBeVisible();
});

test("root file launch shows the Ninefold Daily scaffold", async ({ page }) => {
  await page.goto(pathToFileURL(process.cwd() + "/index.html").toString());

  await expect(page.getByRole("heading", { name: "Choose a starter puzzle." })).toBeVisible();
  await expect(page.getByRole("button", { name: "Easy" })).toBeVisible();
});

test("player can start a puzzle and use entries and notes", async ({ page }) => {
  await page.goto("/app.html");

  await page.getByRole("button", { name: "Easy" }).click();
  await expect(page.getByRole("heading", { name: "Easy puzzle 1" })).toBeVisible();

  const firstEditable = page.locator("[data-cell='3']");
  await firstEditable.click();
  await page.getByRole("button", { name: "1" }).click();
  await expect(firstEditable).toHaveText("1");

  await page.getByRole("button", { name: "Note mode" }).click();
  const secondEditable = page.locator("[data-cell='6']");
  await secondEditable.click();
  await page.getByRole("button", { name: "2" }).click();
  await expect(secondEditable).toContainText("2");

  await page.getByRole("button", { name: "Note mode" }).click();
  await secondEditable.click();
  await page.getByRole("button", { name: "5" }).click();
  await expect(secondEditable).toHaveAttribute("aria-invalid", "true");
});
