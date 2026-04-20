import process from 'node:process';
import {test} from '../fixtures/common-fixture';
import {expect} from '@playwright/test';

test('Global setup for Auto Login', async({page,loginPage,commonUtilis,dashboardPage})=>{
    const decryptedUserName = commonUtilis.decryptData(process.env.USER_NAME ?? "");
    const decryptedPassword = commonUtilis.decryptData(process.env.PASSWORD ?? "");
    console.log("Decrypted User Name:", decryptedUserName);
    console.log("Decrypted Password:", decryptedPassword);
    await loginPage.gotoOrangeHrm();
   await loginPage.loginOrangeHRM(decryptedUserName,decryptedPassword);
   await page.waitForURL(process.env.BASE_URL+'web/index.php/dashboard/index');
   await expect(dashboardPage.dashboardTitleText).toHaveText('Dashboard');
   await page.context().storageState({path: './playwright/.auth/auth.json'});
   
})
