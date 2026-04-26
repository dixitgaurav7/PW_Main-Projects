import process from "node:process";
import {test, expect} from "../../fixtures/hooks-fixture";
import PimData from '../../test-data/ui-data/pim-module-data.json'


test.describe('Pim Pgae test',async()=>{

    test('Verify that an employee successfully created in pim module',{
    tag:['@Smoke','@Regression'],
    annotation:{
        type:'Test Case Link',
        description:'Link'
    }
}, async({gotoUrl,page,loginPage,commonUtilis,dashboardPage,pimpage,pimMainPage})=>{
    test.setTimeout(90000);

    const username = commonUtilis.decryptData(process.env.USER_NAME ?? "");
    const password = commonUtilis.decryptData(process.env.PASSWORD ?? "");

    await Promise.all([
        page.waitForURL(/\/web\/index\.php\/dashboard\/index/, { timeout: 60000 }),
        loginPage.loginOrangeHRM(username, password),
    ]);
    await expect(dashboardPage.dashboardTitleText).toBeVisible({ timeout: 30000 });

    await test.step("Open PIM Module",async ()=>{
         await pimpage.openPimModule();
        
    })
    await test.step('Add Employee in PIM Module', async()=>{
    await pimMainPage.addEmployee(PimData.first_name, PimData.middle_name,PimData.last_name);

    })
    await expect(pimMainPage.firstNameTextBox).toHaveValue(PimData.first_name);
    await expect(pimMainPage.middleNameTextBox).toHaveValue(PimData.middle_name);
    await expect(pimMainPage.lastNameTextBox).toHaveValue(PimData.last_name);
});
});
