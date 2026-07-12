import { expect, test, type Locator, type Page } from "@playwright/test";
import { detailedCall, longUnbrokenText, mockDashboardApi } from "./support/mockDashboardApi";

const auditViewports = [
  { name: "320px", width: 320, height: 568 },
  { name: "360px", width: 360, height: 640 },
  { name: "375px", width: 375, height: 667 },
  { name: "390px", width: 390, height: 844 },
  { name: "414px", width: 414, height: 896 },
  { name: "768px", width: 768, height: 1024 },
];

const sessionNamePattern = /Responsive Test Agent/;

function captureUnexpectedConsoleErrors(page: Page) {
  const errors: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(message.text());
    }
  });
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));

  return errors;
}

async function loadDashboard(page: Page, options: { showWelcome?: boolean } = {}) {
  await mockDashboardApi(page, options);
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Call Center Dashboard" })).toBeVisible();
  await expect(page.locator(".call-card").first()).toBeVisible();
}

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => {
    return {
      viewportWidth: document.documentElement.clientWidth,
      contentWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
    };
  });

  expect(dimensions.contentWidth).toBeLessThanOrEqual(dimensions.viewportWidth + 1);
}

async function expectWithinViewport(page: Page, locator: Locator) {
  await expect(locator).toBeVisible();
  const box = await locator.boundingBox();
  const viewport = page.viewportSize();

  expect(box).not.toBeNull();
  expect(viewport).not.toBeNull();

  if (!box || !viewport) {
    return;
  }

  expect(box.x).toBeGreaterThanOrEqual(-1);
  expect(box.y).toBeGreaterThanOrEqual(-1);
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);
  expect(box.y + box.height).toBeLessThanOrEqual(viewport.height + 1);
}

async function expectScrollableContentReachable(locator: Locator) {
  const metrics = await locator.evaluate((element) => {
    return {
      clientHeight: element.clientHeight,
      overflowY: getComputedStyle(element).overflowY,
      scrollHeight: element.scrollHeight,
    };
  });

  if (metrics.scrollHeight <= metrics.clientHeight + 1) {
    return;
  }

  expect(["auto", "scroll"]).toContain(metrics.overflowY);
  const scrollTop = await locator.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
    return element.scrollTop;
  });
  expect(scrollTop).toBeGreaterThan(0);
}

async function expectBodyScrollLocked(page: Page, isLocked: boolean) {
  if (isLocked) {
    await expect(page.locator("body")).toHaveClass(/is-scroll-locked/);
    return;
  }

  await expect(page.locator("body")).not.toHaveClass(/is-scroll-locked/);
}

async function expectNoConsoleErrors(page: Page, errors: string[]) {
  await page.waitForTimeout(100);
  expect(errors).toEqual([]);
}

