import process from 'node:process';
import {test,expect} from '../../fixtures/hooks-fixture';
import loginmoduledata from '../../test-data/ui-data/login-module-data.json';
test.use({storageState:{
cookies:[],
origins:[]
}
})

test('Login verify that the user cannot log in with an invalid password',async({gotoUrl,loginPage,commonUtilis})=>{
   const username= commonUtilis.decryptData(process.env.USER_NAME ?? "");
   //await gotoUrl.goToLoginPage();
    await loginPage.loginOrangeHRM(username,loginmoduledata.wrong_password);
    await expect (loginPage.errorPopup).toHaveText(loginmoduledata.invalid_credentials_text);
    await expect(loginPage.userNameInput).toBeVisible();

});

test('Login verify that the user cannot log in with an invalid username',async({gotoUrl,loginPage,commonUtilis})=>{
   const password= commonUtilis.decryptData(process.env.PASSWORD ?? "");
   //await gotoUrl.goToLoginPage();
    await loginPage.loginOrangeHRM(loginmoduledata.wrong_username,password);
    await expect (loginPage.errorPopup).toHaveText(loginmoduledata.invalid_credentials_text);
    await expect(loginPage.userNameInput).toBeVisible();

});

test('Login verify that the user cannot log in with an invalid username and password',async({gotoUrl,loginPage,commonUtilis})=>{
   //await gotoUrl.goToLoginPage();
    await loginPage.loginOrangeHRM(loginmoduledata.wrong_username,loginmoduledata.wrong_password);
    await expect (loginPage.errorPopup).toHaveText(loginmoduledata.invalid_credentials_text);
    await expect(loginPage.userNameInput).toBeVisible();

});

test('Login verify that the user can log in with valid credentials',{
    tag:['@VISUAL', '@UAT'],
    annotation:{
        type:'Test Case Link',
        description:'Link'
    }
},async({gotoUrl, loginPage, commonUtilis,pimpage})=>{
   const username= commonUtilis.decryptData(process.env.USER_NAME ?? "");
    const password= commonUtilis.decryptData(process.env.PASSWORD ?? "");
   //await gotoUrl.goToLoginPage();
    await loginPage.loginOrangeHRM(username, password);
   await expect(pimpage.orangeHrmLogo).toHaveScreenshot('orange HRM.png');

});
