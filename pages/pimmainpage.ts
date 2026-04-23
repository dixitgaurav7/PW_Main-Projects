import {Page,Locator} from '@playwright/test';
export class PimMainpage{
    readonly page!: Page;
    readonly addPimButton!:Locator;
    readonly firstNameTextBox!:Locator;
    readonly middleNameTextBox!:Locator;
    readonly lastNameTextBox!:Locator;
    readonly employeeIdTextBox!:Locator;
    readonly saveButton!:Locator;

    constructor(page:Page){
        this.page=page;
        this.addPimButton=page.getByRole("button", { name: "Add" });
        this.firstNameTextBox=page.locator("//input[@placeholder='First Name']");
        this.middleNameTextBox=page.locator("//input[@placeholder='Middle Name']");
        this.lastNameTextBox=page.locator("//input[@placeholder='Last Name']");
        this.employeeIdTextBox=page.locator("//label[normalize-space()='Employee Id']/../following-sibling::div/input");
        this.saveButton=page.getByRole("button", { name: "Save" });
    }

    employeeNameHeading(employeeName:string):Locator {
        return this.page.getByRole("heading", { name: employeeName, exact: true });
    }

    async addEmployee(fname:string,mname:string,lname:string, employeeId = Date.now().toString().slice(-8))
    {
        await this.addPimButton.waitFor({ state: "visible" });
        await this.addPimButton.click();
        await this.firstNameTextBox.fill(fname);
        await this.middleNameTextBox.fill(mname);
        await this.lastNameTextBox.fill(lname);
        await this.employeeIdTextBox.fill(employeeId);
        await Promise.all([
            this.page.waitForURL(/\/web\/index\.php\/pim\/viewPersonalDetails\/empNumber\/\d+/, { timeout: 30000 }),
            this.saveButton.click(),
        ]);
    }
}
