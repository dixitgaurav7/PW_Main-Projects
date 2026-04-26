import { expect, test as baseTest } from "./pom-fixture";
import CommonUtilis from "../utilis/commonUtilis";
import CommonAPIUtilis from "../utilis/commonAPIUtilis";

type CommonFixtures = {
  commonUtilis: CommonUtilis;
  commonAPIUtilis: CommonAPIUtilis;
};

export const test = baseTest.extend<CommonFixtures>({
  commonUtilis: async ({}, use) => {
    await use(new CommonUtilis());
  },
  commonAPIUtilis: async ({request}, use) => {
    await use(new CommonAPIUtilis(request));
  },
});

export { expect };
