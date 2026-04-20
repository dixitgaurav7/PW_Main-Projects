import { expect, test as baseTest } from './common-fixture';

type HooksFixtureType = {
    gotoUrl: void;
    logout: void;
}

export const test = baseTest.extend<HooksFixtureType>({
    gotoUrl: async ({ loginPage }, use) => {
        await loginPage.gotoOrangeHrm();
        await use();

    },
    logout: async ({ userPage }, use) => {
        await use();
        await userPage.logout();
    }
});

export { expect };