for (const viewport of auditViewports) {
  test(`dashboard chrome stays within the viewport at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    const consoleErrors = captureUnexpectedConsoleErrors(page);
    await loadDashboard(page);

    await expectWithinViewport(page, page.getByLabel("Email verification notice"));
    const pagination = page.locator(".pagination-controls").first();
    await pagination.evaluate((element) => element.scrollIntoView({ block: "center" }));
    await expectWithinViewport(page, pagination);
    await expectWithinViewport(page, page.getByRole("button", { name: "Open account settings" }));
    await expectNoHorizontalOverflow(page);
    await expectNoConsoleErrors(page, consoleErrors);
  });
}

test("important overlays remain usable on an iPhone SE viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  const consoleErrors = captureUnexpectedConsoleErrors(page);
  await loadDashboard(page, { showWelcome: true });

  const welcomeDialog = page.getByRole("dialog", {
    name: "Welcome to your call center dashboard",
  });
  await expectWithinViewport(page, welcomeDialog);
  await expectBodyScrollLocked(page, true);
  await page.getByRole("button", { name: "Not now" }).click();
  await expectBodyScrollLocked(page, false);

  await page.getByRole("button", { name: "Resend email" }).click();
  const toast = page.locator(".toast");
  await expect(toast).toBeVisible();
  await toast.locator(".toast-message").evaluate((element, text) => {
    element.textContent = text;
  }, longUnbrokenText);
  await expectWithinViewport(page, toast);
  await expectWithinViewport(page, page.getByRole("button", { name: "Dismiss notification" }));
  await expectNoHorizontalOverflow(page);
  await page.getByRole("button", { name: "Dismiss notification" }).click();

  await page.getByRole("button", { name: "Open account settings" }).click();
  const drawer = page.getByRole("dialog", { name: sessionNamePattern });
  await expectWithinViewport(page, drawer);
  await expectBodyScrollLocked(page, true);
  await expectWithinViewport(page, page.getByRole("button", { name: "Close account settings" }));
  await page.getByRole("button", { name: /Tutorials/ }).click();
  await expectScrollableContentReachable(drawer);
  await page.getByRole("button", { name: "Logout" }).scrollIntoViewIfNeeded();
  await expectWithinViewport(page, page.getByRole("button", { name: "Logout" }));
  await page.keyboard.press("Escape");
  await expectBodyScrollLocked(page, false);

  await page.getByRole("button", { name: "Open filters" }).click();
  const filterDialog = page.getByRole("dialog", { name: "Filter Calls" });
  await expectWithinViewport(page, filterDialog);
  await expectBodyScrollLocked(page, true);
  await page.getByRole("button", { name: "Date Range" }).click();
  const dateRangeCalendar = page.locator(".date-range-calendar");
  await dateRangeCalendar.scrollIntoViewIfNeeded();
  await expectWithinViewport(page, dateRangeCalendar);
  await expectScrollableContentReachable(filterDialog);
  const confirmFilters = page.getByRole("button", { name: "Confirm filters" });
  await confirmFilters.scrollIntoViewIfNeeded();
  await expectWithinViewport(page, confirmFilters);
  await confirmFilters.click();
  await expectBodyScrollLocked(page, false);

  await page.locator(".call-card").first().click();
  const callDetails = page.getByRole("dialog", { name: "Selected Call Info:" });
  await expectWithinViewport(page, callDetails);
  await expectBodyScrollLocked(page, true);
  const fromValue = callDetails.locator("tr").filter({ hasText: "From:" }).locator("td");
  await expect(fromValue).toHaveText(detailedCall.from);
  const longNote = page.getByText(longUnbrokenText, { exact: true });
  await expect(longNote).toBeAttached();
  await longNote.scrollIntoViewIfNeeded();
  await expect(longNote).toBeInViewport();
  await expectNoHorizontalOverflow(page);
  await expectScrollableContentReachable(callDetails);
  const deleteButton = page.getByRole("button", { name: "Delete call" });
  await deleteButton.scrollIntoViewIfNeeded();
  await expectWithinViewport(page, deleteButton);
  await deleteButton.click();

  const deleteDialog = page.getByRole("dialog", { name: "Delete this call?" });
  await deleteDialog.locator(".confirm-message").evaluate((element, text) => {
    element.textContent = text;
  }, longUnbrokenText);
  await expectWithinViewport(page, deleteDialog);
  await expectNoHorizontalOverflow(page);
  await deleteDialog.locator(".confirm-actions").getByRole("button", { name: "Cancel" }).click();
  await expectBodyScrollLocked(page, true);
  await page.getByRole("button", { name: "Close call details" }).click();
  await expectBodyScrollLocked(page, false);

  const resetButton = page.getByRole("button", { name: "Reset calls to sample data" });
  await resetButton.scrollIntoViewIfNeeded();
  await resetButton.click();
  const resetDialog = page.getByRole("dialog", { name: "Reset calls?" });
  await expectWithinViewport(page, resetDialog);
  await expectWithinViewport(page, resetDialog.getByRole("button", { name: "Reset calls" }));
  await resetDialog.locator(".confirm-actions").getByRole("button", { name: "Cancel" }).click();
  await expectBodyScrollLocked(page, false);

  await expectNoHorizontalOverflow(page);
  await expectNoConsoleErrors(page, consoleErrors);
});

test("tall dialogs remain scrollable in mobile landscape", async ({ page }) => {
  await page.setViewportSize({ width: 667, height: 375 });
  const consoleErrors = captureUnexpectedConsoleErrors(page);
  await loadDashboard(page);

  await page.getByRole("button", { name: "Open filters" }).click();
  const filterDialog = page.getByRole("dialog", { name: "Filter Calls" });
  await page.getByRole("button", { name: "Date Range" }).click();
  await expectWithinViewport(page, filterDialog);
  await expectScrollableContentReachable(filterDialog);
  await page.getByRole("button", { name: "Close filter modal" }).click();

  await page.locator(".call-card").first().click();
  const detailsDialog = page.getByRole("dialog", { name: "Selected Call Info:" });
  await expectWithinViewport(page, detailsDialog);
  await expectScrollableContentReachable(detailsDialog);
  const archiveButton = page.getByRole("button", { name: "Archive call" });
  await archiveButton.scrollIntoViewIfNeeded();
  await expectWithinViewport(page, archiveButton);
  await page.getByRole("button", { name: "Close call details" }).click();

  await expectNoHorizontalOverflow(page);
  await expectNoConsoleErrors(page, consoleErrors);
});

test("the tutorial panel remains usable on a Pixel 7 viewport", async ({ page }) => {
  await page.setViewportSize({ width: 412, height: 915 });
  const consoleErrors = captureUnexpectedConsoleErrors(page);
  await loadDashboard(page);

  await page.getByRole("button", { name: "Open account settings" }).click();
  await page.getByRole("button", { name: /Tutorials/ }).click();
  await page.getByRole("button", { name: /UI Not started/ }).click();

  const tutorialPanel = page.getByRole("dialog", { name: "Understand the layout" });
  await expectWithinViewport(page, tutorialPanel);
  await expectWithinViewport(page, tutorialPanel.getByRole("button", { name: "Skip" }));
  await expectBodyScrollLocked(page, false);
  await expectNoHorizontalOverflow(page);
  await tutorialPanel.getByRole("button", { name: "Skip" }).click();
  await expectNoConsoleErrors(page, consoleErrors);
});
