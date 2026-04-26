import { expect, test as baseTest } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { DashboardPage } from "../pages/DashboardPage";
import { UserPage } from "../pages/UserPage";
import { PIMPage } from "../pages/pimpage";
import { PimMainpage } from "../pages/pimmainpage";
import fs from "fs";
import path from "path";

type PomFixtureType = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  userPage:UserPage;
  pimpage:PIMPage;
  pimMainPage:PimMainpage;
  takeScreenshotOnFailure: void;
};

export const test = baseTest.extend<PomFixtureType>({
  takeScreenshotOnFailure: [
    async ({ page }, use, testInfo) => {
      await use();
      if (testInfo.status !== testInfo.expectedStatus) {
        const screenshotDir = path.join(process.cwd(), "screenshots");
        if (!fs.existsSync(screenshotDir)) {
          fs.mkdirSync(screenshotDir, { recursive: true });
        }
        const screenshotPath = path.join(
          screenshotDir,
          `${testInfo.title.replace(/[^a-zA-Z0-9]/g, "_")}-${Date.now()}.png`
        );
        // Note: checking if page is available as API tests may not have a page
        if (page) {
          await page.screenshot({ path: screenshotPath, fullPage: true });
        }
      }
    },
    { auto: true },
  ],
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  userPage: async ({ page }, use) => {
    await use(new UserPage(page));
  },
  pimpage: async ({ page }, use) => {
    await use(new PIMPage(page));
  },
  pimMainPage: async ({ page }, use) => {
    await use(new PimMainpage(page));
  },
});

export { expect };
