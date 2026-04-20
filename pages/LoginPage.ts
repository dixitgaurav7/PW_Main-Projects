import { Locator, Page } from "@playwright/test";

/*export const ORANGE_HRM_LOGIN_URL =
  "https://opensource-demo.orangehrmlive.com/web/index.php/auth/login";
//export const ORANGE_HRM_DASHBOARD_URL =
  "https://opensource-demo.orangehrmlive.com/web/index.php/dashboard/index";*/

export class LoginPage {
  readonly page: Page;
  readonly userNameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButtonInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.userNameInput = page.getByRole("textbox", { name: "Username" });
    this.passwordInput = page.getByRole("textbox", { name: "Password" });
    this.loginButtonInput = page.getByRole("button", { name: "Login" });
  }

  async gotoOrangeHrm() {
    const baseUrl =
      process.env.BASE_URL ?? "https://opensource-demo.orangehrmlive.com/";

    await this.page.goto(new URL("/web/index.php/auth/login", baseUrl).toString());
  }

  /* Login to Orange HRM
   *@param username - The username to login
   *@param password - The password to login
*/
  async loginOrangeHRM(username: string, password: string) {
    await this.userNameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButtonInput.click();
  }

 
}
