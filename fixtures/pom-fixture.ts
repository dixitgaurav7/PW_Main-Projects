import { expect, test as baseTest } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { DashboardPage } from "../pages/DashboardPage";
import { UserPage } from "../pages/UserPage";

type PomFixtureType = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  userPage:UserPage
};

export const test = baseTest.extend<PomFixtureType>({
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
});

export { expect };
