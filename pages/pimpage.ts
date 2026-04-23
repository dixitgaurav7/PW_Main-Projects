import {Page,Locator} from '@playwright/test';
export class PIMPage{
    readonly page!:Page;
    readonly pimLink!:Locator;
    readonly orangeHrmLogo!:Locator;
    readonly leftNavigation!:Locator;
    constructor(page:Page){
        this.page=page;
        this.pimLink=page.getByRole('link',{name:'PIM'});
        this.orangeHrmLogo=page.locator('.oxd-brand-banner img');
        this.leftNavigation=page.locator('.oxd-sidepanel-body nav');
        
    }

    async openPimModule(){
        await Promise.all([
            this.page.waitForURL(/\/web\/index\.php\/pim\//, { timeout: 15000 }),
            this.pimLink.click(),
        ]);
    }

}
