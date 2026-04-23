
import { expect, test } from '../fixtures/hooks-fixture';

test.beforeEach('Before Each Hook', async ({ gotoUrl }) => {
  void gotoUrl;
});

test("Login Page Test", async ({ page }) => {
  //const decryptedUserName = commonUtilis.decryptData(process.env.USER_NAME ?? "");
  //const decryptedPassword = commonUtilis.decryptData(process.env.PASSWORD ?? "");
  //await loginPage.loginOrangeHRM(decryptedUserName, decryptedPassword);
  //await expect(page).toHaveURL(/dashboard/);

  console.log(await page.title());
});

test("Login Page Test 2", async ({ page }) => {

  await expect(page).toHaveTitle('OrangeHRM');

});

test("Login Page Test 3", async ({ page }) => {
  await expect(page).toHaveTitle('OrangeHRM');
});
