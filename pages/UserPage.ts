import { Page, Locator } from "@playwright/test";

export class UserPage {
    readonly page!:Page;
    readonly userMenuButton!: Locator;
    readonly logOutButton!:Locator;

    constructor(page:Page){
        this.page = page;
        this.userMenuButton = page.locator('button[aria-label="User menu"]');
        this.logOutButton = page.locator('text=Log out');
    }
async logout(){
    await this.userMenuButton.click();
    await this.logOutButton.click();
}


}