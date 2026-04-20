import { expect, test as baseTest } from "./pom-fixture";
import CommonUtilis from "../utilis/commonUtilis";

type CommonFixtures = {
  commonUtilis: CommonUtilis;
};

export const test = baseTest.extend<CommonFixtures>({
  commonUtilis: async ({}, use) => {
    await use(new CommonUtilis());
  },
});

export { expect };
