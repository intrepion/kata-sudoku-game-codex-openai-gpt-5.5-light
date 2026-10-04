import { expect, test } from "@playwright/test";
import { pathToFileURL } from "node:url";

test("served app shows the Ninefold Daily scaffold", async ({ page }) => {
  await page.goto("/app.html");

  await expect(page.getByRole("heading", { name: /sudoku/i })).toBeVisible();
  await expect(page.getByText("The delivery rails are alive.")).toBeVisible();
});

test("root file launch shows the Ninefold Daily scaffold", async ({ page }) => {
  await page.goto(pathToFileURL(process.cwd() + "/index.html").toString());

  await expect(page.getByRole("heading", { name: /sudoku/i })).toBeVisible();
  await expect(page.getByText("The delivery rails are alive.")).toBeVisible();
});
