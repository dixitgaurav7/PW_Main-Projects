
import process from 'node:process';
import { expect } from "../fixtures/common-fixture";
import {test} from '../fixtures/hooks-fixture';



/*test.beforeEach('Before Each Hook', async ({ loginPage }) => {
  await loginPage.gotoOrangeHrm();
});*/

test("Login Page Test", async ({ page,gotoUrl }) => {
  //const decryptedUserName = commonUtilis.decryptData(process.env.USER_NAME ?? "");
  //const decryptedPassword = commonUtilis.decryptData(process.env.PASSWORD ?? "");
  //await loginPage.loginOrangeHRM(decryptedUserName, decryptedPassword);
  //await expect(page).toHaveURL(/dashboard/);

  console.log(await page.title());
  
});


test("Login Page Test 2", async ({ page,gotoUrl}) => {

  await expect(page).toHaveTitle('OrangeHRM');

});

test("Login Page Test 3", async ({ page,gotoUrl,logout }) => {
  await expect(page).toHaveTitle('OrangeHRM');
});
