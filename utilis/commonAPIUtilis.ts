import { APIRequestContext } from "@playwright/test";
import bookingData from "../test-data/api-data/api-path-data.json";
import CommonUtilis from "./commonUtilis";


export default class commonAPIUtilis {
    private request: APIRequestContext;
    private apiURL: string = "";

    constructor(request: APIRequestContext) {
        this.request = request;
    }

    public async createToken() {
        const commonUtilsObj = new CommonUtilis();
        const apiUserName = commonUtilsObj.decryptData(process.env.API_USER_NAME ?? "");
        const apiPassword = commonUtilsObj.decryptData(process.env.API_PASSWORD ?? "");

        const createTokenResponse = await this.request.post(bookingData.auth_path, {
            data: {
                username: apiUserName,
                password: apiPassword
            }
        });
        const createToken = (await createTokenResponse.json()).token;
        return createToken;
    }
}
